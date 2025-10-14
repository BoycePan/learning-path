# DDD领域驱动设计

## 📌 学习目标

- 理解DDD核心概念
- 掌握战略设计方法
- 掌握战术设计模式
- 实践DDD落地方案
- 理解DDD与微服务的关系

## ⭐ 学习建议

**适合学习阶段**：在学习微服务架构时 ⭐⭐⭐⭐⭐

**前置知识**：

- 面向对象编程 ⭐⭐⭐⭐⭐
- Spring框架 ⭐⭐⭐⭐⭐
- 数据库设计 ⭐⭐⭐⭐
- 微服务概念 ⭐⭐⭐⭐

## 1. DDD核心概念 ⭐⭐⭐⭐⭐

### 什么是DDD？

```
DDD（Domain-Driven Design）- 领域驱动设计

核心思想：
1. 以业务领域为核心
2. 通过统一语言沟通
3. 将业务模型直接映射到代码
4. 分离领域逻辑与技术实现

适用场景：
✅ 复杂业务系统
✅ 微服务架构
✅ 需要长期维护的系统
❌ 简单CRUD系统
❌ 短期一次性项目
```

### DDD解决的问题

```
传统开发问题：
1. 业务与代码脱节
2. 贫血模型（只有getter/setter）
3. Service层逻辑混乱
4. 难以应对需求变化

DDD带来的改进：
1. 业务逻辑内聚在领域模型
2. 清晰的分层架构
3. 明确的边界划分
4. 易于维护和扩展
```

## 2. DDD战略设计 ⭐⭐⭐⭐⭐

### 统一语言（Ubiquitous Language）

```
核心原则：
业务人员、开发人员使用相同的术语

例子 - 电商系统：
✅ 使用"订单"，而不是"Order表"
✅ 使用"下单"，而不是"插入订单记录"
✅ 使用"支付"，而不是"更新支付状态"

好处：
- 减少沟通成本
- 代码即文档
- 业务变化快速响应
```

### 限界上下文（Bounded Context）⭐⭐⭐⭐⭐

```
定义：明确的业务边界，每个上下文有独立的模型

电商系统示例：
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 用户上下文   │  │ 订单上下文   │  │ 商品上下文   │
│             │  │             │  │             │
│ - 用户注册   │  │ - 创建订单   │  │ - 商品管理   │
│ - 用户登录   │  │ - 支付订单   │  │ - 库存管理   │
│ - 个人信息   │  │ - 订单状态   │  │ - 价格管理   │
└─────────────┘  └─────────────┘  └─────────────┘

注意：
- 同一个词在不同上下文含义可能不同
- 例如："用户"在用户上下文是完整信息，在订单上下文只是买家信息
```

### 子域划分

```
1. 核心域（Core Domain）⭐⭐⭐⭐⭐
   - 最核心的业务价值
   - 企业的竞争优势
   - 需要投入最多资源
   例：电商的推荐算法、秒杀系统

2. 支撑域（Supporting Subdomain）⭐⭐⭐⭐
   - 支撑核心业务
   - 有一定业务价值
   例：用户管理、订单管理

3. 通用域（Generic Subdomain）⭐⭐⭐
   - 通用功能
   - 可以使用现成方案
   例：支付对接、短信发送、文件存储
```

### 上下文映射（Context Mapping）

```java
/**
 * 不同上下文之间的关系 ⭐⭐⭐⭐⭐
 */

// 1. 防腐层（ACL - Anti-Corruption Layer）⭐⭐⭐⭐⭐
// 保护本上下文不受外部影响
@Component
public class OrderAntiCorruptionService {

    @Autowired
    private UserServiceClient userClient;

    /**
     * 将外部用户模型转换为订单上下文的用户模型
     */
    public OrderUser getUserForOrder(Long userId) {
        // 调用用户服务
        UserDTO externalUser = userClient.getById(userId);

        // 转换为订单上下文的用户模型
        return OrderUser.builder()
            .id(externalUser.getId())
            .name(externalUser.getName())
            .phone(externalUser.getPhone())
            .build();
    }
}

// 2. 共享内核（Shared Kernel）⭐⭐⭐⭐
// 多个上下文共享的模型
public class Money {
    private BigDecimal amount;
    private String currency;
    // 金钱对象可以在多个上下文共享
}

// 3. 开放主机服务（Open Host Service）⭐⭐⭐⭐
// 提供标准API供其他上下文调用
@RestController
@RequestMapping("/api/products")
public class ProductApiController {
    // 标准化的商品服务API
}
```

## 3. DDD战术设计 ⭐⭐⭐⭐⭐

### 分层架构

```
┌──────────────────────────────────────┐
│      用户接口层（User Interface）      │
│  - Controller：接收请求              │
│  - DTO：数据传输对象                 │
│  - Assembler：对象转换               │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│       应用层（Application）           │
│  - ApplicationService：应用服务      │
│  - 组合领域对象完成业务用例          │
│  - 事务控制                          │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│        领域层（Domain）⭐⭐⭐⭐⭐       │
│  - Entity：实体                      │
│  - ValueObject：值对象               │
│  - DomainService：领域服务           │
│  - Repository接口：仓储接口          │
│  - DomainEvent：领域事件             │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│      基础设施层（Infrastructure）     │
│  - RepositoryImpl：仓储实现          │
│  - 数据库访问                        │
│  - 外部服务调用                      │
│  - 消息队列                          │
└──────────────────────────────────────┘
```

### 实体（Entity）⭐⭐⭐⭐⭐

```java
/**
 * 实体的特点：
 * 1. 有唯一标识（ID）
 * 2. 有生命周期
 * 3. 可变
 * 4. 包含业务行为
 */

/**
 * ❌ 贫血模型（传统方式，不推荐）
 */
@Data
public class Order {
    private Long id;
    private Long userId;
    private BigDecimal amount;
    private Integer status;
    // 只有getter/setter，没有业务逻辑
}

/**
 * ✅ 充血模型（DDD方式，推荐）⭐⭐⭐⭐⭐
 */
@Getter
public class Order {
    private OrderId id;
    private UserId userId;
    private Money amount;
    private OrderStatus status;
    private List<OrderItem> items;
    private LocalDateTime createTime;

    /**
     * 构造方法：创建订单
     */
    public Order(UserId userId, List<OrderItem> items) {
        this.id = OrderId.generate();
        this.userId = userId;
        this.items = items;
        this.amount = calculateAmount();
        this.status = OrderStatus.CREATED;
        this.createTime = LocalDateTime.now();

        // 领域事件：订单创建
        DomainEventPublisher.publish(new OrderCreatedEvent(this));
    }

    /**
     * 业务行为：支付订单
     */
    public void pay(Money payAmount) {
        // 业务规则校验
        if (this.status != OrderStatus.CREATED) {
            throw new OrderException("订单状态不正确，无法支付");
        }

        if (!this.amount.equals(payAmount)) {
            throw new OrderException("支付金额不正确");
        }

        // 状态变更
        this.status = OrderStatus.PAID;

        // 领域事件：订单已支付
        DomainEventPublisher.publish(new OrderPaidEvent(this));
    }

    /**
     * 业务行为：取消订单
     */
    public void cancel() {
        if (this.status == OrderStatus.PAID) {
            throw new OrderException("已支付订单无法取消");
        }

        this.status = OrderStatus.CANCELLED;

        DomainEventPublisher.publish(new OrderCancelledEvent(this));
    }

    /**
     * 业务行为：计算订单金额
     */
    private Money calculateAmount() {
        BigDecimal total = items.stream()
            .map(OrderItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Money(total, "CNY");
    }
}

/**
 * 订单状态（枚举）
 */
public enum OrderStatus {
    CREATED("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String desc;

    OrderStatus(String desc) {
        this.desc = desc;
    }
}
```

### 值对象（Value Object）⭐⭐⭐⭐⭐

```java
/**
 * 值对象的特点：
 * 1. 没有唯一标识
 * 2. 不可变
 * 3. 通过属性值判断相等性
 * 4. 可以被共享
 */

/**
 * 金钱值对象 ⭐⭐⭐⭐⭐
 */
@Value
public class Money {
    BigDecimal amount;
    String currency;

    public Money(BigDecimal amount, String currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("金额不能为负");
        }
        this.amount = amount;
        this.currency = currency;
    }

    /**
     * 加法
     */
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("币种不同，无法相加");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    /**
     * 减法
     */
    public Money subtract(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("币种不同，无法相减");
        }
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    /**
     * 乘法
     */
    public Money multiply(int multiplier) {
        return new Money(this.amount.multiply(new BigDecimal(multiplier)), this.currency);
    }
}

/**
 * 地址值对象 ⭐⭐⭐⭐⭐
 */
@Value
public class Address {
    String province;
    String city;
    String district;
    String street;
    String detail;

    public Address(String province, String city, String district,
                   String street, String detail) {
        this.province = province;
        this.city = city;
        this.district = district;
        this.street = street;
        this.detail = detail;
    }

    /**
     * 完整地址
     */
    public String fullAddress() {
        return province + city + district + street + detail;
    }
}

/**
 * 邮箱值对象 ⭐⭐⭐⭐
 */
@Value
public class Email {
    String value;

    public Email(String value) {
        if (!isValid(value)) {
            throw new IllegalArgumentException("邮箱格式不正确");
        }
        this.value = value;
    }

    private boolean isValid(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}

/**
 * 电话号码值对象 ⭐⭐⭐⭐
 */
@Value
public class PhoneNumber {
    String value;

    public PhoneNumber(String value) {
        if (!isValid(value)) {
            throw new IllegalArgumentException("电话号码格式不正确");
        }
        this.value = value;
    }

    private boolean isValid(String phone) {
        return phone != null && phone.matches("^1[3-9]\\d{9}$");
    }
}
```

### 聚合（Aggregate）⭐⭐⭐⭐⭐

```java
/**
 * 聚合的特点：
 * 1. 一组相关对象的集合
 * 2. 有一个聚合根（Aggregate Root）
 * 3. 保证聚合内的一致性
 * 4. 通过聚合根访问聚合内对象
 */

/**
 * 订单聚合根 ⭐⭐⭐⭐⭐
 */
@Getter
public class Order {  // 聚合根
    private OrderId id;
    private UserId userId;
    private Address deliveryAddress;
    private Money totalAmount;
    private OrderStatus status;
    private List<OrderItem> items;  // 聚合内实体
    private LocalDateTime createTime;

    /**
     * 添加订单项
     */
    public void addItem(ProductId productId, int quantity, Money price) {
        // 通过聚合根操作聚合内对象
        OrderItem item = new OrderItem(productId, quantity, price);
        this.items.add(item);

        // 重新计算总金额
        this.totalAmount = calculateTotalAmount();
    }

    /**
     * 删除订单项
     */
    public void removeItem(ProductId productId) {
        this.items.removeIf(item -> item.getProductId().equals(productId));
        this.totalAmount = calculateTotalAmount();
    }

    private Money calculateTotalAmount() {
        return items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
}

/**
 * 订单项（聚合内实体）
 */
@Getter
class OrderItem {  // 只能通过Order访问
    private OrderItemId id;
    private ProductId productId;
    private String productName;
    private int quantity;
    private Money price;
    private Money amount;

    OrderItem(ProductId productId, int quantity, Money price) {
        this.id = OrderItemId.generate();
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
        this.amount = price.multiply(quantity);
    }
}

/**
 * 聚合设计原则：
 *
 * 1. 聚合边界要小
 *    ✅ Order + OrderItem
 *    ❌ Order + OrderItem + Product + User
 *
 * 2. 通过ID引用其他聚合
 *    ✅ Order持有UserId
 *    ❌ Order持有完整的User对象
 *
 * 3. 一次事务只修改一个聚合
 *    ✅ 创建订单时只修改Order聚合
 *    ❌ 创建订单时同时修改Order和Product聚合
 *
 * 4. 使用领域事件实现最终一致性
 *    订单支付成功 → 发布OrderPaidEvent → 库存服务监听并扣减库存
 */
```

### 领域服务（Domain Service）⭐⭐⭐⭐⭐

```java
/**
 * 领域服务的使用场景：
 * 1. 业务逻辑涉及多个聚合
 * 2. 不适合放在某个实体中
 * 3. 无状态的业务逻辑
 */

/**
 * 转账领域服务 ⭐⭐⭐⭐⭐
 */
@Service
public class TransferDomainService {

    /**
     * 转账业务涉及两个账户聚合，适合用领域服务
     */
    public void transfer(Account fromAccount, Account toAccount, Money amount) {
        // 业务规则校验
        if (!fromAccount.canTransfer(amount)) {
            throw new InsufficientBalanceException("余额不足");
        }

        // 操作两个聚合
        fromAccount.deduct(amount);
        toAccount.add(amount);

        // 发布领域事件
        DomainEventPublisher.publish(
            new TransferCompletedEvent(fromAccount.getId(), toAccount.getId(), amount)
        );
    }
}

/**
 * 价格计算领域服务 ⭐⭐⭐⭐⭐
 */
@Service
public class PricingDomainService {

    /**
     * 计算订单价格（涉及商品、优惠券、会员等级）
     */
    public Money calculateOrderPrice(List<OrderItem> items,
                                     Coupon coupon,
                                     MemberLevel memberLevel) {
        // 商品总价
        Money totalPrice = items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);

        // 优惠券折扣
        if (coupon != null) {
            totalPrice = coupon.applyDiscount(totalPrice);
        }

        // 会员折扣
        if (memberLevel != null) {
            totalPrice = memberLevel.applyDiscount(totalPrice);
        }

        return totalPrice;
    }
}

/**
 * 库存扣减领域服务 ⭐⭐⭐⭐⭐
 */
@Service
public class InventoryDomainService {

    @Autowired
    private InventoryRepository inventoryRepository;

    /**
     * 批量扣减库存
     */
    @Transactional
    public void deductInventory(List<OrderItem> items) {
        for (OrderItem item : items) {
            Inventory inventory = inventoryRepository.findByProductId(item.getProductId());

            if (!inventory.canDeduct(item.getQuantity())) {
                throw new InsufficientInventoryException("库存不足：" + item.getProductName());
            }

            inventory.deduct(item.getQuantity());
            inventoryRepository.save(inventory);
        }
    }
}
```

### 仓储（Repository）⭐⭐⭐⭐⭐

```java
/**
 * 仓储模式：
 * 1. 领域层定义接口
 * 2. 基础设施层实现接口
 * 3. 封装数据访问逻辑
 * 4. 返回领域对象
 */

/**
 * 订单仓储接口（领域层）⭐⭐⭐⭐⭐
 */
public interface OrderRepository {

    /**
     * 保存订单
     */
    void save(Order order);

    /**
     * 根据ID查询订单
     */
    Order findById(OrderId id);

    /**
     * 根据用户ID查询订单列表
     */
    List<Order> findByUserId(UserId userId);

    /**
     * 删除订单
     */
    void remove(OrderId id);
}

/**
 * 订单仓储实现（基础设施层）⭐⭐⭐⭐⭐
 */
@Repository
public class OrderRepositoryImpl implements OrderRepository {

    @Autowired
    private OrderMapper orderMapper;  // MyBatis Mapper

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Override
    public void save(Order order) {
        // 领域对象 → 数据对象
        OrderDO orderDO = OrderConverter.toDataObject(order);

        if (orderDO.getId() == null) {
            // 新增
            orderMapper.insert(orderDO);

            // 保存订单项
            for (OrderItem item : order.getItems()) {
                OrderItemDO itemDO = OrderItemConverter.toDataObject(item);
                itemDO.setOrderId(orderDO.getId());
                orderItemMapper.insert(itemDO);
            }
        } else {
            // 更新
            orderMapper.updateById(orderDO);
        }
    }

    @Override
    public Order findById(OrderId id) {
        // 查询订单
        OrderDO orderDO = orderMapper.selectById(id.getValue());
        if (orderDO == null) {
            return null;
        }

        // 查询订单项
        List<OrderItemDO> itemDOs = orderItemMapper.selectByOrderId(orderDO.getId());

        // 数据对象 → 领域对象
        return OrderConverter.toDomainObject(orderDO, itemDOs);
    }

    @Override
    public List<Order> findByUserId(UserId userId) {
        List<OrderDO> orderDOs = orderMapper.selectByUserId(userId.getValue());
        return orderDOs.stream()
            .map(orderDO -> {
                List<OrderItemDO> itemDOs = orderItemMapper.selectByOrderId(orderDO.getId());
                return OrderConverter.toDomainObject(orderDO, itemDOs);
            })
            .collect(Collectors.toList());
    }

    @Override
    public void remove(OrderId id) {
        orderMapper.deleteById(id.getValue());
        orderItemMapper.deleteByOrderId(id.getValue());
    }
}

/**
 * 数据对象（DO）
 */
@Data
@TableName("orders")
class OrderDO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private BigDecimal totalAmount;
    private String currency;
    private Integer status;
    private LocalDateTime createTime;
}
```

### 领域事件（Domain Event）⭐⭐⭐⭐⭐

```java
/**
 * 领域事件：
 * 1. 表示领域中发生的重要事情
 * 2. 实现聚合间的解耦
 * 3. 实现最终一致性
 */

/**
 * 订单已支付事件 ⭐⭐⭐⭐⭐
 */
@Data
@AllArgsConstructor
public class OrderPaidEvent {
    private OrderId orderId;
    private UserId userId;
    private Money amount;
    private LocalDateTime paidTime;
}

/**
 * 事件发布器
 */
@Component
public class DomainEventPublisher {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public static void publish(Object event) {
        SpringContextHolder.getBean(ApplicationEventPublisher.class)
            .publishEvent(event);
    }
}

/**
 * 事件监听器 ⭐⭐⭐⭐⭐
 */
@Component
@Slf4j
public class OrderEventListener {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private NotificationService notificationService;

    /**
     * 监听订单支付事件
     */
    @EventListener
    @Async
    public void handleOrderPaid(OrderPaidEvent event) {
        log.info("订单支付成功：{}", event.getOrderId());

        // 扣减库存
        inventoryService.deduct(event.getOrderId());

        // 发送通知
        notificationService.sendOrderPaidNotification(event.getUserId());
    }

    /**
     * 监听订单取消事件
     */
    @EventListener
    @Async
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("订单已取消：{}", event.getOrderId());

        // 恢复库存
        inventoryService.restore(event.getOrderId());
    }
}

/**
 * 使用消息队列实现事件 ⭐⭐⭐⭐⭐
 */
@Component
public class OrderEventPublisher {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void publishOrderPaid(OrderPaidEvent event) {
        // 发送到消息队列
        rocketMQTemplate.convertAndSend("order-paid-topic", event);
    }
}

@Component
@RocketMQMessageListener(
    topic = "order-paid-topic",
    consumerGroup = "inventory-consumer-group"
)
public class OrderPaidEventConsumer implements RocketMQListener<OrderPaidEvent> {

    @Override
    public void onMessage(OrderPaidEvent event) {
        // 处理订单支付事件
        // 扣减库存
    }
}
```

## 4. DDD完整案例 ⭐⭐⭐⭐⭐

### 项目结构

```
com.example.mall
├── interfaces（用户接口层）
│   ├── controller
│   │   └── OrderController.java
│   ├── dto
│   │   ├── CreateOrderRequest.java
│   │   └── OrderResponse.java
│   └── assembler
│       └── OrderAssembler.java
│
├── application（应用层）
│   └── service
│       └── OrderApplicationService.java
│
├── domain（领域层）⭐⭐⭐⭐⭐
│   ├── order（订单聚合）
│   │   ├── Order.java（聚合根）
│   │   ├── OrderItem.java（实体）
│   │   ├── OrderId.java（值对象）
│   │   ├── OrderStatus.java（枚举）
│   │   └── OrderRepository.java（仓储接口）
│   ├── product（商品聚合）
│   │   ├── Product.java
│   │   └── ProductRepository.java
│   ├── service（领域服务）
│   │   ├── PricingDomainService.java
│   │   └── InventoryDomainService.java
│   └── event（领域事件）
│       ├── OrderCreatedEvent.java
│       └── OrderPaidEvent.java
│
└── infrastructure（基础设施层）
    ├── repository
    │   └── impl
    │       └── OrderRepositoryImpl.java
    ├── persistence
    │   ├── mapper
    │   │   ├── OrderMapper.java
    │   │   └── OrderItemMapper.java
    │   ├── dataobject
    │   │   ├── OrderDO.java
    │   │   └── OrderItemDO.java
    │   └── converter
    │       └── OrderConverter.java
    └── messaging
        └── OrderEventPublisher.java
```

### 完整代码示例

```java
/**
 * 1. Controller（用户接口层）⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderApplicationService orderApplicationService;

    /**
     * 创建订单
     */
    @PostMapping
    public Result<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderApplicationService.createOrder(
            new UserId(request.getUserId()),
            request.getItems(),
            request.getAddress()
        );

        return Result.success(OrderAssembler.toResponse(order));
    }

    /**
     * 支付订单
     */
    @PostMapping("/{id}/pay")
    public Result<Void> payOrder(@PathVariable Long id, @RequestBody PayOrderRequest request) {
        orderApplicationService.payOrder(
            new OrderId(id),
            new Money(request.getAmount(), "CNY")
        );
        return Result.success();
    }
}

/**
 * 2. ApplicationService（应用层）⭐⭐⭐⭐⭐
 */
@Service
@Transactional
public class OrderApplicationService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PricingDomainService pricingService;

    @Autowired
    private DomainEventPublisher eventPublisher;

    /**
     * 创建订单
     */
    public Order createOrder(UserId userId, List<OrderItemDTO> itemDTOs, AddressDTO addressDTO) {
        // 1. 构建订单项
        List<OrderItem> items = new ArrayList<>();
        for (OrderItemDTO dto : itemDTOs) {
            Product product = productRepository.findById(new ProductId(dto.getProductId()));
            if (product == null) {
                throw new ProductNotFoundException("商品不存在");
            }

            OrderItem item = new OrderItem(
                product.getId(),
                product.getName(),
                dto.getQuantity(),
                product.getPrice()
            );
            items.add(item);
        }

        // 2. 创建订单（领域对象）
        Address address = new Address(
            addressDTO.getProvince(),
            addressDTO.getCity(),
            addressDTO.getDistrict(),
            addressDTO.getStreet(),
            addressDTO.getDetail()
        );

        Order order = new Order(userId, items, address);

        // 3. 保存订单
        orderRepository.save(order);

        // 4. 发布领域事件
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), userId));

        return order;
    }

    /**
     * 支付订单
     */
    public void payOrder(OrderId orderId, Money amount) {
        // 1. 查询订单
        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderNotFoundException("订单不存在");
        }

        // 2. 执行支付（领域逻辑）
        order.pay(amount);

        // 3. 保存订单
        orderRepository.save(order);

        // 4. 发布领域事件
        eventPublisher.publish(new OrderPaidEvent(
            order.getId(),
            order.getUserId(),
            order.getTotalAmount(),
            LocalDateTime.now()
        ));
    }
}

/**
 * 3. Order（领域层 - 聚合根）⭐⭐⭐⭐⭐
 */
@Getter
public class Order {
    private OrderId id;
    private UserId userId;
    private Address deliveryAddress;
    private Money totalAmount;
    private OrderStatus status;
    private List<OrderItem> items;
    private LocalDateTime createTime;

    /**
     * 构造方法：创建订单
     */
    public Order(UserId userId, List<OrderItem> items, Address deliveryAddress) {
        // 业务规则校验
        if (items == null || items.isEmpty()) {
            throw new OrderException("订单项不能为空");
        }

        this.id = OrderId.generate();
        this.userId = userId;
        this.items = new ArrayList<>(items);
        this.deliveryAddress = deliveryAddress;
        this.totalAmount = calculateTotalAmount();
        this.status = OrderStatus.CREATED;
        this.createTime = LocalDateTime.now();
    }

    /**
     * 业务行为：支付订单
     */
    public void pay(Money amount) {
        // 业务规则校验
        if (this.status != OrderStatus.CREATED) {
            throw new OrderException("订单状态不正确，无法支付");
        }

        if (!this.totalAmount.equals(amount)) {
            throw new OrderException("支付金额不正确");
        }

        // 状态变更
        this.status = OrderStatus.PAID;
    }

    /**
     * 业务行为：取消订单
     */
    public void cancel() {
        if (this.status == OrderStatus.PAID || this.status == OrderStatus.SHIPPED) {
            throw new OrderException("订单已支付或已发货，无法取消");
        }

        this.status = OrderStatus.CANCELLED;
    }

    /**
     * 业务行为：发货
     */
    public void ship() {
        if (this.status != OrderStatus.PAID) {
            throw new OrderException("订单未支付，无法发货");
        }

        this.status = OrderStatus.SHIPPED;
    }

    /**
     * 计算总金额
     */
    private Money calculateTotalAmount() {
        return items.stream()
            .map(OrderItem::getAmount)
            .reduce(Money.ZERO, Money::add);
    }
}
```

## 5. DDD与微服务 ⭐⭐⭐⭐⭐

### DDD在微服务中的应用

```
1. 限界上下文 = 微服务边界 ⭐⭐⭐⭐⭐

   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │ 用户上下文   │      │ 订单上下文   │      │ 商品上下文   │
   │             │      │             │      │             │
   │ User Service│ ───→ │Order Service│ ───→ │Product Svc  │
   └─────────────┘      └─────────────┘      └─────────────┘
         ↓                      ↓                    ↓
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │   User DB   │      │  Order DB   │      │ Product DB  │
   └─────────────┘      └─────────────┘      └─────────────┘

2. 每个微服务独立数据库 ⭐⭐⭐⭐⭐
   - 数据隔离
   - 独立部署
   - 技术栈自由选择

3. 通过领域事件实现服务间通信 ⭐⭐⭐⭐⭐
   订单服务 --[OrderPaidEvent]--> MQ ---> 库存服务
                                      └--> 通知服务

4. 使用防腐层隔离外部依赖 ⭐⭐⭐⭐
   防止外部服务变化影响本服务
```

### 微服务拆分步骤

```
步骤1：识别限界上下文 ⭐⭐⭐⭐⭐
- 分析业务领域
- 划分子域
- 确定上下文边界

步骤2：定义聚合 ⭐⭐⭐⭐⭐
- 识别实体和值对象
- 确定聚合根
- 明确聚合边界

步骤3：设计仓储接口 ⭐⭐⭐⭐
- 每个聚合一个仓储
- 定义查询方法

步骤4：识别领域服务 ⭐⭐⭐⭐
- 跨聚合的业务逻辑
- 复杂的业务规则

步骤5：定义领域事件 ⭐⭐⭐⭐⭐
- 重要的业务变化
- 服务间异步通信

步骤6：实现微服务 ⭐⭐⭐⭐⭐
- 每个限界上下文一个微服务
- 独立数据库
- 通过API和事件通信
```

## 💡 DDD最佳实践

### 1. 从战略设计开始

```
不要一上来就写代码！

第一步：理解业务领域
第二步：划分限界上下文
第三步：识别核心域、支撑域、通用域
第四步：设计上下文映射关系
第五步：再开始编码
```

### 2. 保持聚合边界小

```
✅ 好的聚合设计：
Order（订单）+ OrderItem（订单项）

❌ 不好的聚合设计：
Order + OrderItem + Product + User + Payment + Logistics
```

### 3. 使用充血模型

```
✅ 业务逻辑放在领域对象中：
order.pay(amount);

❌ 业务逻辑放在Service中：
orderService.payOrder(order, amount);
```

### 4. 通过事件实现最终一致性

```
同步调用：
订单服务 --同步调用--> 库存服务  ❌ 强耦合

异步事件：
订单服务 --发布事件--> MQ --> 库存服务  ✅ 解耦
```

### 5. 合理使用领域服务

```
适合用领域服务：
- 转账（涉及两个账户）
- 价格计算（涉及商品、优惠券、会员）

不适合用领域服务：
- 订单支付（单个聚合内的操作）
- 修改用户信息（单个聚合内的操作）
```

## 🚀 落地建议

### 1. 小步快跑

```
不要一开始就全面DDD化！

第一步：在一个核心模块尝试
第二步：总结经验和问题
第三步：逐步推广
```

### 2. 团队共识

```
- 统一语言
- 代码规范
- Review机制
- 培训学习
```

### 3. 工具支持

```
- 可视化建模工具
- 代码生成器
- 自动化测试
- 文档管理
```

## 📚 学习资源

### 必读书籍

1. **《领域驱动设计》** - Eric Evans（DDD之父）⭐⭐⭐⭐⭐
2. **《实现领域驱动设计》** - Vaughn Vernon ⭐⭐⭐⭐⭐
3. **《领域驱动设计精粹》** - Vaughn Vernon ⭐⭐⭐⭐⭐

### 推荐文章

- 阿里技术：《DDD在阿里的实践》
- 美团技术：《DDD在美团的应用》
- InfoQ：《领域驱动设计专题》

### 开源项目

- **COLA架构**：阿里开源的DDD框架
- **enode**：.NET平台的DDD框架

## 🎯 总结

### DDD核心要点 ⭐⭐⭐⭐⭐

1. **统一语言** - 业务与技术的桥梁
2. **限界上下文** - 明确业务边界
3. **充血模型** - 业务逻辑内聚
4. **聚合设计** - 保证一致性
5. **领域事件** - 解耦与最终一致性

### 适用场景

```
✅ 适合：
- 复杂业务系统
- 微服务架构
- 长期维护的系统

❌ 不适合：
- 简单CRUD系统
- 短期项目
- 技术演示Demo
```

### 学习路径

```
1. 理解概念（本文档）
2. 阅读经典书籍
3. 分析开源项目
4. 在实际项目中实践
5. 总结经验教训
```

**记住：DDD不是银弹，要根据实际情况选择合适的设计方法！**

## 📚 下一步

继续学习 [分布式技术](./分布式技术.md) 或 [消息队列](./消息队列.md)
