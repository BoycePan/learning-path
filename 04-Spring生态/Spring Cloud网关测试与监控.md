# Spring Cloud网关测试与监控指南

## 📌 目标

- 构建完整的网关测试体系
- 实现全面的监控和告警
- 提升系统稳定性和可观测性

## 🧪 测试体系

### 1. 单元测试 ⭐⭐⭐⭐⭐

```java
/**
 * 过滤器单元测试
 */
@SpringBootTest
class AuthGlobalFilterTest {

    @Autowired
    private AuthGlobalFilter authGlobalFilter;

    @Autowired
    private TokenService tokenService;

    private ServerWebExchange exchange;

    @BeforeEach
    void setUp() {
        // 初始化测试环境
        exchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/users/1")
                .header("Authorization", "Bearer " + generateValidToken())
                .build()
        );
    }

    /**
     * 测试有效令牌通过 ⭐⭐⭐⭐
     */
    @Test
    void testValidTokenPass() {
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        authGlobalFilter.filter(exchange, chain)
            .block();

        verify(chain, times(1)).filter(exchange);
    }

    /**
     * 测试无效令牌被拒绝 ⭐⭐⭐⭐
     */
    @Test
    void testInvalidTokenRejected() {
        ServerWebExchange invalidExchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/users/1")
                .header("Authorization", "Bearer invalid-token")
                .build()
        );

        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        authGlobalFilter.filter(invalidExchange, chain)
            .block();

        assertEquals(HttpStatus.UNAUTHORIZED,
            invalidExchange.getResponse().getStatusCode());
    }

    /**
     * 测试缺失令牌被拒绝 ⭐⭐⭐⭐
     */
    @Test
    void testMissingTokenRejected() {
        ServerWebExchange noTokenExchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/users/1").build()
        );

        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        authGlobalFilter.filter(noTokenExchange, chain)
            .block();

        assertEquals(HttpStatus.UNAUTHORIZED,
            noTokenExchange.getResponse().getStatusCode());
    }

    /**
     * 测试排除路径不需要令牌 ⭐⭐⭐⭐
     */
    @Test
    void testExcludedPathNoTokenRequired() {
        ServerWebExchange publicExchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/login").build()
        );

        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(publicExchange)).thenReturn(Mono.empty());

        authGlobalFilter.filter(publicExchange, chain)
            .block();

        verify(chain, times(1)).filter(publicExchange);
    }

    private String generateValidToken() {
        return tokenService.generateToken("user1", "testuser", "ROLE_USER");
    }
}

/**
 * 限流过滤器单元测试
 */
@SpringBootTest
class RateLimitFilterTest {

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private RateLimiter rateLimiter;

    /**
     * 测试正常请求通过限流 ⭐⭐⭐⭐
     */
    @Test
    void testNormalRequestPass() {
        for (int i = 0; i < 50; i++) {
            ServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/users/1").build()
            );

            GatewayFilterChain chain = mock(GatewayFilterChain.class);
            when(chain.filter(exchange)).thenReturn(Mono.empty());

            rateLimitFilter.filter(exchange, chain)
                .block();

            verify(chain, times(1)).filter(exchange);
        }
    }

    /**
     * 测试超过限流被拒绝 ⭐⭐⭐⭐
     */
    @Test
    void testExceedLimitRejected() {
        // 消耗所有限流配额
        for (int i = 0; i < 100; i++) {
            rateLimiter.isAllowed("test-key", 100, 60);
        }

        ServerWebExchange exchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/users/1")
                .header("X-Forwarded-For", "192.168.1.1")
                .build()
        );

        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        rateLimitFilter.filter(exchange, chain)
            .block();

        assertEquals(HttpStatus.TOO_MANY_REQUESTS,
            exchange.getResponse().getStatusCode());
    }
}
```

### 2. 集成测试 ⭐⭐⭐⭐⭐

```java
/**
 * 网关集成测试
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private UserFeignClient userFeignClient;

    /**
     * 测试完整请求流程 ⭐⭐⭐⭐⭐
     */
    @Test
    void testCompleteRequestFlow() {
        // 1. 生成令牌
        String token = generateToken();

        // 2. 发送请求
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        User expectedUser = new User(1L, "张三", "zhang@example.com");
        when(userFeignClient.getUserById(1L)).thenReturn(expectedUser);

        ResponseEntity<User> response = restTemplate.exchange(
            "/api/users/1",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            User.class
        );

        // 3. 验证响应
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("张三", response.getBody().getName());
    }

    /**
     * 测试网关路由功能 ⭐⭐⭐⭐
     */
    @Test
    void testGatewayRouting() {
        String token = generateToken();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        // 测试路由到用户服务
        ResponseEntity<String> userResponse = restTemplate.exchange(
            "/api/users/1",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
        );
        assertEquals(HttpStatus.OK, userResponse.getStatusCode());

        // 测试路由到订单服务
        ResponseEntity<String> orderResponse = restTemplate.exchange(
            "/api/orders/1",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
        );
        assertEquals(HttpStatus.OK, orderResponse.getStatusCode());
    }

    /**
     * 测试CORS跨域 ⭐⭐⭐⭐
     */
    @Test
    void testCorsHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Origin", "http://localhost:3000");

        ResponseEntity<Void> response = restTemplate.exchange(
            "/api/users/1",
            HttpMethod.OPTIONS,
            new HttpEntity<>(headers),
            Void.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getHeaders()
            .containsKey("Access-Control-Allow-Origin"));
    }

    private String generateToken() {
        // 生成有效的JWT令牌
        return Jwts.builder()
            .setSubject("user1")
            .claim("username", "testuser")
            .claim("roles", "ROLE_USER")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(SignatureAlgorithm.HS256, "my-secret-key")
            .compact();
    }
}
```

### 3. 性能测试 ⭐⭐⭐⭐⭐

```java
/**
 * 性能基准测试
 */
@BenchmarkMode(Mode.Throughput)
@Fork(1)
@Warmup(iterations = 3)
@Measurement(iterations = 5)
public class GatewayPerformanceBenchmark {

    private ServerWebExchange exchange;
    private GatewayFilterChain chain;
    private AuthGlobalFilter authGlobalFilter;

    @Setup
    public void setUp() {
        // 初始化测试环境
        exchange = MockServerWebExchange.from(
            MockServerHttpRequest.get("/api/users/1")
                .header("Authorization", "Bearer valid-token")
                .build()
        );
        chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());
        authGlobalFilter = new AuthGlobalFilter();
    }

    /**
     * 测试认证过滤器的吞吐量 ⭐⭐⭐⭐
     */
    @Benchmark
    public void testAuthFilterThroughput() {
        authGlobalFilter.filter(exchange, chain).block();
    }

    /**
     * 测试令牌验证性能 ⭐⭐⭐⭐
     */
    @Benchmark
    public void testTokenValidation() {
        String token = generateToken();
        tokenService.validateToken(token);
    }

    private String generateToken() {
        return Jwts.builder()
            .setSubject("user1")
            .signWith(SignatureAlgorithm.HS256, "secret")
            .compact();
    }
}

/**
 * 运行基准测试
 * mvn clean install
 * java -jar target/benchmarks.jar
 */
```

### 4. 压力测试

```bash
#!/bin/bash
# load-test.sh - 压力测试脚本

echo "=== 网关压力测试开始 ==="

# 1. 获取令牌
TOKEN=$(curl -s -X POST http://localhost:9000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

echo "令牌: $TOKEN"

# 2. 使用Apache Bench进行压力测试
echo ""
echo "=== 开始压力测试 (100并发, 10000请求) ==="
ab -n 10000 \
   -c 100 \
   -H "Authorization: Bearer $TOKEN" \
   -v 2 \
   http://localhost:9000/api/users/1 | tee load-test-result.txt

# 3. 使用wrk进行更复杂的压力测试
echo ""
echo "=== 开始复杂压力测试 (4线程, 128连接, 30秒) ==="
wrk -t 4 \
    -c 128 \
    -d 30s \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:9000/api/users/1

# 4. 使用hey进行最大负载测试
echo ""
echo "=== 最大负载测试 ==="
hey -n 50000 \
    -c 500 \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:9000/api/users/1

echo ""
echo "=== 压力测试完成 ==="
```

## 📊 监控体系

### 1. Prometheus指标收集 ⭐⭐⭐⭐⭐

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # 网关应用
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['localhost:9000']
    metrics_path: '/actuator/prometheus'

  # 后端服务
  - job_name: 'user-service'
    static_configs:
      - targets: ['localhost:8001']

  - job_name: 'order-service'
    static_configs:
      - targets: ['localhost:8002']

  # Redis监控
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
```

### 2. Grafana仪表板配置 ⭐⭐⭐⭐

```json
{
  "dashboard": {
    "title": "API网关监控",
    "panels": [
      {
        "title": "请求速率 (QPS)",
        "targets": [
          {
            "expr": "rate(gateway_requests_total[1m])"
          }
        ]
      },
      {
        "title": "平均响应时间",
        "targets": [
          {
            "expr": "rate(gateway_request_duration_seconds_sum[1m]) / rate(gateway_request_duration_seconds_count[1m])"
          }
        ]
      },
      {
        "title": "P99延迟",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, gateway_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "错误率",
        "targets": [
          {
            "expr": "rate(gateway_requests_total{status=~\"5..\"}[1m]) / rate(gateway_requests_total[1m])"
          }
        ]
      },
      {
        "title": "限流触发次数",
        "targets": [
          {
            "expr": "increase(gateway_rate_limit_exceeded_total[5m])"
          }
        ]
      },
      {
        "title": "缓存命中率",
        "targets": [
          {
            "expr": "rate(gateway_cache_hits_total[1m]) / (rate(gateway_cache_hits_total[1m]) + rate(gateway_cache_misses_total[1m]))"
          }
        ]
      }
    ]
  }
}
```

### 3. 告警规则 ⭐⭐⭐⭐⭐

```yaml
# alert-rules.yml
groups:
  - name: api-gateway
    interval: 1m
    rules:
      # 告警：高错误率
      - alert: HighErrorRate
        expr: |
          (sum(rate(gateway_requests_total{status=~"5.."}[5m])) by (job)) /
          (sum(rate(gateway_requests_total[5m])) by (job)) > 0.05
        for: 5m
        annotations:
          summary: "网关错误率高"
          description: "过去5分钟内错误率超过5%"

      # 告警：高延迟
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99, rate(gateway_request_duration_seconds[5m])) > 1
        for: 5m
        annotations:
          summary: "网关延迟高"
          description: "P99延迟超过1秒"

      # 告警：限流过于频繁
      - alert: FrequentRateLimiting
        expr: |
          increase(gateway_rate_limit_exceeded_total[5m]) > 100
        for: 5m
        annotations:
          summary: "限流频繁触发"
          description: "过去5分钟内限流超过100次"

      # 告警：缓存命中率低
      - alert: LowCacheHitRate
        expr: |
          rate(gateway_cache_hits_total[5m]) /
          (rate(gateway_cache_hits_total[5m]) + rate(gateway_cache_misses_total[5m])) < 0.5
        for: 10m
        annotations:
          summary: "缓存命中率低"
          description: "过去10分钟内缓存命中率低于50%"

      # 告警：内存占用过高
      - alert: HighMemoryUsage
        expr: |
          jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.8
        for: 5m
        annotations:
          summary: "网关内存占用过高"
          description: "堆内存占用超过80%"

      # 告警：GC停顿时间过长
      - alert: LongGCPauseTime
        expr: |
          increase(jvm_gc_pause_seconds_sum[5m]) > 2
        for: 5m
        annotations:
          summary: "GC停顿时间过长"
          description: "5分钟内累计GC停顿超过2秒"
```

### 4. 日志聚合 (ELK) ⭐⭐⭐⭐

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /logs/gateway/*.log
    fields:
      app: api-gateway
    fields_under_root: true

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "gateway-%{+yyyy.MM.dd}"

processors:
  - add_kubernetes_metadata:
  - add_docker_metadata:

logging.level: info
```

## 🔍 可观测性最佳实践

### 1. 结构化日志 ⭐⭐⭐⭐⭐

```java
/**
 * 结构化日志配置
 */
@Component
public class StructuredLoggingFilter implements GlobalFilter {

    private static final Logger logger = LoggerFactory.getLogger(StructuredLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 创建日志上下文
        MDC.put("requestId", UUID.randomUUID().toString());
        MDC.put("method", request.getMethodValue());
        MDC.put("path", request.getPath().value());
        MDC.put("timestamp", LocalDateTime.now().toString());

        return chain.filter(exchange)
            .doFinally(signal -> MDC.clear());
    }
}

/**
 * logback.xml - JSON日志格式
 */
/*
<configuration>
    <appender name="json" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <fieldNames>
                <timestamp>@timestamp</timestamp>
                <level>level</level>
                <logger>logger</logger>
                <message>message</message>
                <mdc>mdc</mdc>
            </fieldNames>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/gateway-%d{yyyy-MM-dd}.%i.json.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="json"/>
    </root>
</configuration>
*/
```

### 2. 链路追踪 (Sleuth + Zipkin) ⭐⭐⭐⭐

```yaml
# 网关配置 + 链路追踪
spring:
  cloud:
    sleuth:
      sampler:
        probability: 1.0  # 采样率100%
    zipkin:
      base-url: http://localhost:9411

logging:
  pattern:
    level: "%5p [${spring.application.name},%X{traceId},%X{spanId}]"
```

## 📋 监控检查清单

### 基础监控
- [ ] 部署Prometheus
- [ ] 配置网关指标导出
- [ ] 部署Grafana仪表板
- [ ] 设置告警规则

### 日志监控
- [ ] 部署ELK Stack
- [ ] 配置日志收集
- [ ] 创建日志查询和分析
- [ ] 设置日志告警

### 链路追踪
- [ ] 部署Zipkin
- [ ] 集成Sleuth
- [ ] 配置采样规则
- [ ] 分析关键请求路径

### 性能监控
- [ ] 监控JVM指标
- [ ] 追踪数据库性能
- [ ] 监控缓存命中率
- [ ] 记录慢查询

## 🎯 SLA目标

| 指标 | 目标 | 监控方式 |
|------|------|----------|
| **可用性** | 99.99% | 健康检查、告警 |
| **QPS** | 10000+ | Prometheus + Grafana |
| **P99延迟** | <50ms | 分位数指标 |
| **错误率** | <0.1% | 错误计数器 |
| **缓存命中率** | >80% | 缓存指标 |

---

**建议**：建立完整的监控告警体系是生产环境的必要条件！
