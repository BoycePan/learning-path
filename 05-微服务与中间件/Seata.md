# Seata分布式事务

## 📌 学习目标

- 理解分布式事务问题与解决方案
- 掌握Seata核心架构（TC/TM/RM）
- 掌握AT模式的使用
- 了解TCC、Saga、XA模式
- 掌握Seata Server部署
- 掌握与Spring Cloud集成
- 了解事务分组与高可用

## ⭐ Seata核心概念

- **分布式事务** ⭐⭐⭐⭐⭐
- **AT模式** ⭐⭐⭐⭐⭐（推荐）
- **TCC模式** ⭐⭐⭐⭐
- **Saga模式** ⭐⭐⭐⭐
- **XA模式** ⭐⭐⭐
- **事务分组** ⭐⭐⭐⭐

## 1. 分布式事务问题 ⭐⭐⭐⭐⭐

### 什么是分布式事务

```
单体应用：
┌─────────────────┐
│  Order Service  │
│  ┌───────────┐  │
│  │ 数据库事务 │  │  ← 本地事务可保证ACID
│  └───────────┘  │
└─────────────────┘

微服务架构：
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   订单服务   │───→│   库存服务   │───→│   账户服务   │
│  Order DB   │    │  Stock DB   │    │  Account DB │
└─────────────┘    └─────────────┘    └─────────────┘
     ✓                  ✓                   ✗
         如何保证全部成功或全部回滚？
```

### 典型场景

```java
/**
 * 电商下单场景 ⭐⭐⭐⭐⭐
 *
 * 问题：跨多个微服务的操作如何保证一致性？
 */
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private StockClient stockClient;  // 远程服务

    @Autowired
    private AccountClient accountClient;  // 远程服务

    /**
     * 创建订单流程：
     * 1. 创建订单（本地）
     * 2. 扣减库存（远程）
     * 3. 扣减余额（远程）
     *
     * 问题：如果扣减余额失败，如何回滚已创建的订单和扣减的库存？
     */
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);

        // 2. 扣减库存
        stockClient.deduct(order.getProductId(), order.getCount());

        // 3. 扣减余额
        accountClient.deduct(order.getUserId(), order.getAmount());
        // 如果这里失败了，前面的操作如何回滚？
    }
}
```

### 传统解决方案对比

```
1. 两阶段提交（2PC）⭐⭐
   优点：强一致性
   缺点：性能差、阻塞、单点故障

2. 三阶段提交（3PC）⭐⭐
   优点：减少阻塞
   缺点：实现复杂、网络分区问题

3. 本地消息表 ⭐⭐⭐
   优点：最终一致性
   缺点：代码侵入性强

4. 消息队列 ⭐⭐⭐⭐
   优点：解耦、异步
   缺点：不适合同步场景

5. Seata（推荐）⭐⭐⭐⭐⭐
   优点：多种模式、易用、高性能
   缺点：需要额外部署TC
```

## 2. Seata架构设计 ⭐⭐⭐⭐⭐

### 三大角色

```
Seata架构：

┌────────────────────────────────────────────────┐
│                Transaction               │
│              Coordinator (TC)                  │
│              事务协调器                        │
│    - 维护全局事务状态                          │
│    - 协调事务提交/回滚                         │
└────────────────┬───────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌────▼────┐
   │   TM    │      │   RM    │
   │事务管理器│      │资源管理器│
   └─────────┘      └─────────┘

TM (Transaction Manager)：
- 定义全局事务范围
- 发起全局事务
- 提交或回滚全局事务

RM (Resource Manager)：
- 管理分支事务
- 与TC通信
- 注册分支事务
- 汇报分支事务状态
- 执行分支提交或回滚

TC (Transaction Coordinator)：
- 独立部署的服务器
- 维护全局和分支事务状态
- 驱动全局事务提交或回滚
```

### 工作流程

```
全局事务执行流程：

1. TM向TC注册全局事务
   ┌────┐     begin()      ┌────┐
   │ TM │ ───────────────→ │ TC │
   └────┘                  └────┘

2. RM向TC注册分支事务
   ┌────┐   register()    ┌────┐
   │ RM │ ───────────────→ │ TC │
   └────┘                  └────┘

3. 执行分支业务
   ┌────┐   execute()     ┌────┐
   │ RM │ ───────────────→ │ DB │
   └────┘                  └────┘

4. TM决定提交或回滚
   ┌────┐   commit()/     ┌────┐
   │ TM │   rollback()    │ TC │
   └────┘ ───────────────→└────┘

5. TC协调各RM提交或回滚
   ┌────┐    commit()/    ┌────┐
   │ TC │    rollback()   │ RM │
   └────┘ ───────────────→└────┘
```

## 3. AT模式（推荐）⭐⭐⭐⭐⭐

### AT模式原理

```
AT (Automatic Transaction) 模式：自动补偿模式

特点：
- 无侵入：基于本地ACID事务
- 自动补偿：框架自动生成反向SQL
- 高性能：一阶段直接提交
- 支持跨数据库

原理：
1. 一阶段：执行业务SQL，记录前后镜像
2. 二阶段提交：删除日志
3. 二阶段回滚：根据前镜像生成反向SQL
```

### Maven依赖

```xml
<!-- Seata Spring Boot Starter -->
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>1.7.1</version>
</dependency>

<!-- Spring Cloud Alibaba Seata -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>

<!-- MySQL驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

### 数据库准备

```sql
-- 1. 每个业务库都需要创建undo_log表（用于AT模式回滚）
CREATE TABLE `undo_log` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT(20) NOT NULL COMMENT '分支事务ID',
  `xid` VARCHAR(100) NOT NULL COMMENT '全局事务ID',
  `context` VARCHAR(128) NOT NULL COMMENT '上下文',
  `rollback_info` LONGBLOB NOT NULL COMMENT '回滚信息',
  `log_status` INT(11) NOT NULL COMMENT '状态：0-正常，1-已回滚',
  `log_created` DATETIME NOT NULL COMMENT '创建时间',
  `log_modified` DATETIME NOT NULL COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 业务表示例
-- 订单表
CREATE TABLE `orders` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `count` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'INIT'
);

-- 库存表（stock-service数据库）
CREATE TABLE `stock` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `product_id` BIGINT NOT NULL,
  `count` INT NOT NULL
);

-- 账户表（account-service数据库）
CREATE TABLE `account` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `balance` DECIMAL(10,2) NOT NULL
);
```

### 配置文件

```yaml
# application.yml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/order_db
    username: root
    password: root

# Seata配置
seata:
  # 是否启用
  enabled: true
  # 应用ID
  application-id: ${spring.application.name}
  # 事务分组（重要：必须与TC配置一致）
  tx-service-group: default_tx_group

  # 配置中心
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
      data-id: seataServer.properties

  # 注册中心
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP

  # 数据源代理
  data-source-proxy-mode: AT

  # 服务配置
  service:
    vgroup-mapping:
      # 事务分组映射到TC集群
      default_tx_group: default
    grouplist:
      default: localhost:8091
```

### AT模式使用

```java
/**
 * AT模式使用示例 ⭐⭐⭐⭐⭐
 */
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private StockClient stockClient;

    @Autowired
    private AccountClient accountClient;

    /**
     * 全局事务入口
     * @GlobalTransactional - 开启全局事务
     * name: 全局事务名称
     * rollbackFor: 回滚异常类型
     * timeoutMills: 超时时间
     */
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class,
        timeoutMills = 300000
    )
    public Long createOrder(Order order) {
        log.info("开始创建订单");

        // 1. 创建订单（本地事务）
        orderMapper.insert(order);
        log.info("订单创建成功: {}", order.getId());

        // 2. 扣减库存（远程调用，自动加入全局事务）
        stockClient.deduct(order.getProductId(), order.getCount());
        log.info("库存扣减成功");

        // 3. 扣减余额（远程调用，自动加入全局事务）
        accountClient.deduct(order.getUserId(), order.getAmount());
        log.info("余额扣减成功");

        // 如果任何步骤失败，全部自动回滚
        return order.getId();
    }
}

/**
 * 库存服务（分支事务）
 */
@Service
public class StockService {

    @Autowired
    private StockMapper stockMapper;

    /**
     * 扣减库存
     * 不需要@GlobalTransactional，自动加入全局事务
     */
    @Transactional  // 本地事务即可
    public void deduct(Long productId, Integer count) {
        Stock stock = stockMapper.selectByProductId(productId);

        if (stock == null || stock.getCount() < count) {
            throw new BusinessException("库存不足");
        }

        stock.setCount(stock.getCount() - count);
        stockMapper.updateById(stock);
    }
}

/**
 * 账户服务（分支事务）
 */
@Service
public class AccountService {

    @Autowired
    private AccountMapper accountMapper;

    /**
     * 扣减余额
     */
    @Transactional
    public void deduct(Long userId, BigDecimal amount) {
        Account account = accountMapper.selectByUserId(userId);

        if (account == null || account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountMapper.updateById(account);
    }
}
```

### AT模式执行流程

```
AT模式一阶段（提交）：

1. 解析SQL，查询前镜像
   SELECT * FROM stock WHERE product_id = 1

2. 执行业务SQL
   UPDATE stock SET count = count - 5 WHERE product_id = 1

3. 查询后镜像
   SELECT * FROM stock WHERE product_id = 1

4. 插入回滚日志（前后镜像）
   INSERT INTO undo_log (...)

5. 提交本地事务（业务数据和回滚日志在同一事务）
   COMMIT

6. 向TC注册分支事务

AT模式二阶段（提交）：

1. TC通知RM提交
2. RM异步删除undo_log
   DELETE FROM undo_log WHERE xid = ? AND branch_id = ?

AT模式二阶段（回滚）：

1. TC通知RM回滚
2. RM根据前镜像生成反向SQL
   UPDATE stock SET count = 100 WHERE product_id = 1
3. 执行反向SQL
4. 删除undo_log
```

## 4. TCC模式 ⭐⭐⭐⭐

### TCC模式原理

```
TCC (Try-Confirm-Cancel) 模式：补偿型事务

特点：
- 手动补偿：需要编写Try、Confirm、Cancel三个方法
- 无锁：不依赖数据库事务
- 高性能：适合高并发场景
- 业务侵入：需要改造业务代码

三个阶段：
1. Try：资源检查和预留
2. Confirm：执行业务操作
3. Cancel：取消操作，释放资源
```

### TCC实现

```java
/**
 * TCC模式实现 ⭐⭐⭐⭐
 */

// 1. 定义TCC接口
@LocalTCC
public interface StockTccAction {

    /**
     * Try：预留库存
     * @TwoPhaseBusinessAction：标注TCC方法
     * name：action名称
     * commitMethod：确认方法名
     * rollbackMethod：回滚方法名
     */
    @TwoPhaseBusinessAction(
        name = "stockTccAction",
        commitMethod = "commit",
        rollbackMethod = "rollback"
    )
    boolean prepare(
        @BusinessActionContextParameter(paramName = "productId") Long productId,
        @BusinessActionContextParameter(paramName = "count") Integer count
    );

    /**
     * Confirm：确认扣减
     */
    boolean commit(BusinessActionContext context);

    /**
     * Cancel：取消扣减，恢复库存
     */
    boolean rollback(BusinessActionContext context);
}

// 2. 实现TCC接口
@Service
public class StockTccActionImpl implements StockTccAction {

    @Autowired
    private StockMapper stockMapper;

    @Autowired
    private StockFreezeMapper freezeMapper;

    /**
     * Try阶段：冻结库存
     */
    @Override
    @Transactional
    public boolean prepare(Long productId, Integer count) {
        // 1. 检查库存
        Stock stock = stockMapper.selectByProductId(productId);
        if (stock.getCount() < count) {
            throw new BusinessException("库存不足");
        }

        // 2. 冻结库存（available - count, frozen + count）
        stock.setCount(stock.getCount() - count);
        stock.setFrozen(stock.getFrozen() + count);
        stockMapper.updateById(stock);

        // 3. 记录冻结信息
        StockFreeze freeze = new StockFreeze();
        freeze.setXid(RootContext.getXID());
        freeze.setProductId(productId);
        freeze.setCount(count);
        freeze.setState("TRY");
        freezeMapper.insert(freeze);

        return true;
    }

    /**
     * Confirm阶段：确认扣减
     */
    @Override
    @Transactional
    public boolean commit(BusinessActionContext context) {
        // 获取Try阶段的参数
        Long productId = Long.valueOf(context.getActionContext("productId").toString());
        Integer count = Integer.valueOf(context.getActionContext("count").toString());

        // 1. 扣减冻结库存
        Stock stock = stockMapper.selectByProductId(productId);
        stock.setFrozen(stock.getFrozen() - count);
        stockMapper.updateById(stock);

        // 2. 删除冻结记录
        freezeMapper.deleteByXid(context.getXid());

        return true;
    }

    /**
     * Cancel阶段：恢复库存
     */
    @Override
    @Transactional
    public boolean rollback(BusinessActionContext context) {
        // 1. 查询冻结记录（幂等性检查）
        StockFreeze freeze = freezeMapper.selectByXid(context.getXid());
        if (freeze == null) {
            return true;  // 已回滚，直接返回
        }

        // 2. 恢复库存
        Stock stock = stockMapper.selectByProductId(freeze.getProductId());
        stock.setCount(stock.getCount() + freeze.getCount());
        stock.setFrozen(stock.getFrozen() - freeze.getCount());
        stockMapper.updateById(stock);

        // 3. 删除冻结记录
        freezeMapper.deleteById(freeze.getId());

        return true;
    }
}

// 3. 使用TCC
@Service
public class OrderService {

    @Autowired
    private StockTccAction stockTccAction;

    @GlobalTransactional
    public void createOrder(Order order) {
        // 调用TCC接口
        stockTccAction.prepare(order.getProductId(), order.getCount());

        // 其他业务逻辑...
    }
}
```

### TCC注意事项

```java
/**
 * TCC实现注意事项 ⭐⭐⭐⭐⭐
 */

// 1. 空回滚处理
// 问题：Try阶段因网络超时未执行，但TC触发了Cancel
// 解决：Cancel中检查Try是否执行
@Override
public boolean rollback(BusinessActionContext context) {
    StockFreeze freeze = freezeMapper.selectByXid(context.getXid());
    if (freeze == null) {
        // 空回滚，记录日志防止重复
        return true;
    }
    // 正常回滚逻辑
}

// 2. 幂等性处理
// 问题：Cancel/Confirm可能重复调用
// 解决：记录执行状态
@Override
public boolean commit(BusinessActionContext context) {
    StockFreeze freeze = freezeMapper.selectByXid(context.getXid());
    if (freeze == null || "CONFIRMED".equals(freeze.getState())) {
        return true;  // 已确认，避免重复
    }
    // 执行确认逻辑
    freeze.setState("CONFIRMED");
    freezeMapper.updateById(freeze);
}

// 3. 悬挂处理
// 问题：Cancel先于Try执行
// 解决：Try中检查Cancel是否已执行
@Override
public boolean prepare(Long productId, Integer count) {
    String xid = RootContext.getXID();
    StockFreeze freeze = freezeMapper.selectByXid(xid);
    if (freeze != null && "CANCELLED".equals(freeze.getState())) {
        // 已取消，拒绝Try
        throw new BusinessException("事务已取消");
    }
    // 正常Try逻辑
}
```

## 5. Saga模式 ⭐⭐⭐⭐

### Saga模式原理

```
Saga模式：长事务解决方案

特点：
- 长事务：适合流程较长的业务
- 最终一致性：不保证强一致
- 正向补偿：每个操作都有对应的补偿操作
- 状态机：通过状态机编排

适用场景：
- 业务流程长（多个服务调用）
- 跨组织/跨公司
- 对一致性要求不严格

两种模式：
1. 基于状态机（推荐）
2. 基于注解
```

### 基于状态机的Saga

```json
{
  "Name": "orderSaga",
  "Comment": "订单Saga流程",
  "StartState": "CreateOrder",
  "Version": "1.0",
  "States": {
    "CreateOrder": {
      "Type": "ServiceTask",
      "ServiceName": "orderService",
      "ServiceMethod": "createOrder",
      "CompensateState": "CancelOrder",
      "Next": "DeductStock"
    },
    "DeductStock": {
      "Type": "ServiceTask",
      "ServiceName": "stockService",
      "ServiceMethod": "deduct",
      "CompensateState": "RestoreStock",
      "Next": "DeductBalance"
    },
    "DeductBalance": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "deduct",
      "CompensateState": "RestoreBalance",
      "Next": "Succeed"
    },
    "Succeed": {
      "Type": "Succeed"
    },
    "CancelOrder": {
      "Type": "ServiceTask",
      "ServiceName": "orderService",
      "ServiceMethod": "cancel"
    },
    "RestoreStock": {
      "Type": "ServiceTask",
      "ServiceName": "stockService",
      "ServiceMethod": "restore"
    },
    "RestoreBalance": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "restore"
    }
  }
}
```

```java
/**
 * Saga服务实现
 */
@Service
public class OrderSagaService {

    /**
     * 正向操作：创建订单
     */
    public void createOrder(Map<String, Object> params) {
        Order order = buildOrder(params);
        orderMapper.insert(order);
    }

    /**
     * 补偿操作：取消订单
     */
    public void cancelOrder(Map<String, Object> params) {
        Long orderId = Long.valueOf(params.get("orderId").toString());
        orderMapper.updateStatus(orderId, "CANCELLED");
    }
}

@Service
public class StockSagaService {

    /**
     * 正向操作：扣减库存
     */
    public void deduct(Map<String, Object> params) {
        Long productId = Long.valueOf(params.get("productId").toString());
        Integer count = Integer.valueOf(params.get("count").toString());
        stockMapper.deduct(productId, count);
    }

    /**
     * 补偿操作：恢复库存
     */
    public void restore(Map<String, Object> params) {
        Long productId = Long.valueOf(params.get("productId").toString());
        Integer count = Integer.valueOf(params.get("count").toString());
        stockMapper.restore(productId, count);
    }
}
```

## 6. XA模式 ⭐⭐⭐

### XA模式原理

```
XA模式：强一致性事务

特点：
- 强一致性：完全的ACID保证
- 两阶段提交：基于数据库XA协议
- 性能较差：锁定资源时间长
- 数据库支持：需要数据库支持XA

流程：
1. 一阶段：执行SQL，但不提交
2. 二阶段：所有分支prepare成功后commit，否则rollback

适用场景：
- 对一致性要求极高
- 可以接受性能损耗
- 数据库支持XA
```

### XA模式配置

```yaml
# application.yml
seata:
  # 使用XA模式
  data-source-proxy-mode: XA
```

```java
/**
 * XA模式使用（与AT模式使用方式相同）
 */
@Service
public class OrderService {

    @GlobalTransactional
    public void createOrder(Order order) {
        // 业务代码与AT模式完全相同
        orderMapper.insert(order);
        stockClient.deduct(order.getProductId(), order.getCount());
        accountClient.deduct(order.getUserId(), order.getAmount());
    }
}

// 区别：
// 1. XA不需要undo_log表
// 2. XA一阶段不提交事务
// 3. XA性能较AT差
```

## 7. Seata Server部署 ⭐⭐⭐⭐⭐

### 下载与启动

```bash
# 1. 下载Seata Server
wget https://github.com/seata/seata/releases/download/v1.7.1/seata-server-1.7.1.zip
unzip seata-server-1.7.1.zip

# 2. 创建数据库
# 在MySQL中创建seata数据库
mysql -u root -p
CREATE DATABASE seata;
USE seata;

# 执行建表脚本（在seata/script/server/db/mysql.sql）
```

### 数据库表结构

```sql
-- 全局事务表
CREATE TABLE `global_table` (
  `xid` VARCHAR(128) NOT NULL,
  `transaction_id` BIGINT,
  `status` TINYINT NOT NULL,
  `application_id` VARCHAR(32),
  `transaction_service_group` VARCHAR(32),
  `transaction_name` VARCHAR(128),
  `timeout` INT,
  `begin_time` BIGINT,
  `application_data` VARCHAR(2000),
  `gmt_create` DATETIME,
  `gmt_modified` DATETIME,
  PRIMARY KEY (`xid`),
  KEY `idx_status_gmt_modified` (`status`, `gmt_modified`),
  KEY `idx_transaction_id` (`transaction_id`)
);

-- 分支事务表
CREATE TABLE `branch_table` (
  `branch_id` BIGINT NOT NULL,
  `xid` VARCHAR(128) NOT NULL,
  `transaction_id` BIGINT,
  `resource_group_id` VARCHAR(32),
  `resource_id` VARCHAR(256),
  `branch_type` VARCHAR(8),
  `status` TINYINT,
  `client_id` VARCHAR(64),
  `application_data` VARCHAR(2000),
  `gmt_create` DATETIME(6),
  `gmt_modified` DATETIME(6),
  PRIMARY KEY (`branch_id`),
  KEY `idx_xid` (`xid`)
);

-- 锁表
CREATE TABLE `lock_table` (
  `row_key` VARCHAR(128) NOT NULL,
  `xid` VARCHAR(128),
  `transaction_id` BIGINT,
  `branch_id` BIGINT NOT NULL,
  `resource_id` VARCHAR(256),
  `table_name` VARCHAR(32),
  `pk` VARCHAR(36),
  `status` TINYINT NOT NULL DEFAULT '0',
  `gmt_create` DATETIME,
  `gmt_modified` DATETIME,
  PRIMARY KEY (`row_key`),
  KEY `idx_status` (`status`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_xid_and_branch_id` (`xid`, `branch_id`)
);

-- 分布式锁表
CREATE TABLE `distributed_lock` (
  `lock_key` CHAR(20) NOT NULL,
  `lock_value` VARCHAR(20) NOT NULL,
  `expire` BIGINT,
  PRIMARY KEY (`lock_key`)
);
```

### 配置文件

```yaml
# application.yml
server:
  port: 7091

spring:
  application:
    name: seata-server

seata:
  # 配置中心
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
      data-id: seataServer.properties

  # 注册中心
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
      cluster: default

  # 存储配置
  store:
    mode: db # 存储模式：file、db、redis
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/seata?useSSL=false
      user: root
      password: root
      min-conn: 5
      max-conn: 100
```

### Nacos配置中心配置

```properties
# seataServer.properties（在Nacos中配置）

# 事务分组配置
service.vgroupMapping.default_tx_group=default

# TC服务配置
service.default.grouplist=127.0.0.1:8091
service.enableDegrade=false
service.disableGlobalTransaction=false

# 客户端配置
client.rm.asyncCommitBufferLimit=10000
client.rm.lock.retryInterval=10
client.rm.lock.retryTimes=30
client.rm.lock.retryPolicyBranchRollbackOnConflict=true
client.rm.reportRetryCount=5
client.rm.tableMetaCheckEnable=true
client.rm.tableMetaCheckerInterval=60000
client.rm.sqlParserType=druid
client.rm.reportSuccessEnable=false
client.rm.sagaBranchRegisterEnable=false
client.tm.commitRetryCount=5
client.tm.rollbackRetryCount=5
client.tm.defaultGlobalTransactionTimeout=60000
client.tm.degradeCheck=false
client.tm.degradeCheckAllowTimes=10
client.tm.degradeCheckPeriod=2000
client.tm.interceptorOrder=-2147482648

# undo日志配置
client.undo.dataValidation=true
client.undo.logSerialization=jackson
client.undo.onlyCareUpdateColumns=true
client.undo.logTable=undo_log
client.undo.compress.enable=true
client.undo.compress.type=zip
client.undo.compress.threshold=64k

# 日志配置
client.log.exceptionRate=100
```

### 启动Seata Server

```bash
# Linux/Mac
cd seata/bin
sh seata-server.sh

# Windows
cd seata\bin
seata-server.bat

# 指定端口启动
sh seata-server.sh -p 8091

# 查看日志
tail -f ../logs/seata-server.log
```

## 8. 事务分组与高可用 ⭐⭐⭐⭐

### 事务分组

```
事务分组的意义：

应用 → 事务分组 → TC集群

order-service
  ↓
default_tx_group → default集群(TC1, TC2, TC3)

stock-service
  ↓
default_tx_group → default集群(TC1, TC2, TC3)

好处：
1. 逻辑隔离：不同业务使用不同TC集群
2. 灵活切换：修改分组映射即可切换TC
3. 高可用：TC集群部署
```

### 高可用部署

```yaml
# Seata Server集群配置

# TC1节点
server:
  port: 8091
seata:
  registry:
    nacos:
      cluster: beijing  # 集群名

# TC2节点
server:
  port: 8092
seata:
  registry:
    nacos:
      cluster: beijing

# TC3节点（异地）
server:
  port: 8093
seata:
  registry:
    nacos:
      cluster: shanghai

# 客户端配置
seata:
  registry:
    nacos:
      cluster: beijing  # 优先使用beijing集群
```

## 💡 最佳实践

### 1. 模式选择

```
选择建议：

AT模式 ⭐⭐⭐⭐⭐（首选）
- 适用场景：大部分业务场景
- 优点：无侵入、易用、性能好
- 缺点：仅支持ACID数据库

TCC模式 ⭐⭐⭐⭐
- 适用场景：高并发、需要精确控制
- 优点：高性能、无锁
- 缺点：代码侵入性强、开发复杂

Saga模式 ⭐⭐⭐⭐
- 适用场景：长流程、跨组织
- 优点：适合长事务
- 缺点：最终一致性

XA模式 ⭐⭐⭐
- 适用场景：强一致性要求
- 优点：强一致性
- 缺点：性能差
```

### 2. 性能优化

```java
/**
 * 性能优化建议 ⭐⭐⭐⭐⭐
 */

// 1. 减少全局事务范围
// ❌ 错误：全局事务太大
@GlobalTransactional
public void process() {
    // 耗时操作1
    doSomething1();
    // 耗时操作2
    doSomething2();
    // 真正需要事务的操作
    createOrder();
}

// ✅ 正确：只包含必要操作
public void process() {
    doSomething1();
    doSomething2();
    createOrderWithTransaction();
}

@GlobalTransactional
public void createOrderWithTransaction() {
    createOrder();
}

// 2. 合理设置超时时间
@GlobalTransactional(timeoutMills = 30000)  // 30秒
public void quickOperation() { }

@GlobalTransactional(timeoutMills = 300000)  // 5分钟
public void longOperation() { }

// 3. 异步化非关键操作
@GlobalTransactional
public void createOrder(Order order) {
    // 同步：核心业务
    orderMapper.insert(order);
    stockClient.deduct(order.getProductId(), order.getCount());

    // 异步：非核心业务（不放在全局事务中）
    applicationEventPublisher.publishEvent(new OrderCreatedEvent(order));
}

@Async
@EventListener
public void handleOrderCreated(OrderCreatedEvent event) {
    // 发送通知、积分等非核心操作
    notificationService.send(event.getOrder());
    pointService.add(event.getOrder().getUserId(), 10);
}
```

### 3. 异常处理

```java
/**
 * 异常处理最佳实践 ⭐⭐⭐⭐⭐
 */
@Service
public class OrderService {

    @GlobalTransactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        try {
            // 业务操作
            orderMapper.insert(order);
            stockClient.deduct(order.getProductId(), order.getCount());

        } catch (BusinessException e) {
            // 业务异常，回滚事务
            log.error("业务异常，事务回滚", e);
            throw e;

        } catch (Exception e) {
            // 系统异常，回滚事务
            log.error("系统异常，事务回滚", e);
            throw new BusinessException("系统异常", e);
        }
    }

    /**
     * 部分回滚场景
     */
    @GlobalTransactional
    public void batchProcess(List<Order> orders) {
        for (Order order : orders) {
            try {
                processOrder(order);
            } catch (Exception e) {
                // 记录失败，但不影响其他订单
                log.error("订单处理失败: {}", order.getId(), e);
                // 不抛出异常，事务继续
            }
        }
    }
}
```

### 4. 监控与告警

```java
/**
 * 自定义事务监控 ⭐⭐⭐⭐
 */
@Component
public class SeataTransactionListener {

    @Autowired
    private MonitorService monitorService;

    /**
     * 监听事务开始
     */
    @EventListener
    public void onTransactionBegin(GlobalTransactionEvent event) {
        if (event.getStatus() == GlobalStatus.Begin) {
            monitorService.recordTransactionBegin(event.getXid());
        }
    }

    /**
     * 监听事务结束
     */
    @EventListener
    public void onTransactionEnd(GlobalTransactionEvent event) {
        if (event.getStatus() == GlobalStatus.Committed) {
            monitorService.recordTransactionCommit(event.getXid());
        } else if (event.getStatus() == GlobalStatus.Rollbacked) {
            monitorService.recordTransactionRollback(event.getXid());
            // 回滚告警
            alertService.send("事务回滚: " + event.getXid());
        }
    }
}
```

## 🎯 练习建议

### 基础练习

1. **部署Seata Server**
   - 安装Seata Server
   - 配置Nacos注册和配置中心
   - 创建数据库表

2. **AT模式实践**
   - 创建订单、库存、账户三个服务
   - 实现下单扣库存扣余额
   - 测试事务回滚

3. **规则配置**
   - 配置事务超时
   - 测试网络超时回滚
   - 观察undo_log

### 进阶练习

4. **TCC模式实践**
   - 实现库存的TCC接口
   - 处理空回滚、幂等、悬挂
   - 对比AT和TCC性能

5. **Saga模式实践**
   - 设计Saga状态机
   - 实现长流程事务
   - 测试补偿操作

6. **高可用部署**
   - 部署Seata集群
   - 配置事务分组
   - 测试故障转移

### 实战项目

7. **电商秒杀系统**

   ```
   场景：
   - 下单：AT模式
   - 扣库存：TCC模式（高性能）
   - 积分：Saga模式（异步）
   - 支付：XA模式（强一致）
   ```

8. **分布式订单系统**
   ```
   实现：
   - 订单服务
   - 库存服务
   - 支付服务
   - 物流服务
   - 全链路事务控制
   ```

## 💡 常见问题

### 1. undo_log没有被删除

```
原因：
1. 二阶段提交异步删除可能延迟
2. 异常导致没有删除

解决：
1. 正常情况下会异步删除，稍等即可
2. 定时清理：DELETE FROM undo_log WHERE log_modified < DATE_SUB(NOW(), INTERVAL 7 DAY)
```

### 2. 事务超时回滚

```yaml
# 调整超时时间
seata:
  client:
    tm:
      default-global-transaction-timeout: 60000  # 全局默认超时

# 或在注解中指定
@GlobalTransactional(timeoutMills = 300000)
```

### 3. 找不到undo_log

```
错误：can not found undo_log

原因：
1. 没有创建undo_log表
2. 数据源代理模式不对

解决：
1. 在每个业务数据库创建undo_log表
2. 确认配置：seata.data-source-proxy-mode=AT
```

### 4. 分支事务注册失败

```
错误：can not register branch

原因：
1. TC连接失败
2. 事务分组配置错误

解决：
1. 检查TC是否启动
2. 检查vgroup-mapping配置
3. 检查Nacos注册信息
```

## 📚 下一步学习

1. 学习 [Sentinel流量控制](./Sentinel.md) - 服务容错保护
2. 学习 [服务监控与链路追踪](./服务监控与链路追踪.md) - 分布式追踪
3. 实践 [电商微服务平台](../06-项目实战/电商微服务平台.md) - 综合运用

## 📖 参考资源

- [Seata官方文档](https://seata.io/zh-cn/docs/overview/what-is-seata.html)
- [Spring Cloud Alibaba文档](https://spring-cloud-alibaba-group.github.io/github-pages/2022/zh-cn/index.html)
- [Seata GitHub](https://github.com/seata/seata)
