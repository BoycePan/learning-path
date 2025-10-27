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
    active: dev # 激活dev环境

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

## 7. 文件上传下载 ⭐⭐⭐⭐⭐

### 文件上传

```java
/**
 * 文件上传配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class FileUploadConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        // 单个文件最大大小
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        // 总上传数据最大大小
        factory.setMaxRequestSize(DataSize.ofMegabytes(50));
        return factory.createMultipartConfig();
    }
}

/**
 * 文件上传Controller ⭐⭐⭐⭐⭐
 */
@RestController
@RequestMapping("/api/file")
@Slf4j
public class FileController {

    @Value("${file.upload.path:/uploads/}")
    private String uploadPath;

    /**
     * 单文件上传
     */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        try {
            // 获取原始文件名
            String originalFilename = file.getOriginalFilename();
            // 生成新文件名（防止重复）
            String fileName = UUID.randomUUID().toString() +
                            originalFilename.substring(originalFilename.lastIndexOf("."));

            // 创建上传目录
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 保存文件
            File dest = new File(uploadPath + fileName);
            file.transferTo(dest);

            log.info("文件上传成功：{}", fileName);
            return Result.success(fileName);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败");
        }
    }

    /**
     * 多文件上传
     */
    @PostMapping("/upload/batch")
    public Result<List<String>> uploadBatch(@RequestParam("files") MultipartFile[] files) {
        List<String> fileNames = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    String originalFilename = file.getOriginalFilename();
                    String fileName = UUID.randomUUID().toString() +
                                    originalFilename.substring(originalFilename.lastIndexOf("."));

                    File dest = new File(uploadPath + fileName);
                    file.transferTo(dest);
                    fileNames.add(fileName);

                } catch (IOException e) {
                    log.error("文件上传失败：{}", file.getOriginalFilename(), e);
                }
            }
        }

        return Result.success(fileNames);
    }

    /**
     * 文件下载
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> download(@PathVariable String fileName) {
        try {
            File file = new File(uploadPath + fileName);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                           "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            log.error("文件下载失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### 配置文件

```yaml
# application.yml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB # 单个文件最大大小
      max-request-size: 50MB # 总上传数据最大大小

# 自定义上传路径
file:
  upload:
    path: /data/uploads/
```

## 8. 异步任务 ⭐⭐⭐⭐⭐

```java
/**
 * 启用异步任务 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableAsync  // 启用异步任务
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

/**
 * 异步任务配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 核心线程数
        executor.setCorePoolSize(5);
        // 最大线程数
        executor.setMaxPoolSize(10);
        // 队列容量
        executor.setQueueCapacity(100);
        // 线程名称前缀
        executor.setThreadNamePrefix("async-");
        // 拒绝策略
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

/**
 * 异步任务示例 ⭐⭐⭐⭐⭐
 */
@Service
@Slf4j
public class AsyncService {

    /**
     * 无返回值异步方法
     */
    @Async("taskExecutor")
    public void asyncTask() {
        log.info("异步任务开始执行，线程：{}", Thread.currentThread().getName());
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        log.info("异步任务执行完成");
    }

    /**
     * 有返回值异步方法
     */
    @Async("taskExecutor")
    public CompletableFuture<String> asyncTaskWithResult() {
        log.info("异步任务开始执行");
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return CompletableFuture.completedFuture("任务完成");
    }

    /**
     * 发送邮件（异步）
     */
    @Async
    public void sendEmail(String to, String subject, String content) {
        log.info("开始发送邮件到：{}", to);
        // 发送邮件逻辑
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        log.info("邮件发送完成");
    }
}

/**
 * 使用异步任务
 */
@RestController
@RequestMapping("/api/async")
public class AsyncController {

    @Autowired
    private AsyncService asyncService;

    @GetMapping("/test")
    public Result<String> test() {
        log.info("Controller开始执行");

        // 调用异步方法（不会阻塞）
        asyncService.asyncTask();

        log.info("Controller执行完成");
        return Result.success("请求处理完成");
    }

    @GetMapping("/test-result")
    public Result<String> testWithResult() throws Exception {
        CompletableFuture<String> future = asyncService.asyncTaskWithResult();

        // 等待异步任务完成并获取结果
        String result = future.get();

        return Result.success(result);
    }
}
```

## 9. 缓存管理 ⭐⭐⭐⭐⭐

```java
/**
 * 启用缓存 ⭐⭐⭐⭐⭐
 */
@SpringBootApplication
@EnableCaching  // 启用缓存
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

/**
 * Redis缓存配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 使用Jackson序列化
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(
            mapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL
        );
        serializer.setObjectMapper(mapper);

        // 设置key和value的序列化规则
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();

        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))  // 缓存过期时间30分钟
                .serializeKeysWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()
                    )
                )
                .disableCachingNullValues();  // 不缓存null值

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
    }
}

/**
 * 缓存使用示例 ⭐⭐⭐⭐⭐
 */
@Service
@Slf4j
public class UserService {

    @Autowired
    private UserMapper userMapper;

    /**
     * @Cacheable：查询时使用缓存
     * value：缓存名称
     * key：缓存key（支持SpEL表达式）
     * unless：条件不缓存
     */
    @Cacheable(value = "user", key = "#id", unless = "#result == null")
    public User getById(Long id) {
        log.info("从数据库查询用户：{}", id);
        return userMapper.selectById(id);
    }

    /**
     * @CachePut：更新缓存
     */
    @CachePut(value = "user", key = "#user.id")
    public User update(User user) {
        log.info("更新用户：{}", user.getId());
        userMapper.updateById(user);
        return user;
    }

    /**
     * @CacheEvict：删除缓存
     * allEntries：是否清空所有缓存
     * beforeInvocation：是否在方法执行前清除
     */
    @CacheEvict(value = "user", key = "#id")
    public void delete(Long id) {
        log.info("删除用户：{}", id);
        userMapper.deleteById(id);
    }

    /**
     * 清空所有用户缓存
     */
    @CacheEvict(value = "user", allEntries = true)
    public void clearCache() {
        log.info("清空所有用户缓存");
    }

    /**
     * 手动操作Redis
     */
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void manualCache() {
        // 设置值
        redisTemplate.opsForValue().set("key", "value", 10, TimeUnit.MINUTES);

        // 获取值
        Object value = redisTemplate.opsForValue().get("key");

        // 删除
        redisTemplate.delete("key");

        // Hash操作
        redisTemplate.opsForHash().put("user:1", "name", "张三");

        // List操作
        redisTemplate.opsForList().rightPush("list", "item");

        // Set操作
        redisTemplate.opsForSet().add("set", "member");

        // ZSet操作
        redisTemplate.opsForZSet().add("zset", "member", 100);
    }
}
```

## 10. 事务管理 ⭐⭐⭐⭐⭐

```java
/**
 * 声明式事务 ⭐⭐⭐⭐⭐
 */
@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductMapper productMapper;

    /**
     * @Transactional：声明式事务
     * rollbackFor：指定回滚异常
     * propagation：事务传播行为
     * isolation：事务隔离级别
     */
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(Order order) {
        // 1. 创建订单
        orderMapper.insert(order);

        // 2. 扣减库存
        productMapper.decreaseStock(order.getProductId(), order.getQuantity());

        // 3. 如果发生异常，整个事务回滚
        if (order.getAmount() > 10000) {
            throw new BusinessException("订单金额超限");
        }
    }

    /**
     * 事务传播行为示例
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        // REQUIRED：如果当前存在事务，则加入该事务；如果不存在，则创建新事务
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // REQUIRES_NEW：创建新事务，如果当前存在事务，则挂起当前事务
    }

    @Transactional(propagation = Propagation.NESTED)
    public void method3() {
        // NESTED：如果当前存在事务，则在嵌套事务内执行
    }

    /**
     * 编程式事务
     */
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticTransaction() {
        transactionTemplate.execute(status -> {
            try {
                // 业务逻辑
                orderMapper.insert(new Order());
                productMapper.decreaseStock(1L, 1);
                return true;
            } catch (Exception e) {
                // 回滚事务
                status.setRollbackOnly();
                return false;
            }
        });
    }
}
```

## 11. Actuator 监控 ⭐⭐⭐⭐⭐

### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 配置

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: "*" # 暴露所有端点
      base-path: /actuator # 端点基础路径
  endpoint:
    health:
      show-details: always # 显示健康检查详情
  metrics:
    tags:
      application: ${spring.application.name}
```

### 常用端点

```bash
# 健康检查
GET http://localhost:8080/actuator/health

# 应用信息
GET http://localhost:8080/actuator/info

# 查看所有Bean
GET http://localhost:8080/actuator/beans

# 查看配置属性
GET http://localhost:8080/actuator/configprops

# 查看环境变量
GET http://localhost:8080/actuator/env

# 查看日志配置
GET http://localhost:8080/actuator/loggers

# 查看指标
GET http://localhost:8080/actuator/metrics

# 查看HTTP跟踪
GET http://localhost:8080/actuator/httptrace

# 查看线程dump
GET http://localhost:8080/actuator/threaddump

# 查看堆dump
GET http://localhost:8080/actuator/heapdump
```

### 自定义健康检查

```java
/**
 * 自定义健康检查 ⭐⭐⭐⭐⭐
 */
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // 检查自定义条件
        boolean isHealthy = checkCustomCondition();

        if (isHealthy) {
            return Health.up()
                    .withDetail("status", "运行正常")
                    .withDetail("timestamp", System.currentTimeMillis())
                    .build();
        } else {
            return Health.down()
                    .withDetail("status", "服务异常")
                    .withDetail("error", "检查失败")
                    .build();
        }
    }

    private boolean checkCustomCondition() {
        // 自定义检查逻辑
        return true;
    }
}
```

### 自定义指标

```java
/**
 * 自定义指标 ⭐⭐⭐⭐⭐
 */
@Component
public class CustomMetrics {

    private final Counter orderCounter;
    private final Gauge orderGauge;
    private final Timer orderTimer;

    public CustomMetrics(MeterRegistry registry) {
        // 计数器
        this.orderCounter = Counter.builder("orders.created")
                .description("订单创建数量")
                .tag("type", "online")
                .register(registry);

        // 仪表
        this.orderGauge = Gauge.builder("orders.pending", this, CustomMetrics::getPendingOrders)
                .description("待处理订单数")
                .register(registry);

        // 计时器
        this.orderTimer = Timer.builder("orders.process.time")
                .description("订单处理时间")
                .register(registry);
    }

    public void createOrder() {
        orderCounter.increment();
    }

    public void processOrder() {
        orderTimer.record(() -> {
            // 处理订单逻辑
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    }

    private double getPendingOrders() {
        // 返回待处理订单数
        return 10.0;
    }
}
```

## 12. 自动配置原理 ⭐⭐⭐⭐⭐

### @SpringBootApplication 注解

```java
@SpringBootApplication
// 等价于以下三个注解的组合
@SpringBootConfiguration  // 标识为配置类
@EnableAutoConfiguration  // 启用自动配置
@ComponentScan           // 组件扫描
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 自动配置原理

```java
/**
 * 自动配置原理 ⭐⭐⭐⭐⭐
 *
 * 1. @EnableAutoConfiguration 导入 AutoConfigurationImportSelector
 * 2. AutoConfigurationImportSelector 读取 META-INF/spring.factories
 * 3. 加载所有自动配置类
 * 4. 根据条件注解决定是否生效
 */

/**
 * 自定义自动配置类示例
 */
@Configuration
@ConditionalOnClass(RedisTemplate.class)  // 当存在RedisTemplate类时
@EnableConfigurationProperties(RedisProperties.class)  // 启用配置属性
public class MyRedisAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean  // 当容器中没有该Bean时
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        return template;
    }
}
```

### 常用条件注解

```java
/**
 * 条件注解 ⭐⭐⭐⭐⭐
 */

// 当类路径下存在指定类时
@ConditionalOnClass(DataSource.class)

// 当类路径下不存在指定类时
@ConditionalOnMissingClass("com.example.SomeClass")

// 当容器中存在指定Bean时
@ConditionalOnBean(DataSource.class)

// 当容器中不存在指定Bean时
@ConditionalOnMissingBean(DataSource.class)

// 当指定属性存在时
@ConditionalOnProperty(name = "app.enabled", havingValue = "true")

// 当Web应用时
@ConditionalOnWebApplication

// 当非Web应用时
@ConditionalOnNotWebApplication
```

## 13. 打包部署 ⭐⭐⭐⭐⭐

### Maven 打包

```bash
# 打包（跳过测试）
mvn clean package -DskipTests

# 打包（包含测试）
mvn clean package

# 生成的jar文件在 target/ 目录下
```

### 运行 JAR

```bash
# 基本运行
java -jar app.jar

# 指定配置文件
java -jar app.jar --spring.profiles.active=prod

# 指定端口
java -jar app.jar --server.port=8081

# 后台运行
nohup java -jar app.jar > app.log 2>&1 &

# 指定JVM参数
java -Xms512m -Xmx1024m -jar app.jar
```

### Docker 部署

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# 复制jar文件
COPY target/app.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# 构建镜像
docker build -t myapp:1.0 .

# 运行容器
docker run -d -p 8080:8080 --name myapp myapp:1.0

# 查看日志
docker logs -f myapp
```

### 多阶段构建（推荐）

```dockerfile
# 多阶段构建 Dockerfile
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Systemd 服务

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Spring Boot Application
After=syslog.target network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /opt/myapp/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl start myapp

# 停止服务
sudo systemctl stop myapp

# 重启服务
sudo systemctl restart myapp

# 查看状态
sudo systemctl status myapp

# 开机自启
sudo systemctl enable myapp
```

## 14. 最佳实践 ⭐⭐⭐⭐⭐

### 项目结构

```
com.example.project
├── controller      # 控制器层
│   ├── UserController.java
│   └── OrderController.java
├── service         # 服务层
│   ├── UserService.java
│   ├── impl
│   │   └── UserServiceImpl.java
├── mapper          # 数据访问层
│   ├── UserMapper.java
│   └── OrderMapper.java
├── entity          # 实体类
│   ├── User.java
│   └── Order.java
├── dto             # 数据传输对象
│   ├── UserDTO.java
│   └── OrderDTO.java
├── vo              # 视图对象
│   ├── UserVO.java
│   └── OrderVO.java
├── config          # 配置类
│   ├── RedisConfig.java
│   └── WebConfig.java
├── common          # 公共类
│   ├── Result.java
│   ├── Constants.java
│   └── exception
│       ├── BusinessException.java
│       └── GlobalExceptionHandler.java
├── util            # 工具类
│   ├── DateUtil.java
│   └── StringUtil.java
└── Application.java # 启动类
```

### 配置管理最佳实践

```yaml
# application.yml（主配置）
spring:
  profiles:
    active: @spring.profiles.active@  # 从Maven获取
  application:
    name: my-application

# 公共配置
logging:
  level:
    root: INFO

---
# application-dev.yml（开发环境）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dev_db
    username: root
    password: root

logging:
  level:
    com.example: DEBUG

---
# application-prod.yml（生产环境）
spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/prod_db
    username: ${DB_USERNAME}  # 从环境变量获取
    password: ${DB_PASSWORD}

logging:
  level:
    com.example: WARN
```

### 异常处理最佳实践

```java
/**
 * 自定义业务异常 ⭐⭐⭐⭐⭐
 */
@Data
public class BusinessException extends RuntimeException {
    private Integer code;
    private String message;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
        this.message = message;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

/**
 * 全局异常处理器 ⭐⭐⭐⭐⭐
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<String> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<String> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        log.error("参数校验失败：{}", message);
        return Result.error(400, message);
    }

    /**
     * 数据库异常
     */
    @ExceptionHandler(DataAccessException.class)
    public Result<String> handleDataAccessException(DataAccessException e) {
        log.error("数据库异常", e);
        return Result.error("数据库操作失败");
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

### 日志管理最佳实践

```java
/**
 * 日志使用规范 ⭐⭐⭐⭐⭐
 */
@Service
@Slf4j
public class UserService {

    public User getById(Long id) {
        // 使用占位符，避免字符串拼接
        log.debug("查询用户，ID：{}", id);

        try {
            User user = userMapper.selectById(id);
            if (user == null) {
                log.warn("用户不存在，ID：{}", id);
                return null;
            }
            return user;
        } catch (Exception e) {
            // 记录异常堆栈
            log.error("查询用户失败，ID：{}", id, e);
            throw new BusinessException("查询用户失败");
        }
    }

    /**
     * 日志级别使用规范：
     * ERROR：错误信息，需要立即处理
     * WARN：警告信息，可能存在问题
     * INFO：重要的业务流程信息
     * DEBUG：调试信息
     * TRACE：详细的调试信息
     */
}
```

### 性能优化建议

```java
/**
 * 性能优化最佳实践 ⭐⭐⭐⭐⭐
 */

// 1. 使用连接池
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        return new HikariDataSource(config);
    }
}

// 2. 使用缓存
@Service
public class ProductService {
    @Cacheable(value = "product", key = "#id")
    public Product getById(Long id) {
        return productMapper.selectById(id);
    }
}

// 3. 异步处理
@Service
public class NotificationService {
    @Async
    public void sendNotification(String message) {
        // 异步发送通知
    }
}

// 4. 批量操作
@Service
public class BatchService {
    public void batchInsert(List<User> users) {
        // 使用批量插入，而不是循环单条插入
        userService.saveBatch(users);
    }
}

// 5. 分页查询
@Service
public class UserService {
    public Page<User> getUsers(int pageNum, int pageSize) {
        Page<User> page = new Page<>(pageNum, pageSize);
        return userMapper.selectPage(page, null);
    }
}
```

## 15. 常见问题 ⭐⭐⭐⭐⭐

### 问题1：端口被占用

```bash
# 查看端口占用
netstat -ano | findstr 8080  # Windows
lsof -i:8080                 # Linux/Mac

# 修改端口
server.port=8081
```

### 问题2：循环依赖

```java
// 问题代码
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}

// 解决方案1：使用@Lazy
@Service
public class ServiceA {
    @Autowired
    @Lazy
    private ServiceB serviceB;
}

// 解决方案2：使用Setter注入
@Service
public class ServiceA {
    private ServiceB serviceB;

    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 解决方案3：重构代码，避免循环依赖
```

### 问题3：事务不生效

```java
// 问题1：方法不是public
@Transactional
private void method() { }  // ❌ 事务不生效

@Transactional
public void method() { }   // ✅ 正确

// 问题2：同类方法调用
@Service
public class UserService {
    public void methodA() {
        methodB();  // ❌ 事务不生效
    }

    @Transactional
    public void methodB() { }
}

// 解决方案：通过代理对象调用
@Service
public class UserService {
    @Autowired
    private UserService self;

    public void methodA() {
        self.methodB();  // ✅ 正确
    }

    @Transactional
    public void methodB() { }
}

// 问题3：异常被捕获
@Transactional
public void method() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        // ❌ 异常被捕获，事务不会回滚
    }
}

// 解决方案：手动回滚或抛出异常
@Transactional
public void method() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        // 或者重新抛出异常
        throw new BusinessException("操作失败");
    }
}
```

### 问题4：跨域问题

```java
/**
 * 跨域配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

// 或使用注解
@RestController
@CrossOrigin(origins = "*")
public class UserController {
    // ...
}
```

### 问题5：静态资源访问

```java
/**
 * 静态资源配置 ⭐⭐⭐⭐⭐
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源路径
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/data/uploads/");
    }
}
```

## 💡 重点总结

### Spring Boot vs Spring ⭐⭐⭐⭐⭐

| 特性     | Spring     | Spring Boot           |
| -------- | ---------- | --------------------- |
| 配置     | XML繁琐    | 自动配置 ⭐⭐⭐⭐⭐   |
| 依赖     | 手动管理   | 起步依赖 ⭐⭐⭐⭐⭐   |
| 服务器   | 外部Tomcat | 内嵌服务器 ⭐⭐⭐⭐⭐ |
| 开发效率 | 较低       | 极高 ⭐⭐⭐⭐⭐       |

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

<!-- MyBatis-Plus -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3</version>
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

<!-- 参数校验 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 核心注解总结 ⭐⭐⭐⭐⭐

```java
// 启动类注解
@SpringBootApplication

// 控制器注解
@RestController
@RequestMapping
@GetMapping
@PostMapping
@PutMapping
@DeleteMapping
@PathVariable
@RequestParam
@RequestBody

// 服务层注解
@Service
@Transactional

// 数据访问层注解
@Mapper
@Repository

// 配置类注解
@Configuration
@Bean
@Value
@ConfigurationProperties

// 条件注解
@ConditionalOnClass
@ConditionalOnMissingBean
@ConditionalOnProperty

// 其他注解
@Async
@Scheduled
@Cacheable
@CachePut
@CacheEvict
@Validated
```

## 🎯 练习建议

### 初级练习

1. ✅ 创建Spring Boot项目
2. ✅ 实现完整的CRUD接口
3. ✅ 添加参数校验和异常处理
4. ✅ 配置多环境

### 中级练习

5. ✅ 实现文件上传下载
6. ✅ 实现异步任务
7. ✅ 集成Redis缓存
8. ✅ 实现定时任务
9. ✅ 添加拦截器和过滤器

### 高级练习

10. ✅ 配置Actuator监控
11. ✅ 实现自定义Starter
12. ✅ Docker部署
13. ✅ 性能优化
14. ✅ 生产环境部署

## 📚 学习路线

### 第1周：基础入门

- Spring Boot快速开始
- 配置文件管理
- RESTful API开发
- 参数校验

### 第2周：核心功能

- 数据库集成（MyBatis-Plus）
- Redis缓存
- 事务管理
- 异常处理

### 第3周：高级特性

- 文件上传下载
- 异步任务
- 定时任务
- 拦截器和过滤器

### 第4周：生产就绪

- Actuator监控
- 日志管理
- 性能优化
- 打包部署

### 第5周：实战项目

- 完整项目开发
- 最佳实践应用
- 常见问题解决

## 📖 推荐资源

### 官方文档

- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Spring Boot参考指南](https://docs.spring.io/spring-boot/docs/current/reference/html/)

### 推荐书籍

- 《Spring Boot实战》
- 《Spring Boot编程思想》
- 《深入浅出Spring Boot》

### 在线资源

- [Spring官方教程](https://spring.io/guides)
- [Baeldung Spring教程](https://www.baeldung.com/spring-boot)

## 📝 下一步

学习完Spring Boot后，继续学习：

- [Spring Cloud](./SpringCloud.md) - 微服务架构
- [Spring Security](./SpringSecurity.md) - 安全框架（如果有）

---

**恭喜你完成 Spring Boot 学习！** 🎉

Spring Boot 是现代 Java 开发的核心框架，掌握它将大大提升你的开发效率。继续实践，在实际项目中应用所学知识！
