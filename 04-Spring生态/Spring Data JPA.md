# Spring Data JPA

## 📌 学习目标

- 理解JPA和Hibernate
- 掌握实体映射
- 熟练使用Repository
- 掌握JPQL和原生SQL
- 了解性能优化

## ⭐ 核心内容

- **实体映射** ⭐⭐⭐⭐⭐
- **Repository** ⭐⭐⭐⭐⭐
- **查询方法** ⭐⭐⭐⭐⭐
- **关联关系** ⭐⭐⭐⭐⭐
- **事务管理** ⭐⭐⭐⭐⭐

## 1. JPA简介 ⭐⭐⭐⭐⭐

### JPA vs MyBatis

| 特性 | JPA | MyBatis |
|------|-----|---------|
| 类型 | ORM框架 | SQL映射框架 |
| SQL | 自动生成 ⭐⭐⭐⭐⭐ | 手动编写 |
| 学习曲线 | 较陡 | 简单 ⭐⭐⭐⭐⭐ |
| 灵活性 | 较低 | 高 ⭐⭐⭐⭐⭐ |
| 适用场景 | CRUD为主 | 复杂查询 |

### Maven依赖

```xml
<dependencies>
    <!-- Spring Data JPA ⭐⭐⭐⭐⭐ -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL驱动 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
</dependencies>
```

### 配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useUnicode=true&characterEncoding=utf8
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # create/update/validate/none
    show-sql: true  # 显示SQL
    properties:
      hibernate:
        format_sql: true  # 格式化SQL
        dialect: org.hibernate.dialect.MySQL8Dialect
```

## 2. 实体映射 ⭐⭐⭐⭐⭐

### 基础实体 ⭐⭐⭐⭐⭐

```java
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity  // 标记为实体类 ⭐⭐⭐⭐⭐
@Table(name = "users")  // 指定表名
@Data
public class User {
    
    @Id  // 主键 ⭐⭐⭐⭐⭐
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 自增
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(length = 100)
    private String email;
    
    private Integer age;
    
    @Enumerated(EnumType.STRING)  // 枚举类型
    private UserStatus status;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist  // 插入前执行
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate  // 更新前执行
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum UserStatus {
    ACTIVE, INACTIVE, BANNED
}
```

### 主键策略 ⭐⭐⭐⭐⭐

```java
// 1. 自增（推荐）⭐⭐⭐⭐⭐
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// 2. UUID
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private String id;

// 3. 序列（Oracle）
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(name = "user_seq", sequenceName = "user_sequence")
private Long id;

// 4. 自定义
@Id
@GeneratedValue(generator = "custom-id")
@GenericGenerator(name = "custom-id", strategy = "com.example.CustomIdGenerator")
private String id;
```

## 3. Repository ⭐⭐⭐⭐⭐

### 基础Repository ⭐⭐⭐⭐⭐

```java
import org.springframework.data.jpa.repository.JpaRepository;

// JpaRepository<实体类, 主键类型>
public interface UserRepository extends JpaRepository<User, Long> {
    // 继承了常用方法：
    // save(entity)
    // findById(id)
    // findAll()
    // deleteById(id)
    // count()
    // existsById(id)
}

// 使用
@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public User save(User user) {
        return userRepository.save(user);  // 保存或更新
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }
}
```

### 查询方法命名 ⭐⭐⭐⭐⭐

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 根据用户名查询 ⭐⭐⭐⭐⭐
    User findByUsername(String username);
    
    // 根据邮箱查询
    Optional<User> findByEmail(String email);
    
    // 根据年龄查询
    List<User> findByAge(Integer age);
    List<User> findByAgeGreaterThan(Integer age);
    List<User> findByAgeLessThan(Integer age);
    List<User> findByAgeBetween(Integer start, Integer end);
    
    // 根据用户名和邮箱查询
    User findByUsernameAndEmail(String username, String email);
    
    // 根据用户名或邮箱查询
    List<User> findByUsernameOrEmail(String username, String email);
    
    // 模糊查询 ⭐⭐⭐⭐⭐
    List<User> findByUsernameLike(String username);
    List<User> findByUsernameContaining(String keyword);
    List<User> findByUsernameStartingWith(String prefix);
    List<User> findByUsernameEndingWith(String suffix);
    
    // 排序
    List<User> findByAgeOrderByUsernameAsc(Integer age);
    List<User> findByAgeOrderByUsernameDesc(Integer age);
    
    // 分页
    Page<User> findByAge(Integer age, Pageable pageable);
    
    // 统计
    long countByAge(Integer age);
    
    // 存在性检查
    boolean existsByUsername(String username);
    
    // 删除
    void deleteByUsername(String username);
}
```

### @Query注解 ⭐⭐⭐⭐⭐

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // JPQL查询 ⭐⭐⭐⭐⭐
    @Query("SELECT u FROM User u WHERE u.username = ?1")
    User findByUsernameJPQL(String username);
    
    // 命名参数 ⭐⭐⭐⭐⭐
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.age = :age")
    User findByUsernameAndAge(@Param("username") String username, 
                             @Param("age") Integer age);
    
    // 原生SQL ⭐⭐⭐⭐⭐
    @Query(value = "SELECT * FROM users WHERE username = ?1", nativeQuery = true)
    User findByUsernameNative(String username);
    
    // 更新操作 ⭐⭐⭐⭐⭐
    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") UserStatus status);
    
    // 删除操作
    @Modifying
    @Query("DELETE FROM User u WHERE u.age < :age")
    int deleteByAgeLessThan(@Param("age") Integer age);
    
    // 投影查询（只查询部分字段）⭐⭐⭐⭐
    @Query("SELECT u.username, u.email FROM User u WHERE u.id = :id")
    Object[] findUsernameAndEmailById(@Param("id") Long id);
    
    // 使用DTO接收
    @Query("SELECT new com.example.dto.UserDTO(u.username, u.email) FROM User u")
    List<UserDTO> findAllUserDTO();
}
```

## 4. 关联关系 ⭐⭐⭐⭐⭐

### 一对多 ⭐⭐⭐⭐⭐

```java
// 用户（一）
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    // 一对多：一个用户有多个订单 ⭐⭐⭐⭐⭐
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
    
    // 添加订单
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }
}

// 订单（多）
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String orderNo;
    
    // 多对一：多个订单属于一个用户 ⭐⭐⭐⭐⭐
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

### 多对多 ⭐⭐⭐⭐⭐

```java
// 学生
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    // 多对多：学生和课程 ⭐⭐⭐⭐⭐
    @ManyToMany
    @JoinTable(
        name = "student_course",  // 中间表名
        joinColumns = @JoinColumn(name = "student_id"),  // 当前实体外键
        inverseJoinColumns = @JoinColumn(name = "course_id")  // 关联实体外键
    )
    private Set<Course> courses = new HashSet<>();
}

// 课程
@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}
```

### 一对一 ⭐⭐⭐⭐

```java
// 用户
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    // 一对一：用户和用户详情 ⭐⭐⭐⭐
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

// 用户详情
@Entity
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String address;
    private String phone;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

## 5. 分页和排序 ⭐⭐⭐⭐⭐

```java
@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    // 分页查询 ⭐⭐⭐⭐⭐
    public Page<User> findUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }
    
    // 分页 + 排序 ⭐⭐⭐⭐⭐
    public Page<User> findUsersWithSort(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, 
            Sort.by("username").ascending()
                .and(Sort.by("age").descending())
        );
        return userRepository.findAll(pageable);
    }
    
    // 使用
    public void example() {
        Page<User> userPage = findUsers(0, 10);  // 第1页，每页10条
        
        List<User> users = userPage.getContent();  // 数据
        long total = userPage.getTotalElements();  // 总记录数
        int totalPages = userPage.getTotalPages();  // 总页数
        boolean hasNext = userPage.hasNext();  // 是否有下一页
    }
}
```

## 6. 事务管理 ⭐⭐⭐⭐⭐

```java
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    
    // 事务注解 ⭐⭐⭐⭐⭐
    @Transactional
    public void createUserWithOrder(User user, Order order) {
        userRepository.save(user);
        order.setUser(user);
        orderRepository.save(order);
        // 如果抛出异常，两个操作都会回滚
    }
    
    // 只读事务（性能优化）⭐⭐⭐⭐⭐
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    // 指定回滚异常
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user) {
        userRepository.save(user);
    }
}
```

## 7. 性能优化 ⭐⭐⭐⭐⭐

### 懒加载 vs 急加载 ⭐⭐⭐⭐⭐

```java
// 懒加载（默认，推荐）⭐⭐⭐⭐⭐
@ManyToOne(fetch = FetchType.LAZY)
private User user;

// 急加载（立即加载）
@ManyToOne(fetch = FetchType.EAGER)
private User user;

// 解决N+1问题：使用JOIN FETCH ⭐⭐⭐⭐⭐
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :id")
User findByIdWithOrders(@Param("id") Long id);
```

### 批量操作 ⭐⭐⭐⭐⭐

```java
// 批量保存
@Transactional
public void batchSave(List<User> users) {
    userRepository.saveAll(users);
}

// 批量删除
@Transactional
public void batchDelete(List<Long> ids) {
    userRepository.deleteAllById(ids);
}
```

### 缓存 ⭐⭐⭐⭐

```java
@Entity
@Cacheable  // 启用二级缓存
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class User {
    // ...
}
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 使用DTO避免循环引用

```java
// DTO
public class UserDTO {
    private Long id;
    private String username;
    private List<OrderDTO> orders;
}

// 转换
public UserDTO toDTO(User user) {
    UserDTO dto = new UserDTO();
    dto.setId(user.getId());
    dto.setUsername(user.getUsername());
    dto.setOrders(user.getOrders().stream()
        .map(this::toOrderDTO)
        .collect(Collectors.toList()));
    return dto;
}
```

### 2. 合理使用级联操作

```java
// 谨慎使用CascadeType.ALL
@OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
private List<Order> orders;
```

### 3. 索引优化

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email")
})
public class User {
    // ...
}
```

## 🎯 实战练习

1. 实现用户-角色-权限的多对多关系
2. 实现分页查询接口
3. 优化N+1查询问题
4. 实现软删除功能

## 📚 下一步

学习完Spring Data JPA后，继续学习：
- [MyBatis](../03-数据库/MyBatis.md)
- [Redis](../03-数据库/Redis.md)

