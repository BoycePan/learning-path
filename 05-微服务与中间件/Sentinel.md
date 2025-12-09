# Sentinel流量控制与熔断降级

## 📌 学习目标

- 理解Sentinel核心概念与架构
- 掌握流量控制规则配置
- 掌握熔断降级策略
- 了解热点参数限流
- 掌握规则持久化方案
- 熟练使用Sentinel Dashboard
- 掌握与Spring Cloud集成

## ⭐ Sentinel核心概念

- **流量控制** ⭐⭐⭐⭐⭐
- **熔断降级** ⭐⭐⭐⭐⭐
- **系统保护** ⭐⭐⭐⭐⭐
- **热点参数限流** ⭐⭐⭐⭐
- **规则持久化** ⭐⭐⭐⭐⭐

## 1. Sentinel简介 ⭐⭐⭐⭐⭐

### 什么是Sentinel

```
Sentinel是阿里开源的面向分布式服务架构的流量控制组件

核心功能：
├── 流量控制（Flow Control）
├── 熔断降级（Circuit Breaking）
├── 系统自适应保护
├── 热点参数限流
└── 实时监控

优势：
- 丰富的应用场景
- 完善的实时监控
- 广泛的开源生态
- 完善的SPI扩展点
```

### 核心架构

```
┌─────────────┐
│  应用程序    │
└──────┬──────┘
       │ 调用
       ↓
┌─────────────┐     规则推送      ┌──────────────┐
│  Sentinel   │ ←──────────────── │   Dashboard  │
│   Core      │                   │   控制台     │
└──────┬──────┘                   └──────────────┘
       │ 上报监控
       ↓
┌─────────────┐
│  监控数据    │
└─────────────┘
```

## 2. 快速入门 ⭐⭐⭐⭐⭐

### Maven依赖

```xml
<!-- Spring Cloud Alibaba Sentinel -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>

<!-- Sentinel Dashboard通信 -->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
</dependency>

<!-- Nacos数据源（规则持久化）-->
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

### 配置文件

```yaml
# application.yml
spring:
  application:
    name: order-service
  cloud:
    sentinel:
      transport:
        # Sentinel Dashboard地址
        dashboard: localhost:8080
        # 客户端端口（默认8719）
        port: 8719
      # 饥饿加载（启动时连接Dashboard）
      eager: true

      # Nacos数据源配置
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
```

### 基础使用

```java
/**
 * Sentinel资源定义 ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/orders")
public class OrderController {

    /**
     * 使用@SentinelResource注解
     * value: 资源名称
     * blockHandler: 限流/降级处理方法
     * fallback: 异常处理方法
     */
    @GetMapping("/{id}")
    @SentinelResource(
        value = "getOrder",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public Result<Order> getOrder(@PathVariable Long id) {
        // 可能抛出异常的业务逻辑
        if (id <= 0) {
            throw new IllegalArgumentException("无效的订单ID");
        }
        return Result.success(orderService.getById(id));
    }

    /**
     * 限流/降级处理（BlockException）
     */
    public Result<Order> handleBlock(Long id, BlockException ex) {
        log.warn("订单查询被限流: {}", id);
        return Result.error("系统繁忙，请稍后再试");
    }

    /**
     * 异常处理（业务异常）
     */
    public Result<Order> handleFallback(Long id, Throwable ex) {
        log.error("订单查询异常: {}", id, ex);
        return Result.error("订单查询失败");
    }
}
```

## 3. 流量控制规则 ⭐⭐⭐⭐⭐

### QPS限流（最常用）

```java
/**
 * QPS流控规则配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class SentinelConfig {

    @PostConstruct
    public void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();

        // QPS限流规则
        FlowRule rule = new FlowRule();
        rule.setResource("getOrder");           // 资源名
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);  // QPS模式
        rule.setCount(10);                      // 每秒最多10次
        rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT); // 直接拒绝

        rules.add(rule);
        FlowRuleManager.loadRules(rules);
    }
}
```

### 流控模式

```java
/**
 * 流控模式 ⭐⭐⭐⭐⭐
 */

// 1. 直接模式（默认）- 直接限流当前资源
FlowRule directRule = new FlowRule("getOrder")
    .setCount(10)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);

// 2. 关联模式 - 关联资源超限时限流当前资源
FlowRule relateRule = new FlowRule("getOrder")
    .setCount(10)
    .setStrategy(RuleConstant.STRATEGY_RELATE)
    .setRefResource("updateOrder");  // 当updateOrder超限时限流getOrder

// 3. 链路模式 - 只记录指定链路的流量
FlowRule chainRule = new FlowRule("orderService")
    .setCount(10)
    .setStrategy(RuleConstant.STRATEGY_CHAIN)
    .setRefResource("controller");   // 只统计从controller来的调用
```

### 流控效果

```java
/**
 * 流控效果 ⭐⭐⭐⭐⭐
 */

// 1. 快速失败（默认）- 直接抛出异常
FlowRule fastFailRule = new FlowRule("getOrder")
    .setCount(10)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);

// 2. Warm Up（预热）- 冷启动，逐渐增加限流阈值
FlowRule warmUpRule = new FlowRule("getOrder")
    .setCount(100)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP)
    .setWarmUpPeriodSec(10);  // 预热10秒，从count/3开始

// 3. 排队等待 - 匀速排队，用于脉冲流量
FlowRule queueRule = new FlowRule("getOrder")
    .setCount(10)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER)
    .setMaxQueueingTimeMs(5000);  // 最大排队等待5秒
```

### 线程数限流

```java
/**
 * 线程数限流 ⭐⭐⭐⭐
 * 适用于处理时间较长的场景
 */
FlowRule threadRule = new FlowRule("slowOperation")
    .setGrade(RuleConstant.FLOW_GRADE_THREAD)  // 线程数模式
    .setCount(5);  // 最多5个线程同时处理
```

## 4. 熔断降级策略 ⭐⭐⭐⭐⭐

### 慢调用比例熔断（推荐）

```java
/**
 * 慢调用比例熔断 ⭐⭐⭐⭐⭐
 * 适合检测服务响应变慢的场景
 */
@Configuration
public class DegradeConfig {

    @PostConstruct
    public void initDegradeRules() {
        List<DegradeRule> rules = new ArrayList<>();

        DegradeRule rule = new DegradeRule("remoteService")
            // 慢调用比例策略
            .setGrade(RuleConstant.DEGRADE_GRADE_RT)
            // 最大响应时间：500ms
            .setCount(500)
            // 比例阈值：0.5 = 50%
            .setSlowRatioThreshold(0.5)
            // 最小请求数：10（统计时长内至少10个请求才会触发）
            .setMinRequestAmount(10)
            // 统计时长：1秒
            .setStatIntervalMs(1000)
            // 熔断时长：10秒
            .setTimeWindow(10);

        rules.add(rule);
        DegradeRuleManager.loadRules(rules);
    }
}
```

### 异常比例熔断

```java
/**
 * 异常比例熔断 ⭐⭐⭐⭐⭐
 * 适合业务异常率较高的场景
 */
DegradeRule exceptionRatioRule = new DegradeRule("orderService")
    // 异常比例策略
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO)
    // 异常比例：0.3 = 30%
    .setCount(0.3)
    // 最小请求数
    .setMinRequestAmount(10)
    // 统计时长：1秒
    .setStatIntervalMs(1000)
    // 熔断时长：10秒
    .setTimeWindow(10);
```

### 异常数熔断

```java
/**
 * 异常数熔断 ⭐⭐⭐⭐
 * 适合请求量较少的场景
 */
DegradeRule exceptionCountRule = new DegradeRule("payService")
    // 异常数策略
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_COUNT)
    // 异常数阈值：5次
    .setCount(5)
    // 最小请求数
    .setMinRequestAmount(10)
    // 统计时长：60秒
    .setStatIntervalMs(60000)
    // 熔断时长：10秒
    .setTimeWindow(10);
```

### 熔断状态与恢复

```
熔断器状态转换：

CLOSED（关闭）
    │
    │ 达到熔断条件
    ↓
OPEN（熔断）
    │
    │ 熔断时长到期
    ↓
HALF_OPEN（半开）
    │
    ├─→ 探测请求成功 → CLOSED
    └─→ 探测请求失败 → OPEN
```

## 5. 热点参数限流 ⭐⭐⭐⭐

### 基础配置

```java
/**
 * 热点参数限流 ⭐⭐⭐⭐
 * 针对特定参数值进行限流
 */
@GetMapping("/query")
@SentinelResource(
    value = "queryByType",
    blockHandler = "handleBlock"
)
public Result query(@RequestParam String type,
                    @RequestParam String keyword) {
    return productService.query(type, keyword);
}

// 配置热点规则
@PostConstruct
public void initParamFlowRules() {
    ParamFlowRule rule = new ParamFlowRule("queryByType")
        .setParamIdx(0)           // 第0个参数（type）
        .setCount(10)             // QPS阈值
        .setGrade(RuleConstant.FLOW_GRADE_QPS);

    // 针对特定参数值的例外配置
    ParamFlowItem item = new ParamFlowItem()
        .setObject("vip")         // type=vip时
        .setClassType(String.class.getName())
        .setCount(50);            // QPS可以到50

    rule.setParamFlowItemList(Collections.singletonList(item));

    ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

## 6. 系统自适应保护 ⭐⭐⭐⭐

### 系统规则配置

```java
/**
 * 系统自适应保护 ⭐⭐⭐⭐
 * 从整体维度进行系统保护
 */
@PostConstruct
public void initSystemRules() {
    List<SystemRule> rules = new ArrayList<>();

    SystemRule rule = new SystemRule();

    // 1. LOAD（系统负载）- 仅Linux生效
    rule.setHighestSystemLoad(10.0);

    // 2. RT（平均响应时间）
    rule.setAvgRt(1000);  // 平均响应时间超过1秒时触发保护

    // 3. 线程数
    rule.setMaxThread(100);  // 系统总线程数超过100时保护

    // 4. 入口QPS
    rule.setQps(10000);  // 系统总QPS超过10000时保护

    // 5. CPU使用率
    rule.setHighestCpuUsage(0.9);  // CPU使用率超过90%时保护

    rules.add(rule);
    SystemRuleManager.loadRules(rules);
}
```

## 7. 规则持久化 ⭐⭐⭐⭐⭐

### Nacos持久化（推荐）

```yaml
# application.yml - Nacos数据源配置
spring:
  cloud:
    sentinel:
      datasource:
        # 流控规则
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
            namespace: public
        # 降级规则
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
        # 系统规则
        system:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-system-rules
            groupId: SENTINEL_GROUP
            rule-type: system
        # 热点规则
        param-flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-param-rules
            groupId: SENTINEL_GROUP
            rule-type: param-flow
```

### Nacos规则格式

```json
// order-service-flow-rules（流控规则）
[
  {
    "resource": "getOrder",
    "limitApp": "default",
    "grade": 1,
    "count": 10,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]

// order-service-degrade-rules（降级规则）
[
  {
    "resource": "remoteService",
    "grade": 0,
    "count": 500,
    "timeWindow": 10,
    "minRequestAmount": 10,
    "slowRatioThreshold": 0.5,
    "statIntervalMs": 1000
  }
]
```

## 8. Sentinel Dashboard ⭐⭐⭐⭐⭐

### 启动Dashboard

```bash
# 下载Sentinel Dashboard jar包
wget https://github.com/alibaba/Sentinel/releases/download/1.8.6/sentinel-dashboard-1.8.6.jar

# 启动（默认端口8080，用户名/密码：sentinel/sentinel）
java -Dserver.port=8080 \
     -Dcsp.sentinel.dashboard.server=localhost:8080 \
     -Dproject.name=sentinel-dashboard \
     -jar sentinel-dashboard-1.8.6.jar
```

### Dashboard功能

```
Sentinel Dashboard功能：

1. 实时监控
   ├── 查看实时QPS、响应时间
   ├── 查看拒绝请求数
   └── 查看异常数

2. 规则管理
   ├── 流控规则配置
   ├── 降级规则配置
   ├── 热点规则配置
   ├── 系统规则配置
   └── 授权规则配置

3. 簇点链路
   └── 查看资源调用链路

4. 机器列表
   └── 查看接入的应用实例
```

## 9. 与Spring Cloud集成 ⭐⭐⭐⭐⭐

### 与OpenFeign集成

```yaml
# 启用Feign的Sentinel支持
feign:
  sentinel:
    enabled: true
```

```java
/**
 * Feign客户端集成Sentinel ⭐⭐⭐⭐⭐
 */
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class,        // 降级类
    fallbackFactory = UserClientFallbackFactory.class  // 降级工厂（可获取异常）
)
public interface UserClient {
    @GetMapping("/users/{id}")
    User getById(@PathVariable Long id);
}

/**
 * Fallback实现
 */
@Component
public class UserClientFallback implements UserClient {
    @Override
    public User getById(Long id) {
        return User.builder()
            .id(id)
            .name("降级用户")
            .build();
    }
}

/**
 * FallbackFactory实现（推荐）
 */
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public User getById(Long id) {
                log.error("用户服务调用失败: {}", id, cause);
                return User.builder()
                    .id(id)
                    .name("降级用户")
                    .build();
            }
        };
    }
}
```

### 与Gateway集成

```xml
<!-- Gateway Sentinel适配器 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
</dependency>
```

```java
/**
 * Gateway集成Sentinel ⭐⭐⭐⭐⭐
 */
@Configuration
public class GatewaySentinelConfig {

    @PostConstruct
    public void initGatewayRules() {
        Set<GatewayFlowRule> rules = new HashSet<>();

        // 针对路由限流
        GatewayFlowRule rule = new GatewayFlowRule("user-route")
            .setResourceMode(SentinelGatewayConstants.RESOURCE_MODE_ROUTE_ID)
            .setGrade(RuleConstant.FLOW_GRADE_QPS)
            .setCount(100);

        rules.add(rule);
        GatewayRuleManager.loadRules(rules);
    }

    /**
     * 自定义限流异常处理
     */
    @PostConstruct
    public void initBlockHandler() {
        BlockRequestHandler blockHandler = (exchange, t) -> {
            Map<String, String> result = new HashMap<>();
            result.put("code", "429");
            result.put("message", "请求过于频繁，请稍后再试");

            return ServerResponse.status(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(result));
        };

        GatewayCallbackManager.setBlockHandler(blockHandler);
    }
}
```

### RestTemplate集成

```java
/**
 * RestTemplate集成Sentinel ⭐⭐⭐⭐
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    @SentinelRestTemplate(
        blockHandler = "handleBlock",
        blockHandlerClass = SentinelRestTemplateHandler.class,
        fallback = "handleFallback",
        fallbackClass = SentinelRestTemplateHandler.class
    )
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Component
public class SentinelRestTemplateHandler {

    public static ClientHttpResponse handleBlock(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution,
            BlockException ex) {
        return new SentinelClientHttpResponse("限流");
    }

    public static ClientHttpResponse handleFallback(
            HttpRequest request,
            byte[] body,
            ClientHttpRequestExecution execution,
            BlockException ex) {
        return new SentinelClientHttpResponse("降级");
    }
}
```

## 10. 注解支持 ⭐⭐⭐⭐⭐

### @SentinelResource详解

```java
/**
 * @SentinelResource完整配置 ⭐⭐⭐⭐⭐
 */
@Service
public class OrderService {

    @SentinelResource(
        value = "createOrder",                // 资源名称（必填）

        // 限流/降级处理
        blockHandler = "handleBlock",         // 处理方法名
        blockHandlerClass = OrderBlockHandler.class,  // 处理类

        // 异常处理
        fallback = "handleFallback",          // 处理方法名
        fallbackClass = OrderFallbackHandler.class,   // 处理类

        // 异常处理配置
        exceptionsToIgnore = {IllegalArgumentException.class},  // 忽略的异常
        exceptionsToTrace = {RuntimeException.class},           // 追踪的异常

        // 默认降级方法
        defaultFallback = "defaultFallback"
    )
    public Order createOrder(Order order) {
        // 业务逻辑
        return orderMapper.insert(order);
    }

    // BlockHandler必须是static方法，且签名一致+BlockException参数
    public static Order handleBlock(Order order, BlockException ex) {
        log.warn("创建订单被限流");
        throw new BusinessException("系统繁忙");
    }

    // Fallback签名一致+Throwable参数
    public Order handleFallback(Order order, Throwable ex) {
        log.error("创建订单异常", ex);
        throw new BusinessException("订单创建失败");
    }
}
```

## 💡 最佳实践

### 1. 资源定义策略

```
资源粒度选择：
- ✅ 对外API接口
- ✅ 重要的业务方法
- ✅ 远程服务调用
- ✅ 数据库操作（高并发场景）
- ❌ 不要过度细化（如每个私有方法）
```

### 2. 限流规则设计

```java
/**
 * 限流规则设计原则 ⭐⭐⭐⭐⭐
 */

// 1. 分层限流
// Gateway层：全局限流
GatewayFlowRule gatewayRule = new GatewayFlowRule("user-route")
    .setCount(1000);  // 整个路由1000 QPS

// 服务层：接口限流
FlowRule serviceRule = new FlowRule("getUser")
    .setCount(500);   // 单个接口500 QPS

// 2. 预热规则（应对冷启动）
FlowRule warmUpRule = new FlowRule("hotApi")
    .setCount(1000)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP)
    .setWarmUpPeriodSec(300);  // 5分钟预热

// 3. 排队等待（削峰填谷）
FlowRule queueRule = new FlowRule("batchProcess")
    .setCount(10)
    .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER)
    .setMaxQueueingTimeMs(60000);  // 允许排队1分钟
```

### 3. 熔断规则设计

```java
/**
 * 熔断规则设计原则 ⭐⭐⭐⭐⭐
 */

// 1. 外部服务调用 - 使用慢调用比例
DegradeRule externalRule = new DegradeRule("externalApi")
    .setGrade(RuleConstant.DEGRADE_GRADE_RT)
    .setCount(3000)           // 3秒算慢调用
    .setSlowRatioThreshold(0.3)  // 30%慢调用触发
    .setTimeWindow(30);       // 熔断30秒

// 2. 内部服务调用 - 使用异常比例
DegradeRule internalRule = new DegradeRule("internalService")
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO)
    .setCount(0.5)            // 50%异常率触发
    .setTimeWindow(10);       // 熔断10秒

// 3. 关键操作 - 组合规则
// 同时配置慢调用和异常比例
```

### 4. 降级处理策略

```java
/**
 * 优雅降级策略 ⭐⭐⭐⭐⭐
 */

// 1. 返回默认值
public User handleFallback(Long id, Throwable ex) {
    return User.defaultUser();
}

// 2. 返回缓存数据
public List<Product> handleFallback(String category, Throwable ex) {
    return cacheService.get("hot:products:" + category);
}

// 3. 降级到简化逻辑
public Result<Order> handleFallback(Order order, Throwable ex) {
    // 不调用库存、积分等服务，只创建基础订单
    return Result.success(orderService.createSimpleOrder(order));
}

// 4. 提示用户重试
public Result handleBlock(Long id, BlockException ex) {
    return Result.error(ErrorCode.TOO_MANY_REQUESTS, "系统繁忙，请稍后再试");
}
```

### 5. 监控与告警

```java
/**
 * 自定义监控指标 ⭐⭐⭐⭐
 */
@Component
public class SentinelMetricsExporter {

    @Scheduled(fixedRate = 60000)
    public void exportMetrics() {
        // 获取资源统计信息
        Map<String, List<NodeVo>> map =
            InMemoryMetricsRepository.listResourcesOfMachine();

        for (Map.Entry<String, List<NodeVo>> entry : map.entrySet()) {
            for (NodeVo node : entry.getValue()) {
                // 导出到监控系统（Prometheus/ELK等）
                metricsService.record(
                    node.getResource(),
                    node.getPassQps(),
                    node.getBlockQps(),
                    node.getExceptionQps(),
                    node.getRt()
                );

                // 告警
                if (node.getBlockQps() > 100) {
                    alertService.send("高限流告警: " + node.getResource());
                }
            }
        }
    }
}
```

## 🎯 练习建议

### 基础练习

1. **搭建Sentinel环境**
   - 启动Sentinel Dashboard
   - 集成Spring Boot应用
   - 配置流控规则

2. **实现接口限流**
   - 使用@SentinelResource注解
   - 配置QPS限流
   - 测试限流效果

3. **实现服务降级**
   - 模拟慢调用场景
   - 配置熔断规则
   - 观察熔断恢复

### 进阶练习

4. **规则持久化**
   - 集成Nacos数据源
   - 在Nacos配置规则
   - 动态更新规则

5. **网关集成**
   - Gateway集成Sentinel
   - 配置网关流控
   - 自定义异常处理

6. **OpenFeign集成**
   - Feign客户端降级
   - FallbackFactory实现
   - 测试远程调用降级

### 实战项目

7. **电商秒杀系统**

   ```
   场景：
   - 商品详情页：QPS 10000
   - 秒杀接口：排队限流 + 热点参数
   - 订单创建：熔断降级
   - 支付调用：超时熔断
   ```

8. **监控告警系统**
   ```
   实现：
   - 采集Sentinel指标
   - Prometheus监控
   - Grafana可视化
   - 钉钉告警
   ```

## 💡 常见问题

### 1. Dashboard连接不上应用

```yaml
# 检查配置
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080 # Dashboard地址
        port: 8719 # 客户端端口（确保未被占用）
      eager: true # 启用饥饿加载
```

### 2. 规则不生效

```
排查步骤：
1. 检查资源名是否正确
2. 确认是否达到触发条件（minRequestAmount）
3. 查看Dashboard簇点链路是否有该资源
4. 检查是否被 exceptionsToIgnore 忽略
```

### 3. 限流后没有调用blockHandler

```java
// 原因：blockHandler必须处理BlockException
// 错误写法
public Result handleBlock(Long id, Exception ex) { }

// 正确写法
public Result handleBlock(Long id, BlockException ex) { }
```

### 4. 持久化规则不生效

```yaml
# 检查rule-type是否正确
spring:
  cloud:
    sentinel:
      datasource:
        flow:
          nacos:
            rule-type: flow # 必须指定规则类型
```

## 📚 下一步学习

1. 学习 [Seata分布式事务](./Seata.md) - 微服务事务解决方案
2. 学习 [服务监控与链路追踪](./服务监控与链路追踪.md) - 全链路监控
3. 实践 [电商微服务平台](../06-项目实战/电商微服务平台.md) - 综合运用

## 📖 参考资源

- [Sentinel官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)
- [Spring Cloud Alibaba文档](https://spring-cloud-alibaba-group.github.io/github-pages/2022/zh-cn/index.html)
- [Sentinel GitHub](https://github.com/alibaba/Sentinel)
