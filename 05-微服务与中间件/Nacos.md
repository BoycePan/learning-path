# Nacos服务注册与配置中心

## 📌 学习目标

- 理解Nacos核心概念与架构
- 掌握Nacos Server部署（单机/集群）
- 掌握服务注册与发现机制
- 掌握配置中心的使用
- 了解命名空间与分组管理
- 掌握与Spring Cloud集成
- 了解高可用部署方案

## ⭐ Nacos核心概念

- **服务注册与发现** ⭐⭐⭐⭐⭐
- **配置中心** ⭐⭐⭐⭐⭐
- **命名空间与分组** ⭐⭐⭐⭐⭐
- **健康检查** ⭐⭐⭐⭐
- **临时实例vs持久实例** ⭐⭐⭐⭐
- **集群部署** ⭐⭐⭐⭐⭐

## 1. Nacos简介 ⭐⭐⭐⭐⭐

### 什么是Nacos

```
Nacos = Naming + Configuration Service

Nacos是阿里开源的动态服务发现、配置管理和服务管理平台

核心功能：
├── 服务注册与发现（Naming Service）
├── 配置管理（Configuration Management）
├── 动态DNS服务
└── 服务及元数据管理

优势：
- 统一注册中心和配置中心
- 支持CP和AP模式切换
- 功能强大的Web控制台
- 支持多语言（Java、Go、Python等）
- 云原生架构
```

### Nacos架构

```
┌────────────────────────────────────────────────────────┐
│                  Nacos Console                         │
│                   (管理控制台)                          │
└────────────────────┬───────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────┐
│                 Nacos Server                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Naming     │  │ Config       │  │   Metadata   │ │
│  │  Service    │  │ Service      │  │   Management │ │
│  └─────────────┘  └──────────────┘  └──────────────┘ │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Data Storage (MySQL/Derby)              │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
│ Service A │  │Service B│  │ Service C │
│ (Provider)│  │(Consumer)│ │ (Provider)│
└───────────┘  └─────────┘  └───────────┘
```

### Nacos vs Eureka vs Consul

```
特性对比：

┌──────────────┬───────────┬───────────┬────────────┐
│   特性       │  Nacos    │  Eureka   │  Consul    │
├──────────────┼───────────┼───────────┼────────────┤
│ 配置中心     │    ✓      │    ✗      │     ✓      │
│ 一致性协议   │ Raft+AP   │    AP     │   Raft     │
│ 健康检查     │  TCP/HTTP │  Client   │  TCP/HTTP  │
│ 负载均衡     │  权重/DNS │  Ribbon   │   Fabio    │
│ 多数据中心   │    ✓      │    ✓      │     ✓      │
│ 跨注册中心   │    ✓      │    ✗      │     ✓      │
│ SpringCloud  │    ✓      │    ✓      │     ✓      │
│ K8s集成      │    ✓      │    ✗      │     ✓      │
└──────────────┴───────────┴───────────┴────────────┘

Nacos优势：⭐⭐⭐⭐⭐
- 集成了注册中心和配置中心
- 阿里经过双11验证的生产级产品
- 功能强大的控制台
- 社区活跃，持续更新
```

## 2. Nacos Server部署 ⭐⭐⭐⭐⭐

### 单机模式部署

```bash
# 1. 下载Nacos Server
wget https://github.com/alibaba/nacos/releases/download/2.3.0/nacos-server-2.3.0.tar.gz

# 2. 解压
tar -xzvf nacos-server-2.3.0.tar.gz
cd nacos

# 3. 启动（单机模式）
# Linux/Mac
sh bin/startup.sh -m standalone

# Windows
cmd bin\startup.cmd -m standalone

# 4. 访问控制台
# http://localhost:8848/nacos
# 默认用户名/密码：nacos/nacos

# 5. 关闭服务
sh bin/shutdown.sh  # Linux/Mac
cmd bin\shutdown.cmd  # Windows
```

### 使用MySQL持久化

```sql
-- 1. 创建数据库
CREATE DATABASE nacos_config CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 导入初始化脚本
-- 执行 nacos/conf/mysql-schema.sql
USE nacos_config;
SOURCE /path/to/nacos/conf/mysql-schema.sql;

-- 核心表结构：
-- config_info: 配置信息
-- config_info_tag: 配置标签关系
-- config_tags_relation: 配置标签
-- group_capacity: 集团容量配置
-- his_config_info: 配置修改历史
-- tenant_capacity: 租户容量配置
-- tenant_info: 租户信息
```

```properties
# 3. 配置application.properties
# nacos/conf/application.properties

# Spring数据源配置
spring.datasource.platform=mysql

# 数据库数量（支持多个，逗号分隔）
db.num=1

# 数据库连接信息
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=root

# 连接池配置
db.pool.config.connectionTimeout=30000
db.pool.config.validationTimeout=10000
db.pool.config.maximumPoolSize=20
db.pool.config.minimumIdle=2
```

### 集群模式部署

```bash
# 1. 配置集群节点
# nacos/conf/cluster.conf
# 添加集群节点IP和端口（每行一个）
192.168.1.100:8848
192.168.1.101:8848
192.168.1.102:8848

# 2. 配置MySQL（必须使用MySQL，集群模式不支持内置Derby）
# 修改application.properties（参考上面的MySQL配置）

# 3. 启动每个节点
sh bin/startup.sh  # 默认cluster模式

# 4. 验证集群状态
curl http://localhost:8848/nacos/v1/core/cluster/nodes
```

### Docker部署

```yaml
# docker-compose.yml
version: '3'
services:
  nacos:
    image: nacos/nacos-server:v2.3.0
    container_name: nacos-standalone
    environment:
      - MODE=standalone  # 单机模式
      - SPRING_DATASOURCE_PLATFORM=mysql
      - MYSQL_SERVICE_HOST=mysql
      - MYSQL_SERVICE_DB_NAME=nacos_config
      - MYSQL_SERVICE_PORT=3306
      - MYSQL_SERVICE_USER=root
      - MYSQL_SERVICE_PASSWORD=root
      - JVM_XMS=512m
      - JVM_XMX=512m
      - JVM_XMN=256m
    ports:
      - "8848:8848"
      - "9848:9848"
      - "9849:9849"
    volumes:
      - ./logs:/home/nacos/logs
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=nacos_config
    ports:
      - "3306:3306"
    volumes:
      - ./mysql-data:/var/lib/mysql
      - ./mysql-schema.sql:/docker-entrypoint-initdb.d/mysql-schema.sql
```

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f nacos

# 停止
docker-compose down
```

## 3. 服务注册与发现 ⭐⭐⭐⭐⭐

### Maven依赖

```xml
<!-- Spring Cloud Alibaba 版本管理 -->
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

<!-- 负载均衡（Spring Cloud LoadBalancer）-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### 服务提供者

```yaml
# application.yml - 服务提供者配置
server:
  port: 8081

spring:
  application:
    name: user-service  # 服务名称（重要：消费者通过此名称调用）
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # Nacos Server地址
        namespace: public  # 命名空间ID（默认public）
        group: DEFAULT_GROUP  # 分组（默认DEFAULT_GROUP）
        
        # 实例配置
        ephemeral: true  # 是否为临时实例（默认true）
        weight: 1  # 权重（1-100，默认1）
        cluster-name: DEFAULT  # 集群名称
        
        # 元数据（可选）
        metadata:
          version: 1.0
          env: prod
          author: admin
        
        # 健康检查
        heart-beat-interval: 5000  # 心跳间隔（毫秒）
        heart-beat-timeout: 15000  # 心跳超时（毫秒）
        ip-delete-timeout: 30000  # IP删除超时（毫秒）
        
        # 网络配置
        # ip: 192.168.1.100  # 指定注册IP（默认自动获取）
        # port: ${server.port}  # 指定注册端口（默认server.port）
```

```java
/**
 * 服务提供者 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableDiscoveryClient  // 启用服务发现（可选，默认自动开启）
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

/**
 * 提供REST接口
 */
@RestController
@RequestMapping("/users")
@Slf4j
public class UserController {

    @Value("${server.port}")
    private String port;

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        log.info("查询用户，端口：{}", port);
        return User.builder()
            .id(id)
            .name("张三")
            .email("zhang@example.com")
            .port(port)  // 用于测试负载均衡
            .build();
    }

    @PostMapping
    public User create(@RequestBody User user) {
        log.info("创建用户：{}", user);
        return user;
    }

    @GetMapping("/list")
    public List<User> list() {
        return Arrays.asList(
            new User(1L, "张三", "zhang@example.com"),
            new User(2L, "李四", "li@example.com")
        );
    }
}
```

### 服务消费者（RestTemplate方式）

```java
/**
 * 服务消费者 - RestTemplate方式 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

/**
 * RestTemplate配置
 */
@Configuration
public class RestTemplateConfig {

    /**
     * @LoadBalanced注解启用负载均衡 ⭐⭐⭐⭐⭐
     */
    @Bean
    @LoadBalanced  // 启用Ribbon/LoadBalancer负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

/**
 * 使用RestTemplate调用服务
 */
@Service
@Slf4j
public class OrderService {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 调用user-service服务
     * URL格式：http://服务名/接口路径
     */
    public User getUserById(Long userId) {
        String url = "http://user-service/users/" + userId;
        log.info("调用用户服务：{}", url);
        
        User user = restTemplate.getForObject(url, User.class);
        log.info("获取到用户：{}", user);
        return user;
    }

    public User createUser(User user) {
        String url = "http://user-service/users";
        return restTemplate.postForObject(url, user, User.class);
    }
}
```

### 服务消费者（OpenFeign方式，推荐）

```xml
<!-- OpenFeign依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
/**
 * 启用Feign
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients  // 启用Feign客户端
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

/**
 * Feign客户端定义 ⭐⭐⭐⭐⭐
 */
@FeignClient(name = "user-service")  // 指定服务名
public interface UserFeignClient {

    @GetMapping("/users/{id}")
    User getById(@PathVariable("id") Long id);

    @PostMapping("/users")
    User create(@RequestBody User user);

    @GetMapping("/users/list")
    List<User> list();
}

/**
 * 使用Feign调用服务
 */
@Service
@Slf4j
public class OrderService {

    @Autowired
    private UserFeignClient userFeignClient;

    public void createOrder(Long userId) {
        // 直接调用接口，就像本地方法一样
        User user = userFeignClient.getById(userId);
        log.info("获取到用户：{}", user);
        
        // 创建订单业务逻辑...
    }
}
```

### 临时实例vs持久实例

```yaml
# 临时实例（Ephemeral Instance）⭐⭐⭐⭐⭐
# 默认配置，适合大部分场景
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # 临时实例
        
# 特点：
# 1. 客户端主动上报心跳
# 2. 超时未上报心跳，服务端主动删除实例
# 3. AP模式（可用性优先）
# 4. 适合云原生、容器化场景
```

```yaml
# 持久实例（Persistent Instance）⭐⭐⭐⭐
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 持久实例
        
# 特点：
# 1. 服务端主动健康检查
# 2. 实例数据持久化到数据库
# 3. CP模式（一致性优先）
# 4. 适合传统微服务场景
```

```
临时实例 vs 持久实例对比：

┌──────────────┬─────────────┬─────────────┐
│   特性       │  临时实例   │  持久实例   │
├──────────────┼─────────────┼─────────────┤
│ 健康检查     │  客户端心跳 │  服务端探测 │
│ 实例删除     │  自动删除   │  手动删除   │
│ 数据持久化   │  不持久化   │  持久化     │
│ 一致性模型   │  AP模式     │  CP模式     │
│ 适用场景     │  云原生     │  传统应用   │
│ 推荐度       │  ⭐⭐⭐⭐⭐  │  ⭐⭐⭐⭐   │
└──────────────┴─────────────┴─────────────┘
```

### 负载均衡策略

```yaml
# 配置负载均衡策略
spring:
  cloud:
    loadbalancer:
      nacos:
        enabled: true  # 启用Nacos负载均衡
    nacos:
      discovery:
        weight: 1  # 权重（1-100）
```

```java
/**
 * 自定义负载均衡策略 ⭐⭐⭐⭐
 */
@Configuration
public class LoadBalancerConfig {

    /**
     * 基于Nacos权重的负载均衡
     */
    @Bean
    public ReactorLoadBalancer<ServiceInstance> nacosLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new NacosLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name
        );
    }
}

/**
 * Nacos权重负载均衡器
 */
public class NacosLoadBalancer implements ReactorServiceInstanceLoadBalancer {

    private ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private String serviceId;

    public NacosLoadBalancer(
            ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
            String serviceId) {
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
        this.serviceId = serviceId;
    }

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(serviceInstances));
    }

    /**
     * 基于权重选择实例
     */
    private Response<ServiceInstance> processInstanceResponse(
            List<ServiceInstance> instances) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }

        // 获取权重并选择实例
        List<Pair<ServiceInstance, Double>> weightedInstances = instances.stream()
            .map(instance -> {
                NacosServiceInstance nacosInstance = (NacosServiceInstance) instance;
                double weight = nacosInstance.getMetadata()
                    .getOrDefault("nacos.weight", "1.0");
                return Pair.of(instance, Double.parseDouble(weight.toString()));
            })
            .collect(Collectors.toList());

        ServiceInstance instance = chooseInstanceByWeight(weightedInstances);
        return new DefaultResponse(instance);
    }

    /**
     * 权重随机算法
     */
    private ServiceInstance chooseInstanceByWeight(
            List<Pair<ServiceInstance, Double>> weightedInstances) {
        
        double totalWeight = weightedInstances.stream()
            .mapToDouble(Pair::getSecond)
            .sum();

        double random = Math.random() * totalWeight;
        double currentWeight = 0;

        for (Pair<ServiceInstance, Double> pair : weightedInstances) {
            currentWeight += pair.getSecond();
            if (random <= currentWeight) {
                return pair.getFirst();
            }
        }

        return weightedInstances.get(0).getFirst();
    }
}
```

## 4. 配置中心 ⭐⭐⭐⭐⭐

### Maven依赖

```xml
<!-- Nacos配置中心 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>

<!-- Bootstrap支持（用于优先加载配置）-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

### 基础配置

```yaml
# bootstrap.yml（优先于application.yml加载）⭐⭐⭐⭐⭐
spring:
  application:
    name: order-service  # 应用名称
  profiles:
    active: dev  # 环境（dev/test/prod）
  cloud:
    nacos:
      config:
        server-addr: localhost:8848  # Nacos Server地址
        namespace: public  # 命名空间ID
        group: DEFAULT_GROUP  # 分组
        file-extension: yaml  # 配置文件格式（yaml/properties/json）
        
        # 共享配置（多个服务共享）
        shared-configs:
          - data-id: common-mysql.yaml  # 公共MySQL配置
            group: COMMON_GROUP
            refresh: true  # 支持动态刷新
          - data-id: common-redis.yaml  # 公共Redis配置
            group: COMMON_GROUP
            refresh: true
        
        # 扩展配置（当前服务专属）
        extension-configs:
          - data-id: order-service-extra.yaml
            group: DEFAULT_GROUP
            refresh: true
        
        # 配置刷新
        refresh-enabled: true  # 启用自动刷新（默认true）
        
        # 配置中心超时配置
        timeout: 3000  # 连接超时时间（毫秒）
        config-long-poll-timeout: 46000  # 长轮询超时
        config-retry-time: 2000  # 配置重试时间
        max-retry: 10  # 最大重试次数
```

### 在Nacos控制台创建配置

```
配置管理 → 配置列表 → 创建配置

Data ID: order-service-dev.yaml
Group: DEFAULT_GROUP
配置格式: YAML
配置内容：
```

```yaml
# order-service-dev.yaml（在Nacos控制台配置）
server:
  port: 8082

# 业务配置
order:
  timeout: 30000
  max-items: 100
  enable-discount: true

# 数据源配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/order_db?useSSL=false
    username: root
    password: dev123456
    
  redis:
    host: localhost
    port: 6379
    database: 0
    timeout: 3000ms

# 第三方服务配置
payment:
  api-url: https://pay-dev.example.com
  app-key: dev_key_123456
  app-secret: dev_secret_abc

# 日志配置
logging:
  level:
    com.example.order: DEBUG
```

### 配置动态刷新

```java
/**
 * 配置动态刷新 ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/config")
@RefreshScope  // 启用配置刷新（必须添加）
@Slf4j
public class ConfigController {

    /**
     * @Value方式读取配置
     * 支持动态刷新
     */
    @Value("${order.timeout}")
    private Integer timeout;

    @Value("${order.max-items}")
    private Integer maxItems;

    @Value("${order.enable-discount}")
    private Boolean enableDiscount;

    @GetMapping("/info")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("timeout", timeout);
        config.put("maxItems", maxItems);
        config.put("enableDiscount", enableDiscount);
        return config;
    }
}

/**
 * @ConfigurationProperties方式读取配置（推荐）⭐⭐⭐⭐⭐
 * 支持自动刷新（不需要@RefreshScope）
 */
@Component
@ConfigurationProperties(prefix = "order")
@Data
public class OrderProperties {

    private Integer timeout;
    private Integer maxItems;
    private Boolean enableDiscount;
}

/**
 * 使用配置类
 */
@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderProperties orderProperties;

    public void createOrder() {
        log.info("订单超时时间：{}", orderProperties.getTimeout());
        log.info("最大商品数：{}", orderProperties.getMaxItems());
        log.info("是否启用折扣：{}", orderProperties.getEnableDiscount());
    }
}
```

### 配置优先级

```
配置加载顺序（优先级从高到低）：

1. spring.cloud.nacos.config.extension-configs[n]  # 扩展配置
2. spring.cloud.nacos.config.shared-configs[n]     # 共享配置
3. ${spring.application.name}-${profile}.${file-extension}  # 带profile
4. ${spring.application.name}.${file-extension}    # 不带profile
5. application-${profile}.yml（本地）
6. application.yml（本地）

示例：
order-service应用，环境dev，file-extension=yaml

加载顺序：
1. order-service-extra.yaml（扩展配置）
2. common-mysql.yaml（共享配置）
3. common-redis.yaml（共享配置）
4. order-service-dev.yaml（当前环境）
5. order-service.yaml（默认）
6. application-dev.yml（本地）
7. application.yml（本地）
```

### 配置监听

```java
/**
 * 配置监听器 ⭐⭐⭐⭐
 * 监听配置变化，执行自定义逻辑
 */
@Component
@Slf4j
public class NacosConfigListener {

    @Autowired
    private NacosConfigManager nacosConfigManager;

    @PostConstruct
    public void init() throws NacosException {
        String dataId = "order-service-dev.yaml";
        String group = "DEFAULT_GROUP";

        ConfigService configService = nacosConfigManager.getConfigService();

        // 添加监听器
        configService.addListener(dataId, group, new Listener() {
            @Override
            public Executor getExecutor() {
                return null;  // 使用默认线程池
            }

            @Override
            public void receiveConfigInfo(String configInfo) {
                log.info("配置发生变化：");
                log.info("Data ID: {}", dataId);
                log.info("Group: {}", group);
                log.info("新配置内容：\n{}", configInfo);

                // 执行自定义逻辑
                handleConfigChange(configInfo);
            }
        });

        log.info("配置监听器已启动，监听 {}:{}", group, dataId);
    }

    /**
     * 处理配置变化
     */
    private void handleConfigChange(String configInfo) {
        // 例如：重新初始化缓存、更新限流规则等
        log.info("正在处理配置变化...");
        
        // 清理缓存
        // cacheManager.clear();
        
        // 更新限流规则
        // updateRateLimitRules(configInfo);
    }
}
```

### 灰度发布

```java
/**
 * 配置灰度发布 ⭐⭐⭐⭐
 * 使用Beta发布功能
 */

// 1. 在Nacos控制台：
//    配置管理 → 配置列表 → 选择配置 → Beta发布
//    指定Beta IP列表：192.168.1.100,192.168.1.101

// 2. 代码无需改动，Nacos会自动根据IP推送不同配置

// 3. Beta验证通过后，停止Beta发布即可全量发布
```

## 5. 命名空间与分组 ⭐⭐⭐⭐⭐

### 命名空间（Namespace）

```
命名空间用途：
- 环境隔离（dev/test/prod）
- 租户隔离（不同业务线）
- 多数据中心隔离

┌─────────────────────────────────────────┐
│           Nacos Server                  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Namespace: dev (环境：开发)      │ │
│  │  ├─ user-service                  │ │
│  │  ├─ order-service                 │ │
│  │  └─ payment-service               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Namespace: test (环境：测试)     │ │
│  │  ├─ user-service                  │ │
│  │  ├─ order-service                 │ │
│  │  └─ payment-service               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Namespace: prod (环境：生产)     │ │
│  │  ├─ user-service                  │ │
│  │  ├─ order-service                 │ │
│  │  └─ payment-service               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

```yaml
# 使用命名空间
spring:
  cloud:
    nacos:
      discovery:
        namespace: 5e4f5c6e-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # 命名空间ID
      config:
        namespace: 5e4f5c6e-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # 同一个命名空间
```

### 分组（Group）

```
分组用途：
- 业务功能分组
- 服务版本分组
- 配置分类

示例：
DEFAULT_GROUP: 默认分组
COMMON_GROUP: 公共配置（数据库、Redis等）
ORDER_GROUP: 订单服务组
USER_GROUP: 用户服务组
V1_GROUP: 版本1
V2_GROUP: 版本2
```

```yaml
# 使用分组
spring:
  cloud:
    nacos:
      discovery:
        group: ORDER_GROUP  # 服务分组
      config:
        group: ORDER_GROUP  # 配置分组
```

### 多环境配置实践

```yaml
# bootstrap.yml - 开发环境
spring:
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: nacos-dev.example.com:8848
      discovery:
        namespace: dev-namespace-id
        group: DEFAULT_GROUP
      config:
        namespace: dev-namespace-id
        group: DEFAULT_GROUP
```

```yaml
# bootstrap.yml - 生产环境
spring:
  profiles:
    active: prod
  cloud:
    nacos:
      server-addr: nacos-prod.example.com:8848
      discovery:
        namespace: prod-namespace-id
        group: DEFAULT_GROUP
      config:
        namespace: prod-namespace-id
        group: DEFAULT_GROUP
```

## 6. 高可用部署 ⭐⭐⭐⭐⭐

### 集群架构

```
Nacos集群架构（推荐3节点及以上）：

                    ┌──────────────┐
                    │  Nginx/SLB   │
                    │  (负载均衡)   │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  Nacos1   │    │  Nacos2   │    │  Nacos3   │
    │  Leader   │◄──►│  Follower │◄──►│  Follower │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼───────┐
                    │    MySQL     │
                    │  (主从复制)   │
                    └──────────────┘
```

### MySQL主从配置

```sql
-- MySQL主库配置（my.cnf）
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
sync-binlog=1

-- MySQL从库配置（my.cnf）
[mysqld]
server-id=2
relay-log=mysql-relay-bin
read-only=1

-- 配置主从复制
-- 在主库创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'repl123456';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;

-- 在从库配置主库信息
CHANGE MASTER TO
  MASTER_HOST='192.168.1.100',
  MASTER_USER='repl',
  MASTER_PASSWORD='repl123456',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;
SHOW SLAVE STATUS\G
```

### Nginx负载均衡配置

```nginx
# nginx.conf
upstream nacos-cluster {
    server 192.168.1.101:8848 weight=1;
    server 192.168.1.102:8848 weight=1;
    server 192.168.1.103:8848 weight=1;
}

server {
    listen 80;
    server_name nacos.example.com;

    location / {
        proxy_pass http://nacos-cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 健康检查

```bash
# 检查Nacos Server健康状态
curl http://localhost:8848/nacos/v1/console/health/readiness

# 返回：
# {"status":"UP"}  # 健康
# {"status":"DOWN"}  # 不健康

# 检查集群节点
curl http://localhost:8848/nacos/v1/core/cluster/nodes

# 返回节点列表JSON
```

## 7. 监控与管理 ⭐⭐⭐⭐

### 控制台功能

```
Nacos控制台（http://localhost:8848/nacos）：

1. 服务管理
   ├─ 服务列表：查看所有注册服务
   ├─ 服务详情：查看实例列表、元数据
   ├─ 服务路由：配置服务路由规则
   └─ 服务保护：设置服务保护阈值

2. 配置管理
   ├─ 配置列表：查看所有配置
   ├─ 配置详情：查看、编辑配置内容
   ├─ 历史版本：查看配置修改历史
   ├─ 监听查询：查看哪些客户端在监听配置
   └─ Beta发布：灰度发布配置

3. 命名空间
   └─ 创建、删除、查看命名空间

4. 集群管理
   └─ 查看集群节点状态

5. 权限控制
   ├─ 用户管理
   ├─ 角色管理
   └─ 权限管理
```

### 监控指标

```java
/**
 * 集成Spring Boot Actuator ⭐⭐⭐⭐
 */
// 1. 添加依赖
```

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
# 2. 配置监控端点
management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有端点
  endpoint:
    health:
      show-details: always

# 3. 访问监控端点
# http://localhost:8081/actuator/nacos-discovery  # 服务发现信息
# http://localhost:8081/actuator/nacos-config     # 配置信息
# http://localhost:8081/actuator/health           # 健康检查
```

### Prometheus集成

```yaml
# application.yml
management:
  metrics:
    export:
      prometheus:
        enabled: true
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
```

```xml
<!-- Prometheus依赖 -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'nacos-services'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8081', 'localhost:8082']
```

## 💡 最佳实践

### 1. 命名空间规划

```
推荐方案：按环境划分 ⭐⭐⭐⭐⭐

dev-namespace:     开发环境
test-namespace:    测试环境
staging-namespace: 预发布环境
prod-namespace:    生产环境

优点：
- 环境隔离清晰
- 配置互不影响
- 降低误操作风险
```

### 2. 配置管理规范

```yaml
# 配置命名规范 ⭐⭐⭐⭐⭐

# 应用专属配置
${spring.application.name}-${profile}.${file-extension}
示例：order-service-dev.yaml

# 公共配置（多服务共享）
common-${module}.${file-extension}
示例：common-mysql.yaml
     common-redis.yaml
     common-mq.yaml

# 分组规范
DEFAULT_GROUP:  默认分组
COMMON_GROUP:   公共配置
${业务域}_GROUP: 业务域配置
示例：ORDER_GROUP、USER_GROUP
```

### 3. 服务分组策略

```yaml
# 按业务域分组 ⭐⭐⭐⭐⭐
spring:
  cloud:
    nacos:
      discovery:
        group: ORDER_GROUP  # 订单业务域

# 好处：
# - 业务隔离
# - 服务治理方便
# - 支持跨组调用
```

### 4. 健康检查配置

```yaml
# 优化心跳配置 ⭐⭐⭐⭐
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000  # 心跳间隔5秒
        heart-beat-timeout: 15000  # 心跳超时15秒
        ip-delete-timeout: 30000   # 删除超时30秒

# 原则：
# - 心跳间隔不要太短（避免网络压力）
# - 超时时间要合理（快速发现故障，避免误判）
```

### 5. 配置加密

```java
/**
 * 敏感配置加密 ⭐⭐⭐⭐⭐
 */
@Configuration
public class JasyptConfig {

    /**
     * 使用Jasypt加密敏感配置
     */
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword("my-secret-key");  // 加密密钥
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }
}
```

```yaml
# 在Nacos中配置加密值
spring:
  datasource:
    username: root
    password: ENC(encrypted_password_here)  # ENC()包裹加密值

# 启动时指定密钥
java -jar app.jar --jasypt.encryptor.password=my-secret-key
```

### 6. 服务保护阈值

```yaml
# Nacos控制台配置服务保护阈值
# 服务管理 → 服务列表 → 详情 → 编辑服务

保护阈值: 0.5  # 0-1之间，默认0

# 作用：
# 当健康实例比例 <= 保护阈值时，返回所有实例（包括不健康）
# 防止雪崩效应

# 建议值：
# - 核心服务：0.3-0.5
# - 普通服务：0.5-0.7
```

## 🎯 练习建议

### 基础练习

1. **部署Nacos Server**
   - 单机模式部署
   - 配置MySQL持久化
   - 访问控制台

2. **服务注册与发现**
   - 创建服务提供者
   - 创建服务消费者
   - 使用RestTemplate调用
   - 使用OpenFeign调用

3. **配置中心实践**
   - 在控制台创建配置
   - 应用读取配置
   - 测试动态刷新

### 进阶练习

4. **命名空间隔离**
   - 创建dev/test/prod命名空间
   - 配置不同环境的服务
   - 测试环境隔离效果

5. **负载均衡**
   - 启动多个服务实例
   - 配置权重
   - 测试负载均衡效果

6. **集群部署**
   - 部署3节点Nacos集群
   - 配置MySQL主从
   - 配置Nginx负载均衡
   - 测试高可用

### 实战项目

7. **微服务配置管理**

   ```
   场景：
   - 用户服务、订单服务、商品服务
   - 公共配置：MySQL、Redis、MQ
   - 环境：dev、test、prod
   - 实现配置集中管理和动态刷新
   ```

8. **服务治理平台**
   ```
   实现：
   - 服务注册与发现
   - 配置中心
   - 多环境隔离
   - 灰度发布
   - 监控告警
   ```

## 💡 常见问题

### 1. 服务注册失败

```yaml
# 问题：服务无法注册到Nacos

# 排查步骤：
# 1. 检查Nacos Server是否启动
curl http://localhost:8848/nacos

# 2. 检查网络连接
telnet localhost 8848

# 3. 检查配置
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # 地址是否正确
        namespace: public  # 命名空间是否存在

# 4. 查看日志
# 搜索关键词：NacosNamingService、register
```

### 2. 配置不生效

```
问题：修改配置后不生效

解决方案：
1. 确认Data ID、Group、Namespace是否正确
2. 确认配置格式与file-extension一致
3. 添加@RefreshScope注解（@Value方式）
4. 使用@ConfigurationProperties（推荐，自动刷新）
5. 检查配置优先级
6. 查看Nacos日志：data\config-data\目录
```

### 3. 启动时无法连接Nacos

```yaml
# 问题：应用启动失败，无法连接Nacos

# 解决方案1：配置快速失败为false
spring:
  cloud:
    nacos:
      config:
        fail-fast: false  # 连接失败不阻塞启动

# 解决方案2：增加超时时间
spring:
  cloud:
    nacos:
      config:
        timeout: 10000  # 10秒

# 解决方案3：使用本地配置作为降级
# 同时在application.yml和Nacos配置
```

### 4. 命名空间ID在哪里找

```
1. 登录Nacos控制台
2. 点击左侧"命名空间"
3. 查看命名空间列表
4. 复制"命名空间ID"列的值（不是命名空间名称）

注意：
- public命名空间的ID是空字符串或"public"
- 自定义命名空间是UUID格式
```

### 5. 实例一直显示不健康

```yaml
# 问题：服务实例在控制台显示不健康

# 原因1：端口不通
# 解决：检查防火墙、安全组配置

# 原因2：健康检查URL不对
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000
        heart-beat-timeout: 15000

# 原因3：服务频繁重启
# 解决：修复服务稳定性问题

# 原因4：网络延迟
# 解决：增加超时时间
```

### 6. 集群脑裂问题

```
问题：Nacos集群出现脑裂

原因：
- 网络分区
- 节点时间不同步
- 节点配置错误

解决方案：
1. 确保节点数量>=3（奇数）
2. 同步各节点时间（NTP）
3. 检查网络连通性
4. 检查cluster.conf配置
5. 查看各节点日志
```

## 📚 下一步学习

1. 学习 [Sentinel流量控制](./Sentinel.md) - 服务容错保护
2. 学习 [Seata分布式事务](./Seata.md) - 微服务事务解决方案
3. 学习 [Spring Cloud Gateway](../04-Spring生态/Spring%20Cloud网关.md) - API网关
4. 实践 [电商微服务平台](../06-项目实战/电商微服务平台.md) - 综合运用

## 📖 参考资源

- [Nacos官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Spring Cloud Alibaba文档](https://spring-cloud-alibaba-group.github.io/github-pages/2022/zh-cn/index.html)
- [Nacos GitHub](https://github.com/alibaba/nacos)
- [Nacos架构&原理](https://nacos.io/zh-cn/docs/architecture.html)

