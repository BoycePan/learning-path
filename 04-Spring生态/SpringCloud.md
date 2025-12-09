# Spring Cloud微服务

## 📌 学习目标

- 理解微服务架构
- 掌握Spring Cloud核心组件
- 熟练使用服务注册与发现
- 掌握服务调用和负载均衡
- 了解微服务治理

## ⭐ Spring Cloud核心组件

- **Nacos** - 服务注册与配置中心 ⭐⭐⭐⭐⭐ ([详见完整指南](/05-微服务与中间件/Nacos.md))
- **OpenFeign** - 声明式服务调用 ⭐⭐⭐⭐⭐
- **Gateway** - 网关 ⭐⭐⭐⭐⭐ ([详见完整指南](/04-Spring生态/Spring%20Cloud网关.md))
- **Sentinel** - 流量控制和熔断降级 ⭐⭐⭐⭐⭐ ([详见完整指南](/05-微服务与中间件/Sentinel.md))

> **注意**：本文档聚焦2025年主流技术，不再介绍已淘汰的Eureka、Ribbon、Hystrix、Zuul、Config等组件。

## 1. Nacos服务注册与发现 ⭐⭐⭐⭐⭐

### 依赖配置

```xml
<!-- Spring Cloud Alibaba -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>2022.0.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Nacos服务发现 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

### 服务提供者

```yaml
# application.yml
spring:
  application:
    name: user-service # 服务名称
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848 # Nacos地址
        namespace: public # 命名空间
        group: DEFAULT_GROUP # 分组
```

```java
/**
 * 服务提供者 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableDiscoveryClient  // 启用服务发现
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return new User(id, "张三", "zhang@example.com");
    }
}
```

## 2. OpenFeign远程调用 ⭐⭐⭐⭐⭐

### 依赖配置

```xml
<!-- OpenFeign -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<!-- 负载均衡（Spring Cloud LoadBalancer）-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### Feign客户端

```java
/**
 * 启用Feign ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableFeignClients  // 启用Feign
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

/**
 * Feign接口定义 ⭐⭐⭐⭐⭐
 */
@FeignClient(name = "user-service")  // 服务名称
public interface UserFeignClient {

    @GetMapping("/users/{id}")
    User getUserById(@PathVariable("id") Long id);

    @PostMapping("/users")
    User createUser(@RequestBody User user);
}

/**
 * 使用Feign调用 ⭐⭐⭐⭐⭐
 */
@Service
public class OrderService {

    @Autowired
    private UserFeignClient userFeignClient;

    public void createOrder(Long userId) {
        // 远程调用用户服务
        User user = userFeignClient.getUserById(userId);
        System.out.println("用户：" + user.getName());
    }
}
```

### Feign配置

```yaml
# application.yml
feign:
  client:
    config:
      default: # 默认配置
        connectTimeout: 5000 # 连接超时
        readTimeout: 5000 # 读取超时
        loggerLevel: basic # 日志级别
  compression:
    request:
      enabled: true # 请求压缩
    response:
      enabled: true # 响应压缩
```

## 3. Gateway网关 ⭐⭐⭐⭐⭐

### 依赖配置

```xml
<!-- Gateway -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!-- Nacos -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

### 网关配置

```yaml
# application.yml
server:
  port: 9000

spring:
  application:
    name: gateway-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    gateway:
      routes: # 路由配置 ⭐⭐⭐⭐⭐
        - id: user-service # 路由ID
          uri: lb://user-service # 负载均衡URI
          predicates: # 断言
            - Path=/users/** # 路径匹配
          filters: # 过滤器
            - StripPrefix=0 # 去除前缀

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**
          filters:
            - AddRequestHeader=X-Request-Gateway, Gateway # 添加请求头

      # 全局跨域配置 ⭐⭐⭐⭐⭐
      globalcors:
        corsConfigurations:
          "[/**]":
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
```

### 自定义过滤器

```java
/**
 * 全局过滤器 ⭐⭐⭐⭐⭐
 */
@Component
@Slf4j
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (StringUtils.isBlank(token)) {
            log.warn("未登录访问");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // 验证token
        // ...

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;  // 优先级
    }
}
```

## 4. Sentinel流量控制 ⭐⭐⭐⭐⭐

### 依赖配置

```xml
<!-- Sentinel -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

### Sentinel配置

```yaml
# application.yml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080 # Sentinel控制台地址
        port: 8719 # 与控制台通信端口
      eager: true # 启动时加载
```

### 限流降级

```java
/**
 * 资源限流 ⭐⭐⭐⭐⭐
 */
@Service
public class UserService {

    /**
     * @SentinelResource注解 ⭐⭐⭐⭐⭐
     * value: 资源名称
     * blockHandler: 限流降级处理方法
     * fallback: 异常降级处理方法
     */
    @SentinelResource(
        value = "getUserById",
        blockHandler = "getUserByIdBlockHandler",
        fallback = "getUserByIdFallback"
    )
    public User getUserById(Long id) {
        // 业务逻辑
        return new User(id, "张三", "zhang@example.com");
    }

    /**
     * 限流处理 ⭐⭐⭐⭐⭐
     */
    public User getUserByIdBlockHandler(Long id, BlockException ex) {
        return new User(id, "限流用户", "blocked@example.com");
    }

    /**
     * 异常降级 ⭐⭐⭐⭐⭐
     */
    public User getUserByIdFallback(Long id, Throwable ex) {
        return new User(id, "降级用户", "fallback@example.com");
    }
}

/**
 * Feign集成Sentinel ⭐⭐⭐⭐⭐
 */
@FeignClient(
    name = "user-service",
    fallback = UserFeignClientFallback.class  // 降级类
)
public interface UserFeignClient {
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);
}

@Component
public class UserFeignClientFallback implements UserFeignClient {
    @Override
    public User getUserById(Long id) {
        return new User(id, "Feign降级", "feign-fallback@example.com");
    }
}
```

## 5. Nacos配置中心 ⭐⭐⭐⭐⭐

### 依赖配置

```xml
<!-- Nacos配置 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>

<!-- Bootstrap（用于配置加载）-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

### 配置文件

```yaml
# bootstrap.yml（优先加载）⭐⭐⭐⭐⭐
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: localhost:8848 # Nacos地址
        file-extension: yaml # 配置文件格式
        namespace: public
        group: DEFAULT_GROUP
        refresh-enabled: true # 动态刷新
```

### 动态刷新配置

```java
/**
 * 配置动态刷新 ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/config")
@RefreshScope  // 启用配置刷新
public class ConfigController {

    @Value("${app.name}")
    private String appName;

    @Value("${app.version}")
    private String appVersion;

    @GetMapping("/info")
    public String getInfo() {
        return "应用：" + appName + "，版本：" + appVersion;
    }
}
```

## 6. 分布式事务Seata ⭐⭐⭐⭐⭐

```xml
<!-- Seata -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

```yaml
# application.yml
seata:
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
```

```java
/**
 * 分布式事务 ⭐⭐⭐⭐⭐
 */
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductFeignClient productFeignClient;

    @Autowired
    private AccountFeignClient accountFeignClient;

    /**
     * @GlobalTransactional标记全局事务 ⭐⭐⭐⭐⭐
     */
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class
    )
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);

        // 2. 扣减库存（远程调用）
        productFeignClient.deductStock(order.getProductId(), order.getCount());

        // 3. 扣减账户余额（远程调用）
        accountFeignClient.deduct(order.getUserId(), order.getAmount());

        // 如果任何一步失败，全部回滚
    }
}
```

## 💡 微服务架构最佳实践 ⭐⭐⭐⭐⭐

### 1. 服务拆分原则

```
单一职责：每个服务只做一件事
高内聚低耦合：相关功能聚合，减少依赖
业务驱动：按业务领域拆分
独立部署：可以独立开发、测试、部署
```

### 2. 服务调用链路

```
客户端 → Gateway网关 → 服务A → 服务B
              ↓
          Sentinel限流
              ↓
          Nacos注册中心
              ↓
          OpenFeign调用
```

### 3. 常见微服务模式

```java
/**
 * 1. API网关模式 ⭐⭐⭐⭐⭐
 * - 统一入口
 * - 路由转发
 * - 认证鉴权
 * - 限流熔断
 */

/**
 * 2. 服务注册与发现 ⭐⭐⭐⭐⭐
 * - 服务自动注册
 * - 服务发现
 * - 健康检查
 * - 负载均衡
 */

/**
 * 3. 配置中心 ⭐⭐⭐⭐⭐
 * - 集中管理配置
 * - 动态刷新
 * - 配置版本管理
 */

/**
 * 4. 链路追踪 ⭐⭐⭐⭐
 * - Sleuth + Zipkin
 * - 请求链路追踪
 * - 性能分析
 */

/**
 * 5. 服务监控 ⭐⭐⭐⭐⭐
 * - Prometheus + Grafana
 * - 指标采集
 * - 可视化监控
 * - 告警通知
 */
```

## 🎯 重点总结

### Spring Cloud Alibaba组件选型 ⭐⭐⭐⭐⭐

| 功能       | 组件         | 推荐度     |
| ---------- | ------------ | ---------- |
| 注册中心   | Nacos        | ⭐⭐⭐⭐⭐ |
| 配置中心   | Nacos Config | ⭐⭐⭐⭐⭐ |
| 服务调用   | OpenFeign    | ⭐⭐⭐⭐⭐ |
| 负载均衡   | LoadBalancer | ⭐⭐⭐⭐⭐ |
| 网关       | Gateway      | ⭐⭐⭐⭐⭐ |
| 限流熔断   | Sentinel     | ⭐⭐⭐⭐⭐ |
| 分布式事务 | Seata        | ⭐⭐⭐⭐⭐ |

### 微服务开发流程 ⭐⭐⭐⭐⭐

```
1. 搭建Nacos服务器
2. 创建Gateway网关服务
3. 创建各个微服务
4. 配置服务注册与发现
5. 使用OpenFeign进行服务调用
6. 配置Sentinel限流降级
7. 集成配置中心
8. 添加链路追踪和监控
```

## 📚 练习建议

1. 搭建Nacos环境
2. 创建2-3个微服务实现服务调用
3. 配置Gateway网关
4. 实现Sentinel限流
5. 体验配置动态刷新

## 🎯 下一步

完成Spring生态学习后，继续学习 [微服务与中间件](../05-微服务与中间件/)
