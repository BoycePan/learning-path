# Spring Cloud网关实战项目

## 📌 项目概述

这是一个完整的 **微服务网关示例项目**，展示如何构建一个生产级别的API网关系统，包括路由管理、认证授权、限流降级、监控追踪等核心功能。

### 项目架构

```
┌─────────────────┐
│   客户端请求    │
└────────┬────────┘
         │
    ┌────▼────────────────────┐
    │   Nginx负载均衡器       │
    └────┬──────────┬─────────┘
         │          │
    ┌────▼──┐  ┌────▼──┐
    │网关1  │  │网关2  │
    └────┬──┘  └───┬───┘
         │        │
    ┌────▼────────▼────┐
    │  Nacos注册中心   │
    └────┬─────────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
┌───▼──────┐  ┌──────────┐  ┌────────▼──┐
│用户服务   │  │订单服务  │  │产品服务   │
└──────────┘  └──────────┘  └───────────┘
```

## 🛠️ 项目结构

```
spring-cloud-gateway-example/
├── gateway-service/                 # 网关服务主项目
│   ├── src/main/java/
│   │   └── com/example/gateway/
│   │       ├── GatewayApplication.java           # 启动类
│   │       ├── config/
│   │       │   ├── GatewayConfig.java            # 网关配置类
│   │       │   ├── CorsConfig.java               # CORS配置
│   │       │   └── SecurityConfig.java           # 安全配置
│   │       ├── filter/
│   │       │   ├── AuthGlobalFilter.java         # 认证过滤器
│   │       │   ├── LoggingGlobalFilter.java      # 日志过滤器
│   │       │   ├── SecurityGlobalFilter.java     # 安全过滤器
│   │       │   ├── MetricsGlobalFilter.java      # 监控过滤器
│   │       │   └── ResponseGlobalFilter.java     # 响应处理过滤器
│   │       ├── resolver/
│   │       │   └── UserKeyResolver.java          # 限流键解析器
│   │       ├── entity/
│   │       │   ├── User.java                     # 用户实体
│   │       │   ├── AuthToken.java                # 令牌实体
│   │       │   └── ApiResponse.java              # API响应
│   │       ├── exception/
│   │       │   ├── AuthException.java            # 认证异常
│   │       │   └── GatewayException.java         # 网关异常
│   │       ├── util/
│   │       │   ├── JwtUtil.java                  # JWT工具类
│   │       │   └── IpUtil.java                   # IP工具类
│   │       ├── controller/
│   │       │   └── GatewayController.java        # 网关控制器
│   │       └── service/
│   │           └── TokenService.java             # 令牌服务
│   ├── src/main/resources/
│   │   ├── application.yaml                      # 应用配置
│   │   └── application-dev.yaml                  # 开发配置
│   └── pom.xml                                   # Maven配置
│
├── user-service/                    # 用户服务示例
│   ├── src/main/java/...
│   └── pom.xml
│
├── order-service/                   # 订单服务示例
│   ├── src/main/java/...
│   └── pom.xml
│
├── product-service/                 # 产品服务示例
│   ├── src/main/java/...
│   └── pom.xml
│
├── docker-compose.yml               # Docker编排
└── README.md                         # 项目说明
```

## 💻 完整代码实现

### 1. POM配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>spring-cloud-gateway-example</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>Spring Cloud Gateway Example</name>
    <description>生产级API网关示例项目</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2022.0.4</spring-cloud.version>
        <spring-cloud-alibaba.version>2022.0.0.0</spring-cloud-alibaba.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Cloud -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Alibaba -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <modules>
        <module>gateway-service</module>
        <module>user-service</module>
        <module>order-service</module>
        <module>product-service</module>
    </modules>
</project>
```

### 2. 网关服务 - 启动类

```java
package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

/**
 * API网关启动类 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {
    "com.example.gateway.config",
    "com.example.gateway.filter",
    "com.example.gateway.resolver",
    "com.example.gateway.controller",
    "com.example.gateway.service"
})
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

### 3. 网关配置 - YAML

```yaml
# application.yaml
server:
  port: 9000
  servlet:
    context-path: /
  compression:
    enabled: true
    min-response-size: 1024

spring:
  application:
    name: api-gateway

  cloud:
    # Nacos服务注册与发现
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        username: nacos
        password: nacos

      # Nacos配置中心
      config:
        server-addr: localhost:8848
        namespace: public
        group: DEFAULT_GROUP
        file-extension: yaml
        username: nacos
        password: nacos

    # Gateway配置 ⭐⭐⭐⭐⭐
    gateway:
      # 服务发现配置
      discovery:
        locator:
          enabled: true                    # 启用服务发现
          lower-case-service-id: true      # 小写服务ID
          predicates:
            - name: Path
              args:
                pattern: "/${spring.application.name}/**"

      # 路由配置 ⭐⭐⭐⭐⭐
      routes:
        # 用户服务路由
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
            - Method=GET,POST,PUT,DELETE,PATCH
          filters:
            - StripPrefix=2              # 去除/api/users前缀
            - AddRequestHeader=X-User-Service,true
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenish-rate: 10
                redis-rate-limiter.requested-tokens: 1
                key-resolver: "#{@userKeyResolver}"

        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Method=GET,POST,PUT,DELETE
          filters:
            - StripPrefix=2
            - AddRequestHeader=X-Order-Service,true
            - RewritePath=/api/orders/(?<segment>.*), /orders/$\{segment}

        # 产品服务路由
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - StripPrefix=2
            - AddRequestHeader=X-Product-Service,true

      # 全局过滤器 ⭐⭐⭐⭐⭐
      default-filters:
        - AddRequestHeader=X-Gateway-Request-ID, ${UUID}
        - AddRequestHeader=X-Request-Time, ${System.currentTimeMillis()}
        - PreserveHostHeader

      # 全局CORS配置 ⭐⭐⭐⭐⭐
      globalcors:
        cors-configurations:
          "[/**]":
            allowedOrigins:
              - http://localhost:3000
              - http://localhost:8080
              - https://example.com
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
              - PATCH
            allowedHeaders:
              - "*"
            exposedHeaders:
              - X-Request-ID
              - X-Response-Time
              - Authorization
            maxAge: 3600
            allowCredentials: false

      # HTTP客户端配置
      httpclient:
        connect-timeout: 5000        # 连接超时
        response-timeout: 30000      # 响应超时
        ssl:
          use-insecure-trust-manager: false

  # Redis配置（用于限流）
  redis:
    host: localhost
    port: 6379
    password:
    timeout: 2000ms
    jedis:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0

  # Jackson配置
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false

# 日志配置
logging:
  level:
    root: INFO
    org.springframework.cloud.gateway: INFO
    org.springframework.http.server.reactive: INFO
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# 监控配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,gateway
  endpoint:
    health:
      show-details: always
    gateway:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true

# 自定义配置
gateway:
  auth:
    enabled: true                           # 启用认证
    exclude-urls:                          # 排除认证的URL
      - /login
      - /register
      - /api/public
      - /health
      - /actuator
      - /swagger-ui.html
      - /v3/api-docs
    jwt:
      secret: my-secret-key-please-change-in-production
      expiration: 86400000                # 24小时
```

### 4. 认证过滤器

```java
package com.example.gateway.filter;

import com.example.gateway.entity.AuthToken;
import com.example.gateway.exception.AuthException;
import com.example.gateway.service.TokenService;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * 全局认证过滤器 ⭐⭐⭐⭐⭐
 *
 * 功能：
 * 1. 检查请求是否需要认证
 * 2. 从请求中提取令牌
 * 3. 验证令牌有效性
 * 4. 将用户信息添加到请求上下文
 */
@Component
@Slf4j
@org.springframework.core.annotation.Order(-1)
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Autowired
    private TokenService tokenService;

    @Value("${gateway.auth.enabled:true}")
    private boolean authEnabled;

    @Value("${gateway.auth.exclude-urls:}")
    private String[] excludeUrls;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        log.debug("认证过滤器处理请求: {}", path);

        // 检查是否需要认证
        if (!authEnabled || isExcludePath(path)) {
            log.debug("请求[{}]无需认证", path);
            return chain.filter(exchange);
        }

        try {
            // 获取令牌
            String token = extractToken(request);

            if (token == null || token.isEmpty()) {
                log.warn("请求缺失认证令牌: {}", path);
                return sendUnauthorized(exchange, "缺失认证令牌");
            }

            // 验证令牌
            Claims claims = tokenService.validateToken(token);

            // 将用户信息添加到请求头
            String userId = claims.getSubject();
            String username = claims.get("username", String.class);
            String roles = claims.get("roles", String.class);

            ServerHttpRequest newRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-User-Name", username)
                .header("X-User-Roles", roles)
                .header("X-Auth-Token", token)
                .build();

            ServerWebExchange newExchange = exchange.mutate()
                .request(newRequest)
                .build();

            log.debug("用户[{}]认证通过, 访问路径: {}", username, path);
            return chain.filter(newExchange);

        } catch (AuthException e) {
            log.warn("认证异常: {}, 路径: {}", e.getMessage(), path);
            return sendUnauthorized(exchange, e.getMessage());
        } catch (Exception e) {
            log.error("认证过程出错", e);
            return sendUnauthorized(exchange, "认证失败");
        }
    }

    /**
     * 从请求中提取令牌 ⭐⭐⭐⭐⭐
     */
    private String extractToken(ServerHttpRequest request) {
        // 1. 从Authorization头提取
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (!CollectionUtils.isEmpty(authHeaders)) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // 2. 从Cookie提取
        var tokenCookie = request.getCookies().getFirst("token");
        if (tokenCookie != null) {
            return tokenCookie.getValue();
        }

        // 3. 从查询参数提取
        String token = request.getQueryParams().getFirst("token");
        if (token != null) {
            return token;
        }

        return null;
    }

    /**
     * 检查路径是否在排除列表中
     */
    private boolean isExcludePath(String path) {
        if (excludeUrls == null || excludeUrls.length == 0) {
            return false;
        }

        return Arrays.stream(excludeUrls)
            .anyMatch(excludePath -> path.startsWith(excludePath.trim()) ||
                                   path.matches(excludePath.trim()));
    }

    /**
     * 返回未授权响应 ⭐⭐⭐⭐⭐
     */
    private Mono<Void> sendUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);

        String responseBody = String.format(
            "{\"code\": 401, \"message\": \"%s\"}", message
        );

        byte[] responseBytes = responseBody.getBytes(StandardCharsets.UTF_8);
        var dataBuffer = response.bufferFactory().wrap(responseBytes);

        return response.writeWith(Mono.just(dataBuffer));
    }

    @Override
    public int getOrder() {
        return -1;  // 最高优先级
    }
}
```

### 5. 日志过滤器

```java
package com.example.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 日志记录过滤器 ⭐⭐⭐⭐⭐
 */
@Component
@Slf4j
@org.springframework.core.annotation.Order(0)
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String method = request.getMethodValue();
        String path = request.getPath().value();
        String clientIp = getClientIp(request);

        long startTime = System.currentTimeMillis();

        log.info("==> 请求开始 | 方法: {}, 路径: {}, 客户端IP: {}",
            method, path, clientIp);

        return chain.filter(exchange)
            .doFinally(signal -> {
                long duration = System.currentTimeMillis() - startTime;
                int statusCode = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value()
                    : 0;

                log.info("<== 请求完成 | 方法: {}, 路径: {}, 状态: {}, 耗时: {}ms",
                    method, path, statusCode, duration);
            });
    }

    /**
     * 获取客户端IP地址 ⭐⭐⭐⭐
     */
    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        if (request.getRemoteAddress() != null) {
            return request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

### 6. 令牌服务

```java
package com.example.gateway.service;

import com.example.gateway.exception.AuthException;
import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 令牌服务 ⭐⭐⭐⭐⭐
 *
 * 负责JWT令牌的生成、验证和解析
 */
@Service
@Slf4j
public class TokenService {

    @Value("${gateway.auth.jwt.secret:my-secret-key}")
    private String jwtSecret;

    @Value("${gateway.auth.jwt.expiration:86400000}")
    private long tokenExpiration;

    /**
     * 生成令牌 ⭐⭐⭐⭐⭐
     */
    public String generateToken(String userId, String username, String roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);
        claims.put("roles", roles);

        return createToken(claims, userId);
    }

    /**
     * 创建令牌
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + tokenExpiration);

        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        var key = new SecretKeySpec(secretBytes, 0, secretBytes.length,
            SignatureAlgorithm.HS256.getJcaName());

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(now)
            .setExpiration(expiration)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * 验证令牌 ⭐⭐⭐⭐⭐
     */
    public Claims validateToken(String token) throws AuthException {
        try {
            byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            var key = new SecretKeySpec(secretBytes, 0, secretBytes.length,
                SignatureAlgorithm.HS256.getJcaName());

            return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        } catch (ExpiredJwtException e) {
            log.warn("令牌已过期");
            throw new AuthException("令牌已过期");
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("令牌格式错误");
            throw new AuthException("令牌格式错误");
        } catch (UnsupportedJwtException e) {
            log.warn("不支持的令牌类型");
            throw new AuthException("不支持的令牌类型");
        } catch (IllegalArgumentException e) {
            log.warn("令牌声明为空");
            throw new AuthException("令牌声明为空");
        } catch (JwtException e) {
            log.warn("令牌验证失败: {}", e.getMessage());
            throw new AuthException("令牌验证失败");
        }
    }

    /**
     * 刷新令牌
     */
    public String refreshToken(String token) throws AuthException {
        Claims claims = validateToken(token);
        String userId = claims.getSubject();
        String username = claims.get("username", String.class);
        String roles = claims.get("roles", String.class);

        return generateToken(userId, username, roles);
    }
}
```

### 7. 限流键解析器

```java
package com.example.gateway.resolver;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 限流键解析器 ⭐⭐⭐⭐⭐
 *
 * 基于用户ID进行限流，如果没有用户ID则基于IP
 */
@Component("userKeyResolver")
@Slf4j
public class UserKeyResolver implements KeyResolver {

    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest();

        // 优先从请求头获取用户ID（认证后添加）
        String userId = request.getHeaders().getFirst("X-User-Id");

        if (userId != null && !userId.isEmpty()) {
            log.debug("使用用户ID进行限流: {}", userId);
            return Mono.just("user:" + userId);
        }

        // 使用IP地址进行限流
        String clientIp = getClientIp(request);
        log.debug("使用IP地址进行限流: {}", clientIp);
        return Mono.just("ip:" + clientIp);
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        if (request.getRemoteAddress() != null) {
            return request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }
}
```

### 8. 异常处理

```java
package com.example.gateway.exception;

/**
 * 认证异常 ⭐⭐⭐⭐
 */
public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }

    public AuthException(String message, Throwable cause) {
        super(message, cause);
    }
}

/**
 * 网关异常 ⭐⭐⭐⭐
 */
@Slf4j
@Component
@org.springframework.core.annotation.Order(Integer.MIN_VALUE)
public class GlobalExceptionFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
            .onErrorResume(ex -> handleException(exchange, ex));
    }

    private Mono<Void> handleException(ServerWebExchange exchange, Throwable ex) {
        log.error("网关异常: ", ex);

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);

        String message = "网关处理异常";
        if (ex instanceof AuthException) {
            message = ex.getMessage();
        }

        String responseBody = String.format(
            "{\"code\": 500, \"message\": \"%s\"}", message
        );

        byte[] responseBytes = responseBody.getBytes(StandardCharsets.UTF_8);
        var dataBuffer = response.bufferFactory().wrap(responseBytes);

        return response.writeWith(Mono.just(dataBuffer));
    }
}
```

## 🚀 快速启动

### 1. 启动依赖服务

```bash
# 启动Nacos（Docker）
docker run -d --name nacos -p 8848:8848 -p 9848:9848 \
  -e MODE=standalone \
  -e PREFER_HOST_MODE=hostname \
  nacos/nacos-server:v2.2.0

# 启动Redis（Docker）
docker run -d --name redis -p 6379:6379 redis:7.0

# 验证服务
curl http://localhost:8848/nacos  # Nacos控制台
redis-cli ping                     # Redis连接
```

### 2. 启动网关和后端服务

```bash
# 启动网关
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=9000" \
  -f gateway-service/pom.xml

# 启动用户服务（新终端）
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8001" \
  -f user-service/pom.xml

# 启动订单服务（新终端）
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8002" \
  -f order-service/pom.xml
```

### 3. 测试网关

```bash
# 获取令牌
TOKEN=$(curl -X POST http://localhost:9000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

# 访问用户服务（通过网关）
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/api/users/1

# 限流测试（快速发送10+个请求）
for i in {1..15}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:9000/api/users/1
  echo ""
done
```

## 📊 监控和日志

### 查看网关日志

```bash
# 查看实时日志
tail -f logs/gateway.log

# 查看认证日志
grep "认证" logs/gateway.log

# 查看限流日志
grep "限流" logs/gateway.log
```

### Prometheus监控

```bash
# 访问Prometheus指标
curl http://localhost:9000/actuator/prometheus

# 网关指标示例
gateway_requests_total{path="/api/users/**",status="200"}
gateway_request_duration_seconds{path="/api/users/**"}
```

## ✅ 生产部署建议

### 1. Docker部署

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/gateway-service-1.0.0.jar app.jar

EXPOSE 9000

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  nacos:
    image: nacos/nacos-server:v2.2.0
    ports:
      - "8848:8848"
    environment:
      MODE: standalone

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"

  gateway:
    build: ./gateway-service
    ports:
      - "9000:9000"
    depends_on:
      - nacos
      - redis
    environment:
      SPRING_CLOUD_NACOS_DISCOVERY_SERVER_ADDR: nacos:8848

  user-service:
    build: ./user-service
    ports:
      - "8001:8001"
    depends_on:
      - nacos
```

### 3. Nginx代理配置

```nginx
upstream gateway {
    server gateway1:9000;
    server gateway2:9000;
    server gateway3:9000;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## 🎯 总结

这个示例项目演示了：

✅ **完整的网关架构**
- 服务注册与发现
- 动态路由配置
- 负载均衡

✅ **认证和授权**
- JWT令牌管理
- 令牌验证
- 用户信息传递

✅ **流量控制**
- 基于用户的限流
- 基于IP的限流
- 令牌桶算法

✅ **日志和监控**
- 请求日志记录
- 性能指标采集
- Prometheus集成

✅ **生产部署**
- Docker容器化
- Kubernetes部署就绪
- Nginx负载均衡

---

**建议**：使用此项目作为学习和参考，根据实际业务需求进行定制和扩展！
