# Spring Cloud 网关（Gateway）完全指南

## 📌 学习目标

- 理解API网关的核心概念和作用
- 掌握Spring Cloud Gateway的配置和使用
- 实现路由、过滤、限流等网关功能
- 学会自定义网关过滤器和全局过滤器
- 掌握网关的认证、鉴权和安全防护

## ⭐ 网关的核心价值 ⭐⭐⭐⭐⭐

### 1. 统一入口

```
原始架构：                          网关架构：
┌─────────┐                       ┌─────────────┐
│ 客户端  │                       │   客户端    │
└────┬────┘                       └──────┬──────┘
     │                                   │
   ┌─┴──┬────────┬─────────┐      ┌─────▼────────┐
   │    │        │         │      │  API网关     │
┌──▼──┐ │ ┌──────▼───┐ ┌───▼──┐  ├──────┬───────┤
│服务A│ └─┤  服务B   │ │服务C │  │路由转发      │
└─────┘   └──────────┘ └──────┘  │认证鉴权      │
                                  │限流降级      │
                                  │日志监控      │
                                  └──────┬───────┘
                                         │
                                    ┌────┴──────┬─────────┬───────┐
                                    │           │         │       │
                                  ┌─▼──┐  ┌────▼──┐ ┌────▼──┐ ┌──▼───┐
                                  │服A │  │服B   │ │服C    │ │服D   │
                                  └────┘  └───────┘ └───────┘ └──────┘
```

### 2. 网关的核心功能

| 功能 | 描述 | 优势 |
|------|------|------|
| **路由转发** | 根据请求路径转发到不同服务 | 统一入口、解耦客户端 |
| **认证鉴权** | 集中验证用户身份和权限 | 提高安全性 |
| **限流降级** | 保护后端服务免受过载 | 提升系统稳定性 |
| **请求转换** | 修改请求头、参数等 | 灵活适配各服务 |
| **响应转换** | 统一响应格式 | 提升API一致性 |
| **日志监控** | 记录和追踪所有请求 | 便于问题排查 |
| **负载均衡** | 分散流量到多个实例 | 提高吞吐量 |

## 🚀 Spring Cloud Gateway 基础配置

### 1. 依赖配置 ⭐⭐⭐⭐⭐

```xml
<!-- Spring Cloud Gateway -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!-- 注册到Nacos服务中心 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>

<!-- 使用Nacos配置中心 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>

<!-- Bootstrap加载器 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>

<!-- 注意：不要同时引入Spring WebFlux和Spring Web -->
<!-- Gateway基于Spring WebFlux异步非阻塞 -->
```

### 2. 启动类配置 ⭐⭐⭐⭐⭐

```java
/**
 * API网关启动类 ⭐⭐⭐⭐⭐
 *
 * 注意：
 * 1. 不需要@EnableGateway注解（自动启用）
 * 2. 不需要@EnableDiscoveryClient（自动启用）
 * 3. 可以选择@EnableNacos*来加载配置中心
 */
@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

### 3. 基础YAML配置 ⭐⭐⭐⭐⭐

```yaml
# application.yaml
server:
  port: 9000  # 网关端口

spring:
  application:
    name: api-gateway  # 应用名称

  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP

      config:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        file-extension: yaml

    # 网关路由配置 ⭐⭐⭐⭐⭐
    gateway:
      # 启用从Nacos动态加载路由
      discovery:
        locator:
          enabled: true  # 启用服务发现
          lower-case-service-id: true  # 小写服务名

      # 路由配置列表
      routes:
        # 用户服务路由 ⭐⭐⭐⭐⭐
        - id: user-service
          uri: lb://user-service  # 负载均衡URI（lb://服务名）
          predicates:
            - Path=/users/**,/api/users/**  # 路径断言（支持多个）
            - Method=GET,POST,PUT,DELETE  # HTTP方法断言
          filters:
            - StripPrefix=0  # 不去除前缀
            - AddRequestHeader=X-Request-From,Gateway  # 添加请求头
            - AddResponseHeader=X-Response-From,Gateway  # 添加响应头

        # 订单服务路由 ⭐⭐⭐⭐⭐
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**,/api/orders/**
            - Method=GET,POST,PUT,DELETE
          filters:
            - StripPrefix=1  # 去除1级路径前缀
            - RewritePath=/api/orders/(?<segment>.*), /orders/$\{segment}  # 路径重写

        # 产品服务路由
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/products/**
          filters:
            - StripPrefix=0

      # 全局过滤器配置
      default-filters:
        - AddRequestHeader=X-Gateway-Request-ID, ${UUID}  # 全局添加请求ID
        - AddRequestHeader=X-Request-Time, ${System.currentTimeMillis()}  # 添加请求时间

      # 全局跨域配置 ⭐⭐⭐⭐⭐
      globalcors:
        cors-configurations:
          "[/**]":
            allowedOrigins: "*"  # 允许的源（生产环境应指定具体域名）
            allowedMethods: GET,POST,PUT,DELETE,OPTIONS,HEAD
            allowedHeaders: "*"
            exposedHeaders: X-Request-ID,X-Response-Time
            maxAge: 3600
            allowCredentials: false

# 日志配置
logging:
  level:
    org.springframework.cloud.gateway: INFO
    org.springframework.http.server.reactive: INFO
```

## 🎯 路由配置详解

### 1. 断言（Predicates）⭐⭐⭐⭐⭐

断言用于判断请求是否匹配某个路由规则。

```yaml
routes:
  - id: demo-service
    uri: lb://demo-service
    predicates:
      # 1. 路径断言 ⭐⭐⭐⭐⭐
      - Path=/demo/**,/api/demo/**

      # 2. 方法断言 ⭐⭐⭐⭐⭐
      - Method=GET,POST

      # 3. 主机名断言
      - Host=*.example.com,example.com

      # 4. 请求头断言
      - Header=X-Request-Id,\d+  # 请求头中需要存在且匹配正则表达式

      # 5. Query断言（查询参数）
      - Query=type,^user$  # ?type=user
      - Query=version  # 只需存在该参数

      # 6. Cookie断言
      - Cookie=name,^value$

      # 7. 时间断言
      - After=2025-01-01T00:00:00+08:00
      - Before=2025-12-31T23:59:59+08:00
      - Between=2025-01-01T00:00:00+08:00,2025-12-31T23:59:59+08:00

      # 8. 权重断言（路由优先级）
      - Weight=group1,10  # 分组为group1，权重为10
```

### 2. 过滤器（Filters）⭐⭐⭐⭐⭐

过滤器用于对请求和响应进行处理。

```yaml
routes:
  - id: demo-service
    uri: lb://demo-service
    predicates:
      - Path=/demo/**
    filters:
      # 1. 请求头过滤器 ⭐⭐⭐⭐⭐
      - AddRequestHeader=X-Request-From,Gateway
      - RemoveRequestHeader=X-Secret-Token
      - SetRequestHeader=User-Agent,MyGateway/1.0

      # 2. 响应头过滤器 ⭐⭐⭐⭐⭐
      - AddResponseHeader=X-Response-From,Gateway
      - RemoveResponseHeader=Server
      - SetResponseHeader=X-Custom-Response,Success

      # 3. 路径前缀过滤器 ⭐⭐⭐⭐⭐
      - StripPrefix=1  # 去除1级路径前缀
      # 请求: /demo/user/1 -> 转发: /user/1

      # 4. 路径重写过滤器 ⭐⭐⭐⭐⭐
      - RewritePath=/demo/(?<segment>.*), /api/$\{segment}
      # 请求: /demo/user/1 -> 转发: /api/user/1

      # 5. 请求参数过滤器
      - AddRequestParameter=token,abc123
      - RemoveRequestParameter=debug

      # 6. 返回状态码过滤器
      - SetStatus=200  # 设置响应状态码

      # 7. 重定向过滤器
      - RedirectTo=302,https://example.com

      # 8. 速率限制过滤器（需要配置RedisRateLimiter）
      - name: RequestRateLimiter
        args:
          redis-rate-limiter.replenish-rate: 10  # 每秒允许的请求数
          redis-rate-limiter.requested-tokens: 1  # 每个请求的令牌数
          key-resolver: "#{@userKeyResolver}"  # 限流键的解析器
```

## 🔐 自定义过滤器

### 1. 自定义网关过滤器（GatewayFilter）⭐⭐⭐⭐⭐

```java
/**
 * 自定义网关过滤器 - 处理请求和响应
 *
 * GatewayFilter：应用于特定路由
 * GlobalFilter：应用于所有路由
 */
@Component
@Slf4j
public class LoggingGatewayFilter implements GatewayFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        // 获取请求信息
        ServerHttpRequest request = exchange.getRequest();
        String method = request.getMethodValue();
        String path = request.getPath().value();
        String clientIp = getClientIp(request);

        log.info("网关收到请求 -> 方法: {}, 路径: {}, 客户端IP: {}",
            method, path, clientIp);

        // 记录请求时间
        long startTime = System.currentTimeMillis();

        // 继续执行过滤器链
        return chain.filter(exchange).doFinally(signalType -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = exchange.getResponse().getStatusCode() != null
                ? exchange.getResponse().getStatusCode().value()
                : 0;

            log.info("网关响应完成 -> 方法: {}, 路径: {}, 状态码: {}, 耗时: {}ms",
                method, path, statusCode, duration);
        });
    }

    @Override
    public int getOrder() {
        return -1;  // 优先级（值越小优先级越高）
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddress() != null
            ? request.getRemoteAddress().getAddress().getHostAddress()
            : "unknown";
    }
}

/**
 * 过滤器工厂 - 用于YAML配置 ⭐⭐⭐⭐⭐
 */
@Component
public class LoggingGatewayFilterFactory extends
        AbstractGatewayFilterFactory<LoggingGatewayFilterFactory.Config> {

    public LoggingGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            log.info("过滤器工厂: {}, 日志前缀: {}",
                this.getClass().getName(), config.prefix);
            return chain.filter(exchange);
        };
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("prefix");
    }

    // 配置类
    @Data
    public static class Config {
        private String prefix = "[GATEWAY]";
    }
}
```

### 2. 全局过滤器（GlobalFilter）⭐⭐⭐⭐⭐

```java
/**
 * 全局认证过滤器 - 应用于所有路由
 */
@Component
@Slf4j
@Order(-1)  // 优先级（值越小优先级越高）
public class AuthGlobalFilter implements GlobalFilter {

    @Value("${gateway.auth.enabled:true}")
    private boolean authEnabled;

    // 无需认证的路径（白名单）
    private static final List<String> SKIP_AUTH_PATHS = Arrays.asList(
        "/login",
        "/register",
        "/api/public",
        "/health"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // 检查是否需要跳过认证
        if (!authEnabled || isSkipPath(path)) {
            return chain.filter(exchange);
        }

        // 获取认证令牌
        String token = getToken(request);

        if (!isValidToken(token)) {
            log.warn("无效的令牌: {}, 路径: {}", token, path);
            return unauthorized(exchange, "无效或缺失的认证令牌");
        }

        // 验证令牌
        try {
            Claims claims = validateToken(token);

            // 将用户信息添加到请求上下文
            ServerHttpRequest newRequest = request.mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Name", claims.get("username", String.class))
                .header("X-User-Roles", claims.get("roles", String.class))
                .build();

            ServerWebExchange newExchange = exchange.mutate()
                .request(newRequest)
                .build();

            return chain.filter(newExchange);

        } catch (Exception e) {
            log.error("令牌验证失败: {}", e.getMessage());
            return unauthorized(exchange, "令牌验证失败");
        }
    }

    /**
     * 获取请求中的令牌 ⭐⭐⭐⭐⭐
     */
    private String getToken(ServerHttpRequest request) {
        // 1. 从Authorization头获取
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (!CollectionUtils.isEmpty(authHeaders)) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // 2. 从Cookie获取
        HttpCookie cookie = request.getCookies().getFirst("token");
        if (cookie != null) {
            return cookie.getValue();
        }

        // 3. 从请求参数获取
        String token = request.getQueryParams().getFirst("token");
        if (token != null) {
            return token;
        }

        return null;
    }

    /**
     * 验证令牌 ⭐⭐⭐⭐⭐
     */
    private Claims validateToken(String token) {
        // 这里应该使用JWT验证库（如io.jsonwebtoken）
        // 示例：
        // try {
        //     return Jwts.parserBuilder()
        //         .setSigningKey(getSigningKey())
        //         .build()
        //         .parseClaimsJws(token)
        //         .getBody();
        // } catch (JwtException e) {
        //     throw new AuthException("Token验证失败", e);
        // }

        // 暂时返回模拟数据
        return new DefaultClaims();
    }

    /**
     * 检查是否需要跳过认证
     */
    private boolean isSkipPath(String path) {
        return SKIP_AUTH_PATHS.stream()
            .anyMatch(skipPath -> path.startsWith(skipPath));
    }

    /**
     * 检查令牌有效性
     */
    private boolean isValidToken(String token) {
        return token != null && !token.isEmpty() && token.length() > 10;
    }

    /**
     * 返回未授权响应 ⭐⭐⭐⭐⭐
     */
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);

        byte[] responseBytes = ("{\"code\": 401, \"message\": \"" + message + "\"}")
            .getBytes(StandardCharsets.UTF_8);

        DataBuffer dataBuffer = response.bufferFactory()
            .wrap(responseBytes);

        return response.writeWith(Mono.just(dataBuffer));
    }
}

/**
 * 全局异常过滤器 - 捕获整个网关的异常
 */
@Component
@Slf4j
@Order(Integer.MIN_VALUE)  // 最高优先级
public class GlobalExceptionFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
            .onErrorResume(throwable -> handleException(exchange, throwable));
    }

    private Mono<Void> handleException(ServerWebExchange exchange, Throwable ex) {
        log.error("网关异常: ", ex);

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String responseData = "{\"code\": 500, \"message\": \"网关处理异常\"}";
        byte[] responseBytes = responseData.getBytes(StandardCharsets.UTF_8);

        DataBuffer dataBuffer = response.bufferFactory()
            .wrap(responseBytes);

        return response.writeWith(Mono.just(dataBuffer));
    }
}
```

### 3. 限流过滤器（需要Redis）⭐⭐⭐⭐⭐

```xml
<!-- Redis依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 反应式Redis -->
<dependency>
    <groupId>io.lettuce</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
```

```java
/**
 * 限流键解析器 - 基于用户ID限流
 */
@Component("userKeyResolver")
@Slf4j
public class UserKeyResolver implements KeyResolver {

    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        // 优先从header获取用户ID（认证后添加）
        String userId = exchange.getRequest()
            .getHeaders()
            .getFirst("X-User-Id");

        if (userId != null) {
            return Mono.just(userId);
        }

        // 如果没有用户ID，使用IP地址
        String clientIp = getClientIp(exchange.getRequest());
        return Mono.just("IP:" + clientIp);
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddress() != null
            ? request.getRemoteAddress().getAddress().getHostAddress()
            : "unknown";
    }
}

/**
 * 限流配置类
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(10, 10);  // 容量为10，补充率为10
    }
}
```

```yaml
# 网关限流配置
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/users/**
          filters:
            # 限流配置 ⭐⭐⭐⭐⭐
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenish-rate: 10  # 每秒补充10个令牌
                redis-rate-limiter.requested-tokens: 1  # 每个请求消耗1个令牌
                key-resolver: "#{@userKeyResolver}"  # 使用自定义的限流键解析器
```

## 📊 网关架构最佳实践

### 1. 请求流程 ⭐⭐⭐⭐⭐

```
请求进入
  ↓
[Predicates 断言] → 判断是否匹配路由
  ↓ (匹配)
[Pre Filters] → 网关过滤器
  ↓
[Global Filters] → 全局过滤器（认证、限流等）
  ↓
[转发请求] → 转发给后端服务
  ↓
[Post Filters] → 响应后置处理
  ↓
返回响应到客户端
```

### 2. 网关高可用部署 ⭐⭐⭐⭐⭐

```yaml
# 多个网关实例配置
spring:
  application:
    name: api-gateway

  cloud:
    nacos:
      discovery:
        server-addr: nacos-server:8848
        # 多个Nacos集群地址用逗号分隔
        # server-addr: nacos1:8848,nacos2:8848,nacos3:8848

---
# 使用Nginx进行网关层负载均衡
upstream gateway-cluster {
    server gateway-1:9000;
    server gateway-2:9000;
    server gateway-3:9000;
}

server {
    listen 8080;
    server_name api.example.com;

    location / {
        proxy_pass http://gateway-cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 安全防护 ⭐⭐⭐⭐⭐

```java
/**
 * 安全过滤器 - 防止常见攻击
 */
@Component
@Slf4j
@Order(1)
public class SecurityGlobalFilter implements GlobalFilter {

    // SQL注入检测关键词
    private static final Pattern SQL_INJECTION =
        Pattern.compile("(?i)(union|select|insert|update|delete|drop|create|alter)");

    // XSS攻击检测关键词
    private static final Pattern XSS_PATTERN =
        Pattern.compile("(?i)(<script|<iframe|javascript:|onerror=|onclick=)");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String queryString = request.getURI().getRawQuery();

        // 检查SQL注入
        if (checkSQLInjection(path, queryString)) {
            log.warn("检测到SQL注入攻击 -> 路径: {}", path);
            return sendError(exchange, "请求非法");
        }

        // 检查XSS攻击
        if (checkXSS(path, queryString)) {
            log.warn("检测到XSS攻击 -> 路径: {}", path);
            return sendError(exchange, "请求非法");
        }

        // 限制请求大小
        long contentLength = request.getHeaders().getContentLength();
        if (contentLength > 10 * 1024 * 1024) {  // 限制10MB
            log.warn("请求体过大 -> 大小: {}MB", contentLength / (1024 * 1024));
            return sendError(exchange, "请求体过大");
        }

        return chain.filter(exchange);
    }

    private boolean checkSQLInjection(String path, String queryString) {
        return (path != null && SQL_INJECTION.matcher(path).find()) ||
               (queryString != null && SQL_INJECTION.matcher(queryString).find());
    }

    private boolean checkXSS(String path, String queryString) {
        return (path != null && XSS_PATTERN.matcher(path).find()) ||
               (queryString != null && XSS_PATTERN.matcher(queryString).find());
    }

    private Mono<Void> sendError(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.BAD_REQUEST);
        byte[] responseBytes = ("{\"error\": \"" + message + "\"}")
            .getBytes(StandardCharsets.UTF_8);
        DataBuffer dataBuffer = response.bufferFactory().wrap(responseBytes);
        return response.writeWith(Mono.just(dataBuffer));
    }
}
```

### 4. 监控和日志 ⭐⭐⭐⭐⭐

```java
/**
 * 网关监控过滤器
 */
@Component
@Slf4j
@Order(2)
public class MetricsGlobalFilter implements GlobalFilter {

    private final MeterRegistry meterRegistry;

    @Autowired
    public MetricsGlobalFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        return chain.filter(exchange).doFinally(signalType -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = exchange.getResponse().getStatusCode() != null
                ? exchange.getResponse().getStatusCode().value()
                : 0;

            // 记录请求时长
            meterRegistry.timer("gateway.request.duration",
                "path", path,
                "status", String.valueOf(statusCode)
            ).record(duration, TimeUnit.MILLISECONDS);

            // 记录请求计数
            meterRegistry.counter("gateway.requests",
                "path", path,
                "status", String.valueOf(statusCode)
            ).increment();

            log.info("请求完成 -> 路径: {}, 状态: {}, 耗时: {}ms",
                path, statusCode, duration);
        });
    }
}
```

## 🔄 微服务网关集成示例

### 完整的网关应用示例 ⭐⭐⭐⭐⭐

```java
/**
 * 完整的网关应用配置
 */
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    /**
     * CORS跨域配置 ⭐⭐⭐⭐⭐
     */
    @Bean
    public WebFluxConfigurer webFluxConfigurer() {
        return new WebFluxConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOriginPatterns("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .exposedHeaders("*")
                    .maxAge(3600)
                    .allowCredentials(false);
            }
        };
    }

    /**
     * 监控端点 ⭐⭐⭐⭐⭐
     */
    @RestController
    @RequestMapping("/gateway")
    public class GatewayController {

        @GetMapping("/health")
        public Mono<ResponseEntity<Map<String, String>>> health() {
            Map<String, String> map = new HashMap<>();
            map.put("status", "UP");
            map.put("timestamp", LocalDateTime.now().toString());
            return Mono.just(ResponseEntity.ok(map));
        }

        @GetMapping("/routes")
        public Mono<ResponseEntity<List<?>>> routes(RouteLocator routeLocator) {
            return routeLocator.getRoutes()
                .map(route -> route.getId())
                .collectList()
                .map(ResponseEntity::ok);
        }
    }
}
```

## 💡 常见问题和解决方案

### 1. 请求头丢失问题 ⭐⭐⭐⭐⭐

```yaml
spring:
  cloud:
    gateway:
      default-filters:
        # 保留原有的Host头
        - PreserveHostHeader

        # 添加转发相关头
        - AddRequestHeader=X-Forwarded-Proto, https
        - AddRequestHeader=X-Forwarded-Host, ${spring.cloud.gateway.globalcors.corsConfigurations.[/**].allowedOrigins[0]}
```

### 2. WebSocket支持 ⭐⭐⭐⭐⭐

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: websocket-service
          uri: ws://websocket-service:8080  # 使用ws://协议
          predicates:
            - Path=/ws/**
```

### 3. 大文件上传 ⭐⭐⭐⭐⭐

```properties
# 增加最大上传文件大小
spring.codec.max-in-memory-size=10485760  # 10MB
```

### 4. 超时设置 ⭐⭐⭐⭐⭐

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 5000  # 连接超时（毫秒）
        response-timeout: 30000  # 响应超时（毫秒）
```

## 🎯 重点总结

### Spring Cloud Gateway 核心概念

| 概念 | 说明 | 关键点 |
|------|------|--------|
| **Route** | 路由规则 | ID、目标URI、Predicates、Filters |
| **Predicate** | 请求断言 | 判断请求是否匹配 |
| **Filter** | 过滤器 | 处理请求和响应 |
| **GatewayFilter** | 网关过滤器 | 应用于特定路由 |
| **GlobalFilter** | 全局过滤器 | 应用于所有路由 |

### 学习路径 ⭐⭐⭐⭐⭐

```
基础配置 → 路由规则 → 内置过滤器 → 自定义过滤器 → 高可用部署
   ↓          ↓           ↓            ↓              ↓
YAML路由   Predicates   Filter工厂  GatewayFilter   集群部署
```

### 部署检查清单

- [ ] 配置了服务发现（Nacos）
- [ ] 配置了路由规则
- [ ] 实现了认证过滤器
- [ ] 配置了限流降级
- [ ] 添加了安全防护
- [ ] 启用了监控日志
- [ ] 配置了跨域
- [ ] 测试了高可用

## 📚 练习建议

1. **基础练习**
   - 创建网关应用并配置2-3条路由
   - 使用内置过滤器修改请求头和响应头
   - 实现路径重写

2. **进阶练习**
   - 实现认证授权过滤器
   - 集成Redis实现限流
   - 实现安全防护过滤器

3. **高级练习**
   - 实现动态路由加载
   - 配置网关集群和负载均衡
   - 集成Prometheus监控

## 🔗 关联学习

- 前置知识：[Spring Cloud 微服务](/04-Spring生态/SpringCloud.md)
- 相关技术：[服务监控与链路追踪](/05-微服务与中间件/服务监控与链路追踪.md)
- 架构设计：[微服务架构设计](/08-架构设计/微服务架构设计.md)

---

**下一步：** 掌握网关后，继续学习[微服务架构](/05-微服务与中间件/微服务架构.md)和[服务监控与链路追踪](/05-微服务与中间件/服务监控与链路追踪.md)
