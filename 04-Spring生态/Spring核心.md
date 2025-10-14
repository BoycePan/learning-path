# Spring框架核心

## 📌 学习目标

- 理解Spring核心概念
- 掌握IOC容器
- 理解AOP编程
- 掌握Spring常用注解
- 了解Spring事务管理

## ⭐ Spring核心概念

- **IOC（控制反转）** ⭐⭐⭐⭐⭐
- **DI（依赖注入）** ⭐⭐⭐⭐⭐
- **AOP（面向切面编程）** ⭐⭐⭐⭐⭐
- **Bean管理** ⭐⭐⭐⭐⭐
- **事务管理** ⭐⭐⭐⭐⭐

## 1. IOC容器 ⭐⭐⭐⭐⭐

### 什么是IOC？

```
传统方式：对象自己创建依赖
IOC方式：Spring容器创建并注入依赖

优点：
1. 降低耦合度
2. 便于测试
3. 便于维护
```

### Bean配置方式

```java
/**
 * 方式1：XML配置（不推荐，过时）
 */
// applicationContext.xml
<bean id="userService" class="com.example.service.UserServiceImpl">
    <property name="userDao" ref="userDao"/>
</bean>

/**
 * 方式2：注解配置（推荐） ⭐⭐⭐⭐⭐
 */
@Component  // 通用组件
public class UserDaoImpl implements UserDao {
    // ...
}

@Service  // 业务层 ⭐⭐⭐⭐⭐
public class UserService {
    @Autowired  // 自动注入
    private UserDao userDao;
}

@Controller  // 控制层
public class UserController {
    @Autowired
    private UserService userService;
}

@Repository  // 数据访问层
public class UserRepository {
    // ...
}

/**
 * 方式3：Java配置类（推荐） ⭐⭐⭐⭐⭐
 */
@Configuration  // 配置类
@ComponentScan("com.example")  // 扫描包
public class AppConfig {

    @Bean  // 声明Bean
    public UserService userService() {
        return new UserServiceImpl();
    }

    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }
}
```

### 依赖注入方式 ⭐⭐⭐⭐⭐

```java
/**
 * 1. 构造器注入（推荐） ⭐⭐⭐⭐⭐
 */
@Service
public class UserService {
    private final UserDao userDao;

    // Spring 4.3+，单个构造器可省略@Autowired
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}

/**
 * 2. Setter注入 ⭐⭐⭐⭐
 */
@Service
public class UserService {
    private UserDao userDao;

    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
}

/**
 * 3. 字段注入（最常用，但不推荐测试时） ⭐⭐⭐⭐⭐
 */
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
}

/**
 * 4. 按名称注入 ⭐⭐⭐⭐
 */
@Service
public class UserService {
    @Autowired
    @Qualifier("userDaoImpl")  // 指定Bean名称
    private UserDao userDao;

    // 或使用@Resource
    @Resource(name = "userDaoImpl")
    private UserDao userDao2;
}

/**
 * 5. 集合注入 ⭐⭐⭐⭐
 */
@Service
public class NotificationService {
    @Autowired
    private List<MessageSender> senders;  // 注入所有MessageSender实现
}
```

## 2. Bean作用域 ⭐⭐⭐⭐⭐

```java
/**
 * Bean作用域 ⭐⭐⭐⭐⭐
 */
@Component
@Scope("singleton")  // 默认，单例 ⭐⭐⭐⭐⭐
public class SingletonBean {
    // 整个应用只有一个实例
}

@Component
@Scope("prototype")  // 原型，每次获取都创建新实例 ⭐⭐⭐⭐
public class PrototypeBean {
    // 每次请求都创建新对象
}

// Web环境下的作用域
@Component
@Scope("request")  // 请求作用域 ⭐⭐⭐⭐
public class RequestBean {
    // 每个HTTP请求一个实例
}

@Component
@Scope("session")  // 会话作用域 ⭐⭐⭐⭐
public class SessionBean {
    // 每个HTTP会话一个实例
}

/**
 * Bean生命周期回调 ⭐⭐⭐⭐
 */
@Component
public class LifecycleBean {

    @PostConstruct  // 初始化回调 ⭐⭐⭐⭐⭐
    public void init() {
        System.out.println("Bean初始化");
    }

    @PreDestroy  // 销毁回调 ⭐⭐⭐⭐
    public void destroy() {
        System.out.println("Bean销毁");
    }
}
```

## 3. AOP面向切面编程 ⭐⭐⭐⭐⭐

### AOP核心概念

```
切面（Aspect）：横切关注点的模块化
连接点（JoinPoint）：方法执行点
切入点（Pointcut）：连接点的集合
通知（Advice）：在切入点执行的动作
    - @Before：前置通知
    - @After：后置通知
    - @AfterReturning：返回通知
    - @AfterThrowing：异常通知
    - @Around：环绕通知
```

### AOP实现

```java
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

/**
 * 日志切面 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
public class LogAspect {

    /**
     * 切入点定义 ⭐⭐⭐⭐⭐
     */
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void servicePointcut() {}

    /**
     * 前置通知 ⭐⭐⭐⭐⭐
     */
    @Before("servicePointcut()")
    public void before(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        System.out.println("方法执行前：" + methodName);
        System.out.println("参数：" + Arrays.toString(args));
    }

    /**
     * 后置通知（无论是否异常都执行） ⭐⭐⭐⭐
     */
    @After("servicePointcut()")
    public void after(JoinPoint joinPoint) {
        System.out.println("方法执行后：" + joinPoint.getSignature().getName());
    }

    /**
     * 返回通知（方法正常返回后执行） ⭐⭐⭐⭐⭐
     */
    @AfterReturning(pointcut = "servicePointcut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("方法返回值：" + result);
    }

    /**
     * 异常通知 ⭐⭐⭐⭐
     */
    @AfterThrowing(pointcut = "servicePointcut()", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        System.out.println("方法异常：" + ex.getMessage());
    }

    /**
     * 环绕通知（最强大） ⭐⭐⭐⭐⭐
     */
    @Around("servicePointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();

        System.out.println("环绕前：" + methodName);
        long start = System.currentTimeMillis();

        try {
            // 执行目标方法
            Object result = joinPoint.proceed();

            long end = System.currentTimeMillis();
            System.out.println("环绕后：" + methodName + "，耗时：" + (end - start) + "ms");

            return result;
        } catch (Exception e) {
            System.out.println("环绕异常：" + e.getMessage());
            throw e;
        }
    }
}

/**
 * 切入点表达式示例 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
public class PointcutExamples {

    // 1. 所有public方法
    @Pointcut("execution(public * *(..))")
    public void publicMethods() {}

    // 2. service包下所有方法
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}

    // 3. 特定类的所有方法
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}

    // 4. 带注解的方法
    @Pointcut("@annotation(com.example.annotation.Log)")
    public void logMethods() {}

    // 5. 组合切入点
    @Pointcut("publicMethods() && serviceMethods()")
    public void publicServiceMethods() {}
}
```

### 实际应用场景 ⭐⭐⭐⭐⭐

```java
/**
 * 1. 性能监控 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
public class PerformanceAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object monitor(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long end = System.currentTimeMillis();

        String methodName = joinPoint.getSignature().getName();
        System.out.println(methodName + " 执行耗时：" + (end - start) + "ms");

        return result;
    }
}

/**
 * 2. 统一异常处理 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
public class ExceptionAspect {

    @AfterThrowing(pointcut = "execution(* com.example.controller.*.*(..))",
                   throwing = "ex")
    public void handleException(JoinPoint joinPoint, Exception ex) {
        String methodName = joinPoint.getSignature().getName();
        System.err.println("方法 " + methodName + " 发生异常：" + ex.getMessage());
        // 记录日志、发送告警等
    }
}

/**
 * 3. 权限校验 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
public class AuthAspect {

    @Before("@annotation(requiresAuth)")
    public void checkAuth(JoinPoint joinPoint, RequiresAuth requiresAuth) {
        String role = requiresAuth.value();
        // 获取当前用户
        // 检查权限
        // 如果无权限，抛出异常
    }
}

// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresAuth {
    String value() default "USER";
}

// 使用
@Service
public class UserService {
    @RequiresAuth("ADMIN")
    public void deleteUser(Long id) {
        // 只有ADMIN才能执行
    }
}

/**
 * 4. 日志记录 ⭐⭐⭐⭐⭐
 */
@Aspect
@Component
@Slf4j
public class LogAspect {

    @Around("@annotation(log)")
    public Object log(ProceedingJoinPoint joinPoint, Log log) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.info("方法：{}，参数：{}", methodName, args);

        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long end = System.currentTimeMillis();

        log.info("方法：{}，返回：{}，耗时：{}ms", methodName, result, (end - start));

        return result;
    }
}
```

## 4. Spring常用注解 ⭐⭐⭐⭐⭐

```java
/**
 * 组件注解 ⭐⭐⭐⭐⭐
 */
@Component  // 通用组件
@Service    // 业务层
@Repository // 数据访问层
@Controller // 控制层
@RestController  // RESTful控制层
@Configuration  // 配置类

/**
 * 依赖注入注解 ⭐⭐⭐⭐⭐
 */
@Autowired  // 自动注入（Spring）
@Resource   // 自动注入（Java标准）
@Qualifier  // 指定注入Bean
@Value      // 注入配置值

/**
 * 配置注解 ⭐⭐⭐⭐⭐
 */
@Bean           // 声明Bean
@ComponentScan  // 组件扫描
@Import         // 导入配置类
@PropertySource // 加载properties文件
@Profile        // 环境Profile

/**
 * 作用域和生命周期 ⭐⭐⭐⭐
 */
@Scope          // Bean作用域
@Lazy           // 懒加载
@PostConstruct  // 初始化回调
@PreDestroy     // 销毁回调

/**
 * AOP注解 ⭐⭐⭐⭐⭐
 */
@Aspect         // 切面
@Pointcut       // 切入点
@Before         // 前置通知
@After          // 后置通知
@AfterReturning // 返回通知
@AfterThrowing  // 异常通知
@Around         // 环绕通知

/**
 * 事务注解 ⭐⭐⭐⭐⭐
 */
@Transactional  // 事务管理
@EnableTransactionManagement  // 启用事务
```

## 5. Spring事务管理 ⭐⭐⭐⭐⭐

```java
/**
 * 声明式事务 ⭐⭐⭐⭐⭐
 */
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AccountMapper accountMapper;

    /**
     * 基本事务 ⭐⭐⭐⭐⭐
     */
    @Transactional
    public void createUser(User user) {
        userMapper.insert(user);
        // 如果这里抛出异常，上面的插入会回滚
    }

    /**
     * 事务属性 ⭐⭐⭐⭐⭐
     */
    @Transactional(
        propagation = Propagation.REQUIRED,  // 传播行为
        isolation = Isolation.DEFAULT,       // 隔离级别
        timeout = 30,                        // 超时时间（秒）
        readOnly = false,                    // 是否只读
        rollbackFor = Exception.class        // 回滚异常
    )
    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    /**
     * 事务传播行为 ⭐⭐⭐⭐⭐
     */
    // REQUIRED：如果有事务就加入，没有就新建（默认）
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {}

    // REQUIRES_NEW：总是新建事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {}

    // SUPPORTS：如果有事务就加入，没有就以非事务运行
    @Transactional(propagation = Propagation.SUPPORTS)
    public void method3() {}

    // NOT_SUPPORTED：以非事务方式运行，如果有事务就挂起
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void method4() {}

    // NESTED：嵌套事务
    @Transactional(propagation = Propagation.NESTED)
    public void method5() {}

    /**
     * 转账示例 ⭐⭐⭐⭐⭐
     */
    @Transactional(rollbackFor = Exception.class)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // 扣款
        accountMapper.deduct(fromId, amount);

        // 模拟异常
        if (amount.compareTo(new BigDecimal("1000")) > 0) {
            throw new RuntimeException("金额过大");
        }

        // 加款
        accountMapper.add(toId, amount);

        // 如果发生异常，两个操作都会回滚
    }
}

/**
 * 编程式事务 ⭐⭐⭐⭐
 */
@Service
public class ProgrammaticTransactionService {

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void executeInTransaction() {
        transactionTemplate.execute(status -> {
            try {
                // 业务逻辑
                // ...
                return "success";
            } catch (Exception e) {
                // 回滚
                status.setRollbackOnly();
                return "failure";
            }
        });
    }
}
```

## 💡 重点总结

### Spring核心优势 ⭐⭐⭐⭐⭐

1. **IOC** - 降低耦合，便于测试
2. **AOP** - 横切关注点集中管理
3. **事务管理** - 简化事务处理
4. **整合能力** - 整合各种框架

### 最佳实践 ⭐⭐⭐⭐⭐

1. **优先使用注解** - 比XML更简洁
2. **构造器注入** - 更安全，便于测试
3. **小心事务失效** - 同类调用、异常类型
4. **合理使用AOP** - 不要过度使用
5. **注意Bean作用域** - 单例线程不安全

### 常见问题

```java
/**
 * 1. 事务不生效 ⭐⭐⭐⭐⭐
 */
@Service
public class UserService {
    // ❌ 同类方法调用，事务失效
    public void methodA() {
        methodB();  // methodB的事务不会生效
    }

    @Transactional
    public void methodB() {
        // ...
    }

    // ✅ 解决方案：注入自己
    @Autowired
    private UserService self;

    public void methodA2() {
        self.methodB();  // 现在事务会生效
    }
}

/**
 * 2. 循环依赖 ⭐⭐⭐⭐
 */
// ❌ 构造器循环依赖（无法解决）
@Service
public class A {
    private final B b;
    public A(B b) { this.b = b; }
}
@Service
public class B {
    private final A a;
    public B(A a) { this.a = a; }
}

// ✅ 使用字段注入或@Lazy
@Service
public class A {
    @Autowired
    @Lazy
    private B b;
}
```

## 🎯 练习建议

1. 搭建Spring项目，实现IOC
2. 使用AOP实现日志记录
3. 实现声明式事务
4. 自定义切面和注解
5. 理解Bean生命周期

## 📚 下一步

学习完Spring核心后，继续学习 [Spring Boot](./SpringBoot.md)
