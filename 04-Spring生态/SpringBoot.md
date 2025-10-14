# Spring Boot快速开发

## 📌 学习目标

- 理解Spring Boot核心特性
- 掌握Spring Boot项目搭建
- 熟练使用常用注解
- 掌握RESTful API开发
- 了解Spring Boot自动配置原理

## ⭐ Spring Boot核心特性

- **自动配置** - 约定优于配置 ⭐⭐⭐⭐⭐
- **起步依赖** - 简化依赖管理 ⭐⭐⭐⭐⭐
- **内嵌服务器** - 无需外部Tomcat ⭐⭐⭐⭐⭐
- **生产就绪** - 监控、健康检查 ⭐⭐⭐⭐⭐
- **零XML配置** - 纯Java配置 ⭐⭐⭐⭐⭐

## 1. 快速开始 ⭐⭐⭐⭐⭐

### 创建项目

```xml
<!-- pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Spring Boot父项目 ⭐⭐⭐⭐⭐ -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Web起步依赖 ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- 测试 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- 开发工具（热部署）⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Lombok（简化代码）⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- Spring Boot打包插件 ⭐⭐⭐⭐⭐ -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 主启动类

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot主启动类 ⭐⭐⭐⭐⭐
 * @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
 */
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### Hello World

```java
import org.springframework.web.bind.annotation.*;

/**
 * RESTful控制器 ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/api")
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
    
    @GetMapping("/hello/{name}")
    public String helloName(@PathVariable String name) {
        return "Hello, " + name + "!";
    }
}
```

## 2. 配置文件 ⭐⭐⭐⭐⭐

### application.yml（推荐）

```yaml
# 服务器配置 ⭐⭐⭐⭐⭐
server:
  port: 8080
  servlet:
    context-path: /api

# 数据源配置 ⭐⭐⭐⭐⭐
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
    username: root
    password: password
    # 连接池配置（HikariCP）
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  
  # JPA配置 ⭐⭐⭐⭐
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
  
  # Redis配置 ⭐⭐⭐⭐⭐
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  
  # Jackson配置 ⭐⭐⭐⭐
  jackson:
    date-format: yyyy-MM-DD HH:mm:ss
    time-zone: GMT+8
    default-property-inclusion: non_null

# MyBatis-Plus配置 ⭐⭐⭐⭐⭐
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-value: 1
      logic-not-delete-value: 0

# 日志配置 ⭐⭐⭐⭐⭐
logging:
  level:
    root: INFO
    com.example: DEBUG
  file:
    name: logs/application.log
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n"

# 自定义配置 ⭐⭐⭐⭐⭐
app:
  name: MyApp
  version: 1.0.0
  author: zhangsan
```

### 读取配置

```java
/**
 * 方式1：@Value注解 ⭐⭐⭐⭐⭐
 */
@Component
public class AppConfig {
    @Value("${app.name}")
    private String appName;
    
    @Value("${app.version}")
    private String version;
    
    @Value("${server.port}")
    private int port;
}

/**
 * 方式2：@ConfigurationProperties（推荐）⭐⭐⭐⭐⭐
 */
@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private String version;
    private String author;
}

/**
 * 方式3：Environment ⭐⭐⭐⭐
 */
@Component
public class ConfigService {
    @Autowired
    private Environment environment;
    
    public String getAppName() {
        return environment.getProperty("app.name");
    }
}
```

### 多环境配置 ⭐⭐⭐⭐⭐

```yaml
# application.yml（主配置）
spring:
  profiles:
    active: dev  # 激活dev环境

---
# application-dev.yml（开发环境）
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dev_db

---
# application-test.yml（测试环境）
server:
  port: 8081
spring:
  datasource:
    url: jdbc:mysql://test-server:3306/test_db

---
# application-prod.yml（生产环境）
server:
  port: 80
spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/prod_db
```

## 3. RESTful API开发 ⭐⭐⭐⭐⭐

### 统一返回格式

```java
/**
 * 统一返回结果 ⭐⭐⭐⭐⭐
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    public static <T> Result<T> success() {
        return new Result<>(200, "成功", null);
    }
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "成功", data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
}
```

### CRUD接口

```java
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * 实体类 ⭐⭐⭐⭐⭐
 */
@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

/**
 * Mapper接口 ⭐⭐⭐⭐⭐
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}

/**
 * Service接口 ⭐⭐⭐⭐⭐
 */
public interface UserService extends IService<User> {
    Page<User> searchUsers(int pageNum, int pageSize, String keyword);
}

/**
 * Service实现类 ⭐⭐⭐⭐⭐
 */
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    @Override
    public Page<User> searchUsers(int pageNum, int pageSize, String keyword) {
        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.like(User::getUsername, keyword)
                   .or()
                   .like(User::getEmail, keyword);
        }
        
        return baseMapper.selectPage(page, wrapper);
    }
}

/**
 * Controller ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 查询所有用户 ⭐⭐⭐⭐⭐
     */
    @GetMapping
    public Result<List<User>> list() {
        List<User> users = userService.list();
        return Result.success(users);
    }
    
    /**
     * 根据ID查询 ⭐⭐⭐⭐⭐
     */
    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }
    
    /**
     * 分页查询 ⭐⭐⭐⭐⭐
     */
    @GetMapping("/page")
    public Result<Page<User>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword) {
        
        Page<User> page = userService.searchUsers(pageNum, pageSize, keyword);
        return Result.success(page);
    }
    
    /**
     * 新增用户 ⭐⭐⭐⭐⭐
     */
    @PostMapping
    public Result<String> add(@RequestBody @Validated User user) {
        boolean success = userService.save(user);
        return success ? Result.success("添加成功") : Result.error("添加失败");
    }
    
    /**
     * 更新用户 ⭐⭐⭐⭐⭐
     */
    @PutMapping
    public Result<String> update(@RequestBody @Validated User user) {
        boolean success = userService.updateById(user);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }
    
    /**
     * 删除用户 ⭐⭐⭐⭐⭐
     */
    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean success = userService.removeById(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
    
    /**
     * 批量删除 ⭐⭐⭐⭐
     */
    @DeleteMapping("/batch")
    public Result<String> deleteBatch(@RequestBody List<Long> ids) {
        boolean success = userService.removeByIds(ids);
        return success ? Result.success("批量删除成功") : Result.error("批量删除失败");
    }
}
```

## 4. 参数校验 ⭐⭐⭐⭐⭐

```java
import javax.validation.constraints.*;

/**
 * 参数校验注解 ⭐⭐⭐⭐⭐
 */
@Data
public class UserDTO {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度在3-20之间")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$", 
             message = "密码至少8位，包含大小写字母和数字")
    private String password;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄最小为1")
    @Max(value = 150, message = "年龄最大为150")
    private Integer age;
    
    @NotNull(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}

/**
 * 使用@Validated启用校验 ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @PostMapping
    public Result<String> add(@RequestBody @Validated UserDTO userDTO) {
        // 如果校验失败，会自动抛出异常
        return Result.success("添加成功");
    }
}

/**
 * 全局异常处理 ⭐⭐⭐⭐⭐
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<String> handleValidException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        String message = bindingResult.getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        log.error("参数校验失败：{}", message);
        return Result.error(400, message);
    }
    
    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<String> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }
    
    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public Result<String> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("系统繁忙，请稍后再试");
    }
}
```

## 5. 拦截器和过滤器 ⭐⭐⭐⭐⭐

```java
/**
 * 拦截器（推荐）⭐⭐⭐⭐⭐
 */
@Component
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        
        if (StringUtils.isBlank(token)) {
            response.setStatus(401);
            response.getWriter().write("未登录");
            return false;
        }
        
        // 验证token
        // ...
        
        return true;
    }
    
    @Override
    public void postHandle(HttpServletRequest request, 
                          HttpServletResponse response, 
                          Object handler, 
                          ModelAndView modelAndView) throws Exception {
        // 请求处理后，视图渲染前
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) throws Exception {
        // 整个请求完成后
    }
}

/**
 * 注册拦截器 ⭐⭐⭐⭐⭐
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthInterceptor authInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")  // 拦截路径
                .excludePathPatterns("/api/login", "/api/register");  // 排除路径
    }
    
    /**
     * 跨域配置 ⭐⭐⭐⭐⭐
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}

/**
 * 过滤器 ⭐⭐⭐⭐
 */
@Component
@WebFilter(urlPatterns = "/*", filterName = "logFilter")
public class LogFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, 
                        ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        System.out.println("请求URI：" + req.getRequestURI());
        
        long start = System.currentTimeMillis();
        chain.doFilter(request, response);
        long end = System.currentTimeMillis();
        
        System.out.println("耗时：" + (end - start) + "ms");
    }
}
```

## 6. 定时任务 ⭐⭐⭐⭐⭐

```java
/**
 * 启用定时任务 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableScheduling  // 启用定时任务
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

/**
 * 定时任务示例 ⭐⭐⭐⭐⭐
 */
@Component
@Slf4j
public class ScheduledTasks {
    
    /**
     * 固定间隔执行（上次执行完后5秒）
     */
    @Scheduled(fixedDelay = 5000)
    public void task1() {
        log.info("固定间隔任务执行");
    }
    
    /**
     * 固定频率执行（每5秒）
     */
    @Scheduled(fixedRate = 5000)
    public void task2() {
        log.info("固定频率任务执行");
    }
    
    /**
     * Cron表达式（每天凌晨1点） ⭐⭐⭐⭐⭐
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void task3() {
        log.info("每天凌晨1点执行");
    }
    
    /**
     * 常用Cron表达式 ⭐⭐⭐⭐⭐
     * 0 0/5 * * * ?    每5分钟
     * 0 0 * * * ?      每小时
     * 0 0 12 * * ?     每天中午12点
     * 0 0 0 * * ?      每天凌晨0点
     * 0 0 0 1 * ?      每月1号凌晨0点
     * 0 0 0 ? * MON    每周一凌晨0点
     */
}
```

## 💡 重点总结

### Spring Boot vs Spring ⭐⭐⭐⭐⭐

| 特性 | Spring | Spring Boot |
|------|--------|-------------|
| 配置 | XML繁琐 | 自动配置 ⭐⭐⭐⭐⭐ |
| 依赖 | 手动管理 | 起步依赖 ⭐⭐⭐⭐⭐ |
| 服务器 | 外部Tomcat | 内嵌服务器 ⭐⭐⭐⭐⭐ |
| 开发效率 | 较低 | 极高 ⭐⭐⭐⭐⭐ |

### 常用起步依赖 ⭐⭐⭐⭐⭐

```xml
<!-- Web开发 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- 数据库JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 安全 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- 监控 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 🎯 练习建议

1. 创建Spring Boot项目
2. 实现完整的CRUD接口
3. 添加参数校验和异常处理
4. 实现拦截器和过滤器
5. 实现定时任务

## 📚 下一步

学习完Spring Boot后，继续学习 [Spring Cloud](./SpringCloud.md)

