# MyBatis持久层框架

## 📌 学习目标

- 理解MyBatis核心概念
- 掌握MyBatis基础配置
- 熟练使用MyBatis注解
- 掌握动态SQL
- 了解MyBatis-Plus

## ⭐ MyBatis核心概念

- **ORM框架** - 对象关系映射 ⭐⭐⭐⭐⭐
- **半自动ORM** - SQL可控 ⭐⭐⭐⭐⭐
- **Mapper映射** - 接口+SQL ⭐⭐⭐⭐⭐
- **动态SQL** - 灵活查询 ⭐⭐⭐⭐⭐

## 1. MyBatis基础配置

### Maven依赖

```xml
<!-- pom.xml -->
<dependencies>
    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.13</version>
    </dependency>

    <!-- MySQL驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>

    <!-- MyBatis-Spring（Spring集成） -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.2</version>
    </dependency>

    <!-- MyBatis-Plus（推荐） ⭐⭐⭐⭐⭐ -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.2</version>
    </dependency>
</dependencies>
```

### MyBatis配置文件

```xml
<!-- mybatis-config.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!-- 设置 -->
    <settings>
        <!-- 下划线转驼峰 ⭐⭐⭐⭐⭐ -->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 日志 -->
        <setting name="logImpl" value="STDOUT_LOGGING"/>
        <!-- 懒加载 -->
        <setting name="lazyLoadingEnabled" value="true"/>
    </settings>

    <!-- 类型别名 ⭐⭐⭐⭐ -->
    <typeAliases>
        <package name="com.example.entity"/>
    </typeAliases>

    <!-- 环境配置 -->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
                <property name="username" value="root"/>
                <property name="password" value="password"/>
            </dataSource>
        </environment>
    </environments>

    <!-- Mapper映射 ⭐⭐⭐⭐⭐ -->
    <mappers>
        <package name="com.example.mapper"/>
    </mappers>
</configuration>
```

## 2. 实体类和Mapper ⭐⭐⭐⭐⭐

### 实体类

```java
/**
 * 用户实体类 ⭐⭐⭐⭐⭐
 */
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private Integer age;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // Getters and Setters
    // 构造方法
    // toString
}
```

### Mapper接口

```java
/**
 * 用户Mapper接口 ⭐⭐⭐⭐⭐
 */
public interface UserMapper {
    // 插入
    int insert(User user);

    // 删除
    int deleteById(Long id);

    // 更新
    int update(User user);

    // 根据ID查询
    User selectById(Long id);

    // 查询所有
    List<User> selectAll();

    // 条件查询
    List<User> selectByCondition(String username, Integer age);
}
```

## 3. XML映射文件 ⭐⭐⭐⭐⭐

```xml
<!-- UserMapper.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <!-- 结果映射 ⭐⭐⭐⭐⭐ -->
    <resultMap id="userResultMap" type="User">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="password" column="password"/>
        <result property="email" column="email"/>
        <result property="age" column="age"/>
        <result property="createTime" column="create_time"/>
        <result property="updateTime" column="update_time"/>
    </resultMap>

    <!-- 插入 ⭐⭐⭐⭐⭐ -->
    <insert id="insert" parameterType="User" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO users (username, password, email, age, create_time)
        VALUES (#{username}, #{password}, #{email}, #{age}, NOW())
    </insert>

    <!-- 批量插入 ⭐⭐⭐⭐ -->
    <insert id="insertBatch">
        INSERT INTO users (username, password, email, age)
        VALUES
        <foreach collection="list" item="user" separator=",">
            (#{user.username}, #{user.password}, #{user.email}, #{user.age})
        </foreach>
    </insert>

    <!-- 删除 ⭐⭐⭐⭐⭐ -->
    <delete id="deleteById">
        DELETE FROM users WHERE id = #{id}
    </delete>

    <!-- 更新 ⭐⭐⭐⭐⭐ -->
    <update id="update">
        UPDATE users
        SET username = #{username},
            email = #{email},
            age = #{age},
            update_time = NOW()
        WHERE id = #{id}
    </update>

    <!-- 查询单个 ⭐⭐⭐⭐⭐ -->
    <select id="selectById" resultMap="userResultMap">
        SELECT * FROM users WHERE id = #{id}
    </select>

    <!-- 查询所有 ⭐⭐⭐⭐⭐ -->
    <select id="selectAll" resultMap="userResultMap">
        SELECT * FROM users ORDER BY create_time DESC
    </select>

    <!-- 条件查询 ⭐⭐⭐⭐⭐ -->
    <select id="selectByCondition" resultMap="userResultMap">
        SELECT * FROM users
        WHERE 1=1
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
    </select>
</mapper>
```

## 4. 注解方式（推荐）⭐⭐⭐⭐⭐

```java
import org.apache.ibatis.annotations.*;

/**
 * 使用注解的Mapper（简单SQL推荐） ⭐⭐⭐⭐⭐
 */
@Mapper
public interface UserMapper {

    // 插入 ⭐⭐⭐⭐⭐
    @Insert("INSERT INTO users(username, password, email, age) " +
            "VALUES(#{username}, #{password}, #{email}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    // 删除 ⭐⭐⭐⭐⭐
    @Delete("DELETE FROM users WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    // 更新 ⭐⭐⭐⭐⭐
    @Update("UPDATE users SET username=#{username}, email=#{email}, " +
            "age=#{age} WHERE id=#{id}")
    int update(User user);

    // 查询单个 ⭐⭐⭐⭐⭐
    @Select("SELECT * FROM users WHERE id = #{id}")
    @Results(id = "userResultMap", value = {
        @Result(property = "id", column = "id", id = true),
        @Result(property = "username", column = "username"),
        @Result(property = "createTime", column = "create_time")
    })
    User selectById(@Param("id") Long id);

    // 查询所有 ⭐⭐⭐⭐⭐
    @Select("SELECT * FROM users ORDER BY create_time DESC")
    @ResultMap("userResultMap")
    List<User> selectAll();

    // 条件查询（复杂SQL建议用XML） ⭐⭐⭐⭐
    @SelectProvider(type = UserSqlProvider.class, method = "selectByCondition")
    List<User> selectByCondition(String username, Integer age);
}

/**
 * SQL提供者类 ⭐⭐⭐⭐
 */
class UserSqlProvider {
    public String selectByCondition(String username, Integer age) {
        return new SQL()
            .SELECT("*")
            .FROM("users")
            .WHERE(username != null, "username LIKE CONCAT('%', #{username}, '%')")
            .WHERE(age != null, "age = #{age}")
            .toString();
    }
}
```

## 5. 动态SQL ⭐⭐⭐⭐⭐

```xml
<!-- 动态SQL示例 -->
<mapper namespace="com.example.mapper.UserMapper">

    <!-- if标签 ⭐⭐⭐⭐⭐ -->
    <select id="selectByCondition" resultMap="userResultMap">
        SELECT * FROM users
        WHERE 1=1
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="age != null">
            AND age = #{age}
        </if>
        <if test="email != null">
            AND email = #{email}
        </if>
    </select>

    <!-- choose-when-otherwise（类似switch） ⭐⭐⭐⭐ -->
    <select id="selectByType" resultMap="userResultMap">
        SELECT * FROM users
        WHERE 1=1
        <choose>
            <when test="type == 1">
                AND age > 18
            </when>
            <when test="type == 2">
                AND age BETWEEN 18 AND 30
            </when>
            <otherwise>
                AND age > 30
            </otherwise>
        </choose>
    </select>

    <!-- where标签（自动处理AND/OR） ⭐⭐⭐⭐⭐ -->
    <select id="selectByWhere" resultMap="userResultMap">
        SELECT * FROM users
        <where>
            <if test="username != null">
                AND username = #{username}
            </if>
            <if test="age != null">
                AND age = #{age}
            </if>
        </where>
    </select>

    <!-- set标签（更新时使用） ⭐⭐⭐⭐⭐ -->
    <update id="updateSelective">
        UPDATE users
        <set>
            <if test="username != null">username = #{username},</if>
            <if test="email != null">email = #{email},</if>
            <if test="age != null">age = #{age},</if>
            update_time = NOW()
        </set>
        WHERE id = #{id}
    </update>

    <!-- foreach标签（IN查询） ⭐⭐⭐⭐⭐ -->
    <select id="selectByIds" resultMap="userResultMap">
        SELECT * FROM users
        WHERE id IN
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </select>

    <!-- trim标签（自定义前缀后缀） ⭐⭐⭐⭐ -->
    <select id="selectByTrim" resultMap="userResultMap">
        SELECT * FROM users
        <trim prefix="WHERE" prefixOverrides="AND |OR ">
            <if test="username != null">
                AND username = #{username}
            </if>
            <if test="age != null">
                AND age = #{age}
            </if>
        </trim>
    </select>
</mapper>
```

## 6. MyBatis-Plus（推荐）⭐⭐⭐⭐⭐

### 6.1 依赖配置 ⭐⭐⭐⭐⭐

```xml
<!-- pom.xml -->
<dependencies>
    <!-- MyBatis-Plus核心 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.5</version>
    </dependency>

    <!-- 代码生成器 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-generator</artifactId>
        <version>3.5.5</version>
    </dependency>

    <!-- 模板引擎（代码生成用） -->
    <dependency>
        <groupId>org.apache.velocity</groupId>
        <artifactId>velocity-engine-core</artifactId>
        <version>2.3</version>
    </dependency>

    <!-- MySQL驱动 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
    </dependency>

    <!-- Druid连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.20</version>
    </dependency>
</dependencies>
```

### 6.2 完整配置 ⭐⭐⭐⭐⭐

```yaml
# application.yml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/mydb?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20
      max-wait: 60000
      test-while-idle: true
      validation-query: SELECT 1

mybatis-plus:
  # Mapper XML文件位置 ⭐⭐⭐⭐⭐
  mapper-locations: classpath*:/mapper/**/*.xml
  # 实体类包路径
  type-aliases-package: com.example.entity

  # 全局配置 ⭐⭐⭐⭐⭐
  global-config:
    # 关闭Banner
    banner: false
    db-config:
      # 主键策略：AUTO(数据库自增) ASSIGN_ID(雪花算法) ASSIGN_UUID(UUID)
      id-type: ASSIGN_ID
      # 表名前缀
      table-prefix: t_
      # 逻辑删除配置
      logic-delete-field: deleted # 全局逻辑删除字段名
      logic-delete-value: 1 # 删除值
      logic-not-delete-value: 0 # 未删除值
      # 字段验证策略
      insert-strategy: NOT_NULL # 插入时忽略NULL值
      update-strategy: NOT_NULL # 更新时忽略NULL值
      select-strategy: NOT_EMPTY # 查询时忽略空值

  # 配置 ⭐⭐⭐⭐⭐
  configuration:
    # 下划线转驼峰
    map-underscore-to-camel-case: true
    # 缓存
    cache-enabled: true
    # 二级缓存
    local-cache-scope: session
    # 懒加载
    lazy-loading-enabled: true
    aggressive-lazy-loading: false
    # 日志（开发环境）
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 生产环境建议关闭日志，使用SLF4J
    # log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

### 6.3 核心配置类 ⭐⭐⭐⭐⭐

```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus配置类 ⭐⭐⭐⭐⭐
 */
@Configuration
public class MybatisPlusConfig {

    /**
     * 插件配置（必备） ⭐⭐⭐⭐⭐
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 多租户插件（如果需要）⭐⭐⭐⭐
        // interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantLineHandler() {
        //     @Override
        //     public Expression getTenantId() {
        //         // 从上下文获取租户ID
        //         return new LongValue(TenantContext.getTenantId());
        //     }
        //     @Override
        //     public String getTenantIdColumn() {
        //         return "tenant_id";
        //     }
        // }));

        // 2. 动态表名插件 ⭐⭐⭐⭐
        // DynamicTableNameInnerInterceptor dynamicTableNameInnerInterceptor =
        //     new DynamicTableNameInnerInterceptor();
        // dynamicTableNameInnerInterceptor.setTableNameHandler((sql, tableName) -> {
        //     // 动态替换表名
        //     return tableName + "_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        // });
        // interceptor.addInnerInterceptor(dynamicTableNameInnerInterceptor);

        // 3. 分页插件（必备）⭐⭐⭐⭐⭐
        PaginationInnerInterceptor paginationInnerInterceptor =
            new PaginationInnerInterceptor(DbType.MYSQL);
        // 设置最大单页限制数量，默认500条，-1不受限制
        paginationInnerInterceptor.setMaxLimit(1000L);
        // 溢出总页数后是否进行处理
        paginationInnerInterceptor.setOverflow(false);
        interceptor.addInnerInterceptor(paginationInnerInterceptor);

        // 4. 乐观锁插件 ⭐⭐⭐⭐⭐
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

        // 5. 防止全表更新与删除插件 ⭐⭐⭐⭐⭐
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

        // 6. SQL性能规范插件（开发环境）⭐⭐⭐⭐
        // IllegalSQLInnerInterceptor illegalSQLInnerInterceptor = new IllegalSQLInnerInterceptor();
        // interceptor.addInnerInterceptor(illegalSQLInnerInterceptor);

        return interceptor;
    }

    /**
     * 自动填充配置 ⭐⭐⭐⭐⭐
     */
    @Bean
    public MetaObjectHandler metaObjectHandler() {
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                // 插入时自动填充
                this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
                this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
                this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());
                this.strictInsertFill(metaObject, "updateBy", Long.class, getCurrentUserId());
                this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                // 更新时自动填充
                this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
                this.strictUpdateFill(metaObject, "updateBy", Long.class, getCurrentUserId());
            }

            private Long getCurrentUserId() {
                // 从Security上下文或ThreadLocal获取当前用户ID
                // return SecurityContextHolder.getContext().getAuthentication().getName();
                return 1L; // 示例
            }
        };
    }
}
```

### 6.4 标准实体类设计 ⭐⭐⭐⭐⭐

```java
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 基础实体类（推荐所有实体继承）⭐⭐⭐⭐⭐
 */
@Data
public abstract class BaseEntity implements Serializable {

    /**
     * 主键ID - 雪花算法 ⭐⭐⭐⭐⭐
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 创建时间 - 自动填充 ⭐⭐⭐⭐⭐
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间 - 自动填充 ⭐⭐⭐⭐⭐
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 创建人ID - 自动填充 ⭐⭐⭐⭐
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    /**
     * 更新人ID - 自动填充 ⭐⭐⭐⭐
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    /**
     * 逻辑删除标记 ⭐⭐⭐⭐⭐
     * 0-未删除 1-已删除
     */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    /**
     * 乐观锁版本号 ⭐⭐⭐⭐⭐
     */
    @Version
    private Integer version;
}

/**
 * 用户实体类 ⭐⭐⭐⭐⭐
 */
@Data
@TableName("t_user")
public class User extends BaseEntity {

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码（存储时应加密）
     */
    private String password;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 年龄
     */
    private Integer age;

    /**
     * 状态：0-禁用 1-启用
     */
    private Integer status;

    /**
     * 租户ID（多租户场景）⭐⭐⭐⭐
     */
    private Long tenantId;

    /**
     * 不参与数据库映射的字段 ⭐⭐⭐⭐
     */
    @TableField(exist = false)
    private String roleName;

    /**
     * 敏感字段不返回给前端 ⭐⭐⭐⭐
     */
    @TableField(select = false)
    private String secretKey;
}
```

### 6.5 Mapper接口 ⭐⭐⭐⭐⭐

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Mapper接口 ⭐⭐⭐⭐⭐
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 自定义SQL - 复杂查询 ⭐⭐⭐⭐⭐
     */
    List<User> selectUserWithRole(@Param("username") String username);

    /**
     * 自定义分页查询 ⭐⭐⭐⭐⭐
     * 注意：第一个参数必须是Page对象
     */
    Page<User> selectPageVo(Page<?> page, @Param("age") Integer age);

    /**
     * 批量插入（高性能）⭐⭐⭐⭐⭐
     */
    int insertBatchSomeColumn(List<User> userList);
}
```

### 6.6 Service层 ⭐⭐⭐⭐⭐

````java
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * Service接口 ⭐⭐⭐⭐⭐
 */
public interface UserService extends IService<User> {
    /**
     * 自定义业务方法
     */
    boolean registerUser(User user);

    /**
     * 根据用户名查询
     */
    User getUserByUsername(String username);
}

/**
 * Service实现类 ⭐⭐⭐⭐⭐
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
    implements UserService {

    @Override
    public boolean registerUser(User user) {
        // 业务逻辑：密码加密、验证等
        // user.setPassword(passwordEncoder.encode(user.getPassword()));
        return this.save(user);
    }

    @Override
    public User getUserByUsername(String username) {
        return this.lambdaQuery()
            .eq(User::getUsername, username)
            .one();
    }
}

### 6.7 完整使用示例 ⭐⭐⭐⭐⭐

```java
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.stereotype.Service;

/**
 * MyBatis-Plus使用示例 ⭐⭐⭐⭐⭐
 */
@Service
public class UserServiceExample {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserService userService;

    // ========== 1. 基础CRUD（Mapper方式）⭐⭐⭐⭐⭐ ==========

    public void basicCRUD() {
        // 插入
        User user = new User();
        user.setUsername("zhangsan");
        user.setEmail("zhang@example.com");
        userMapper.insert(user);  // 自动填充createTime等字段

        // 根据ID查询
        User queryUser = userMapper.selectById(1L);

        // 更新
        user.setAge(26);
        userMapper.updateById(user);  // 自动填充updateTime

        // 删除（逻辑删除）
        userMapper.deleteById(1L);  // 实际执行：UPDATE ... SET deleted=1

        // 批量删除
        userMapper.deleteBatchIds(Arrays.asList(1L, 2L, 3L));

        // 根据条件删除
        userMapper.delete(new LambdaQueryWrapper<User>()
            .eq(User::getUsername, "test"));
    }

    // ========== 2. 条件构造器（QueryWrapper）⭐⭐⭐⭐⭐ ==========

    public void queryWrapper() {
        // 等值查询
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", "zhangsan");
        List<User> users = userMapper.selectList(wrapper);

        // 复杂条件
        QueryWrapper<User> wrapper2 = new QueryWrapper<>();
        wrapper2.like("username", "zhang")    // LIKE '%zhang%'
                .ge("age", 18)                // age >= 18
                .le("age", 30)                // age <= 30
                .isNotNull("email")           // email IS NOT NULL
                .orderByDesc("create_time");  // ORDER BY create_time DESC
        List<User> result = userMapper.selectList(wrapper2);

        // 或条件
        QueryWrapper<User> wrapper3 = new QueryWrapper<>();
        wrapper3.eq("username", "zhangsan")
                .or()
                .eq("email", "zhang@example.com");

        // IN查询
        QueryWrapper<User> wrapper4 = new QueryWrapper<>();
        wrapper4.in("id", Arrays.asList(1, 2, 3, 4, 5));

        // BETWEEN查询
        wrapper4.between("age", 18, 30);

        // 只查询特定字段
        QueryWrapper<User> wrapper5 = new QueryWrapper<>();
        wrapper5.select("id", "username", "email")
                .eq("status", 1);
    }

    // ========== 3. Lambda条件构造器（推荐）⭐⭐⭐⭐⭐ ==========

    public void lambdaQueryWrapper() {
        // Lambda方式（类型安全，推荐）⭐⭐⭐⭐⭐
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, "zhangsan")
               .ge(User::getAge, 18)
               .orderByDesc(User::getCreateTime);
        List<User> users = userMapper.selectList(wrapper);

        // 链式写法（更简洁）
        List<User> result = userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .like(User::getUsername, "zhang")
                .between(User::getAge, 18, 30)
                .orderByDesc(User::getCreateTime)
        );

        // 动态条件（重要）⭐⭐⭐⭐⭐
        String username = "zhang";
        Integer minAge = null;
        List<User> dynamicResult = userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .like(StringUtils.isNotBlank(username), User::getUsername, username)
                .ge(minAge != null, User::getAge, minAge)
        );

        // 只查询部分字段
        List<User> selectFields = userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .select(User::getId, User::getUsername, User::getEmail)
                .eq(User::getStatus, 1)
        );
    }

    // ========== 4. 分页查询 ⭐⭐⭐⭐⭐ ==========

    public Page<User> pageQuery(int pageNum, int pageSize, String keyword) {
        // 创建分页对象
        Page<User> page = new Page<>(pageNum, pageSize);

        // 分页查询
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
               .or()
               .like(StringUtils.isNotBlank(keyword), User::getEmail, keyword)
               .orderByDesc(User::getCreateTime);

        Page<User> result = userMapper.selectPage(page, wrapper);

        // 获取结果
        List<User> records = result.getRecords();  // 数据列表
        long total = result.getTotal();            // 总记录数
        long pages = result.getPages();            // 总页数
        long current = result.getCurrent();        // 当前页码

        return result;
    }

    // ========== 5. 批量操作（IService）⭐⭐⭐⭐⭐ ==========

    public void batchOperations() {
        // 批量插入（推荐，性能好）
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            User user = new User();
            user.setUsername("user" + i);
            user.setEmail("user" + i + "@example.com");
            users.add(user);
        }
        // 批量插入，默认每批500条
        userService.saveBatch(users);
        // 指定批次大小
        userService.saveBatch(users, 100);

        // 批量更新
        userService.updateBatchById(users);

        // 保存或更新（根据ID判断）⭐⭐⭐⭐⭐
        User user = new User();
        user.setId(1L);
        user.setUsername("updated");
        userService.saveOrUpdate(user);  // ID存在就更新，不存在就插入

        // 批量保存或更新
        userService.saveOrUpdateBatch(users);
    }

    // ========== 6. 链式操作（Service）⭐⭐⭐⭐⭐ ==========

    public void chainOperations() {
        // 链式查询
        List<User> list = userService.lambdaQuery()
            .eq(User::getAge, 25)
            .like(User::getUsername, "zhang")
            .orderByDesc(User::getCreateTime)
            .list();

        // 链式查询单个
        User one = userService.lambdaQuery()
            .eq(User::getUsername, "zhangsan")
            .one();

        // 链式查询数量
        Long count = userService.lambdaQuery()
            .ge(User::getAge, 18)
            .count();

        // 链式更新 ⭐⭐⭐⭐⭐
        boolean success = userService.lambdaUpdate()
            .set(User::getAge, 26)
            .set(User::getStatus, 1)
            .eq(User::getId, 1L)
            .update();

        // 链式删除
        boolean removed = userService.lambdaUpdate()
            .eq(User::getUsername, "test")
            .remove();
    }

    // ========== 7. 复杂查询 ⭐⭐⭐⭐⭐ ==========

    public List<User> complexQuery(String keyword, Integer minAge, Integer maxAge) {
        return userMapper.selectList(
            new LambdaQueryWrapper<User>()
                // 嵌套条件：(username LIKE ? OR email LIKE ?)
                .and(StringUtils.isNotBlank(keyword), wrapper ->
                    wrapper.like(User::getUsername, keyword)
                           .or()
                           .like(User::getEmail, keyword)
                )
                // AND age BETWEEN ? AND ?
                .between(minAge != null && maxAge != null,
                         User::getAge, minAge, maxAge)
                // AND status = 1
                .eq(User::getStatus, 1)
                // ORDER BY create_time DESC
                .orderByDesc(User::getCreateTime)
                // LIMIT 100
                .last("LIMIT 100")
        );
    }

    // ========== 8. 乐观锁使用 ⭐⭐⭐⭐⭐ ==========

    public boolean updateWithOptimisticLock(Long id) {
        // 先查询（获取version）
        User user = userMapper.selectById(id);

        // 修改
        user.setAge(user.getAge() + 1);

        // 更新（自动带上version条件）
        // UPDATE ... SET age=?, version=version+1 WHERE id=? AND version=?
        int rows = userMapper.updateById(user);

        return rows > 0;  // 返回false说明version冲突
    }

    // ========== 9. 聚合查询 ⭐⭐⭐⭐ ==========

    public Map<String, Object> aggregateQuery() {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.select("COUNT(*) as total",
                      "AVG(age) as avgAge",
                      "MAX(age) as maxAge",
                      "MIN(age) as minAge")
               .eq("status", 1);

        return userMapper.selectMaps(wrapper).get(0);
    }

    // ========== 10. 分组查询 ⭐⭐⭐⭐ ==========

    public List<Map<String, Object>> groupQuery() {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.select("age", "COUNT(*) as count")
               .groupBy("age")
               .having("COUNT(*) > 1")
               .orderByDesc("count");

        return userMapper.selectMaps(wrapper);
    }
}
````

### 6.8 代码生成器 ⭐⭐⭐⭐⭐

```java
import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.config.rules.DateType;
import com.baomidou.mybatisplus.generator.engine.VelocityTemplateEngine;
import java.util.Collections;

/**
 * 代码生成器（一键生成Entity、Mapper、Service、Controller）⭐⭐⭐⭐⭐
 */
public class CodeGenerator {

    public static void main(String[] args) {
        // 数据库配置
        String url = "jdbc:mysql://localhost:3306/mydb?serverTimezone=Asia/Shanghai";
        String username = "root";
        String password = "root";

        // 代码生成路径
        String projectPath = System.getProperty("user.dir");
        String outputDir = projectPath + "/src/main/java";
        String mapperXmlPath = projectPath + "/src/main/resources/mapper";

        FastAutoGenerator.create(url, username, password)
            // 全局配置
            .globalConfig(builder -> {
                builder.author("Your Name")              // 作者
                       .outputDir(outputDir)             // 输出目录
                       .commentDate("yyyy-MM-dd")        // 注释日期格式
                       .dateType(DateType.TIME_PACK)     // 使用java.time包
                       .disableOpenDir()                 // 禁止打开输出目录
                       .enableSwagger();                 // 启用Swagger注解
            })

            // 包配置
            .packageConfig(builder -> {
                builder.parent("com.example")             // 父包名
                       .entity("entity")                  // 实体类包名
                       .mapper("mapper")                  // Mapper接口包名
                       .service("service")                // Service接口包名
                       .serviceImpl("service.impl")       // Service实现类包名
                       .controller("controller")          // Controller包名
                       .pathInfo(Collections.singletonMap(
                           OutputFile.xml, mapperXmlPath  // Mapper XML路径
                       ));
            })

            // 策略配置
            .strategyConfig(builder -> {
                builder.addInclude("t_user", "t_role", "t_permission")  // 需要生成的表
                       .addTablePrefix("t_", "c_")                      // 表前缀（生成时去掉）

                       // Entity策略
                       .entityBuilder()
                       .enableLombok()                    // 启用Lombok
                       .enableTableFieldAnnotation()      // 启用字段注解
                       .logicDeleteColumnName("deleted")  // 逻辑删除字段
                       .versionColumnName("version")      // 乐观锁字段
                       .addSuperEntityColumns("id", "create_time", "update_time",
                                             "create_by", "update_by", "deleted", "version")
                       .superClass("com.example.entity.BaseEntity")  // 继承基类

                       // Mapper策略
                       .mapperBuilder()
                       .enableMapperAnnotation()          // 启用@Mapper注解
                       .enableBaseResultMap()             // 启用BaseResultMap
                       .enableBaseColumnList()            // 启用BaseColumnList

                       // Service策略
                       .serviceBuilder()
                       .formatServiceFileName("%sService")           // Service接口名格式
                       .formatServiceImplFileName("%sServiceImpl")   // Service实现类名格式

                       // Controller策略
                       .controllerBuilder()
                       .enableRestStyle()                 // 启用REST风格
                       .enableHyphenStyle();              // 启用驼峰转连字符
            })

            // 模板引擎配置
            .templateEngine(new VelocityTemplateEngine())

            // 执行生成
            .execute();

        System.out.println("代码生成完成！");
    }
}
```

### 6.9 XML映射文件（自定义复杂SQL）⭐⭐⭐⭐⭐

```xml
<!-- UserMapper.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <!-- 自定义复杂查询 ⭐⭐⭐⭐⭐ -->
    <select id="selectUserWithRole" resultType="com.example.entity.User">
        SELECT
            u.*,
            r.role_name
        FROM t_user u
        LEFT JOIN t_user_role ur ON u.id = ur.user_id
        LEFT JOIN t_role r ON ur.role_id = r.id
        WHERE u.deleted = 0
        <if test="username != null and username != ''">
            AND u.username LIKE CONCAT('%', #{username}, '%')
        </if>
    </select>

    <!-- 自定义分页查询 ⭐⭐⭐⭐⭐ -->
    <select id="selectPageVo" resultType="com.example.entity.User">
        SELECT * FROM t_user
        WHERE deleted = 0
        <if test="age != null">
            AND age >= #{age}
        </if>
        ORDER BY create_time DESC
    </select>

    <!-- 批量插入（高性能）⭐⭐⭐⭐⭐ -->
    <insert id="insertBatchSomeColumn">
        INSERT INTO t_user (username, email, age, create_time, update_time)
        VALUES
        <foreach collection="list" item="item" separator=",">
            (#{item.username}, #{item.email}, #{item.age}, NOW(), NOW())
        </foreach>
    </insert>

    <!-- 复杂更新 ⭐⭐⭐⭐ -->
    <update id="updateUserStatus">
        UPDATE t_user
        SET status = #{status},
            update_time = NOW()
        WHERE id IN
        <foreach collection="ids" item="id" open="(" close=")" separator=",">
            #{id}
        </foreach>
    </update>
</mapper>
```

### 6.10 性能优化建议 ⭐⭐⭐⭐⭐

```java
/**
 * 性能优化最佳实践 ⭐⭐⭐⭐⭐
 */
@Service
public class PerformanceOptimization {

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    // ========== 1. 只查询需要的字段 ⭐⭐⭐⭐⭐ ==========
    public List<User> selectSpecificFields() {
        // ❌ 不推荐：查询所有字段
        // List<User> users = userMapper.selectList(null);

        // ✅ 推荐：只查询需要的字段
        return userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .select(User::getId, User::getUsername, User::getEmail)
                .eq(User::getStatus, 1)
        );
    }

    // ========== 2. 批量操作代替循环 ⭐⭐⭐⭐⭐ ==========
    public void batchInsert(List<User> users) {
        // ❌ 不推荐：循环插入
        // for (User user : users) {
        //     userMapper.insert(user);
        // }

        // ✅ 推荐：批量插入
        userService.saveBatch(users, 500);  // 每批500条
    }

    // ========== 3. 分页查询避免深分页 ⭐⭐⭐⭐⭐ ==========
    public Page<User> optimizedPageQuery(Long lastId, int pageSize) {
        // ❌ 不推荐：OFFSET分页（深分页慢）
        // Page<User> page = new Page<>(10000, 20);  // 第10000页

        // ✅ 推荐：使用ID游标分页
        Page<User> page = new Page<>(1, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (lastId != null) {
            wrapper.gt(User::getId, lastId);  // WHERE id > lastId
        }
        wrapper.orderByAsc(User::getId)
               .last("LIMIT " + pageSize);

        return userMapper.selectPage(page, wrapper);
    }

    // ========== 4. 避免N+1查询 ⭐⭐⭐⭐⭐ ==========
    public List<UserVO> avoidNPlusOne() {
        // ❌ 不推荐：N+1查询
        // List<User> users = userMapper.selectList(null);
        // for (User user : users) {
        //     user.setRoles(roleMapper.selectByUserId(user.getId()));  // N次查询
        // }

        // ✅ 推荐：一次性JOIN查询或使用自定义SQL
        return userMapper.selectUserWithRole(null);
    }

    // ========== 5. 使用count优化 ⭐⭐⭐⭐⭐ ==========
    public long optimizedCount() {
        // ❌ 不推荐：查询所有数据再count
        // List<User> users = userMapper.selectList(wrapper);
        // return users.size();

        // ✅ 推荐：直接count
        return userService.lambdaQuery()
            .eq(User::getStatus, 1)
            .count();
    }

    // ========== 6. 流式查询（大数据量）⭐⭐⭐⭐ ==========
    @Transactional(readOnly = true)
    public void streamQuery() {
        // 流式查询，不会一次性加载所有数据到内存
        userMapper.selectList(
            new LambdaQueryWrapper<User>()
                .eq(User::getStatus, 1)
        ).stream().forEach(user -> {
            // 处理每条数据
            System.out.println(user.getUsername());
        });
    }
}
```

## 💡 MyBatis-Plus 最佳实践方案 ⭐⭐⭐⭐⭐

### 1. 项目结构规范 ⭐⭐⭐⭐⭐

```
com.example
├── config                # 配置类
│   ├── MybatisPlusConfig.java
│   └── DataSourceConfig.java
├── entity                # 实体类
│   ├── BaseEntity.java   # 基础实体（所有实体继承）
│   ├── User.java
│   └── ...
├── mapper                # Mapper接口
│   ├── UserMapper.java
│   └── ...
├── service               # Service层
│   ├── UserService.java
│   └── impl
│       └── UserServiceImpl.java
├── controller            # 控制器
│   └── UserController.java
└── vo/dto                # 视图对象/数据传输对象
```

### 2. 核心配置清单 ⭐⭐⭐⭐⭐

#### ✅ 必备配置

1. **分页插件** - 必须配置 ⭐⭐⭐⭐⭐
2. **乐观锁插件** - 并发场景必须 ⭐⭐⭐⭐⭐
3. **逻辑删除** - 推荐配置 ⭐⭐⭐⭐⭐
4. **自动填充** - 推荐配置 ⭐⭐⭐⭐⭐
5. **防止全表更新删除** - 安全必备 ⭐⭐⭐⭐⭐

#### 🔧 可选配置

- **多租户插件** - SaaS系统需要 ⭐⭐⭐⭐
- **动态表名插件** - 分表场景需要 ⭐⭐⭐⭐
- **SQL性能规范插件** - 开发环境建议 ⭐⭐⭐

### 3. 开发规范 ⭐⭐⭐⭐⭐

#### 实体类规范

```java
// ✅ 推荐写法
@Data
@TableName("t_user")
public class User extends BaseEntity {
    // 业务字段
    private String username;
    private String email;

    // 不映射到数据库的字段
    @TableField(exist = false)
    private String roleName;

    // 敏感字段不返回
    @TableField(select = false)
    private String password;
}

// ❌ 不推荐：所有字段都写在一个类里，没有继承BaseEntity
```

#### 查询规范

```java
// ✅ 推荐：使用Lambda（类型安全）
List<User> users = userMapper.selectList(
    new LambdaQueryWrapper<User>()
        .eq(User::getStatus, 1)
        .like(User::getUsername, keyword)
);

// ❌ 不推荐：使用字符串（容易拼错）
List<User> users = userMapper.selectList(
    new QueryWrapper<User>()
        .eq("status", 1)  // 容易拼错字段名
        .like("user_name", keyword)  // 字段名错误
);
```

#### 动态条件规范

```java
// ✅ 推荐：在wrapper中判断
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
       .ge(minAge != null, User::getAge, minAge)
       .le(maxAge != null, User::getAge, maxAge);

// ❌ 不推荐：在wrapper外判断
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    if (StringUtils.isNotBlank(keyword)) {
    wrapper.like(User::getUsername, keyword);
}
if (minAge != null) {
    wrapper.ge(User::getAge, minAge);
}
```

### 4. 性能优化清单 ⭐⭐⭐⭐⭐

| 优化项           | 说明                | 重要性     |
| ---------------- | ------------------- | ---------- |
| 只查询需要的字段 | 使用`.select()`     | ⭐⭐⭐⭐⭐ |
| 批量操作         | 使用`saveBatch()`   | ⭐⭐⭐⭐⭐ |
| 避免深分页       | 使用游标分页        | ⭐⭐⭐⭐⭐ |
| 避免N+1查询      | 使用JOIN或自定义SQL | ⭐⭐⭐⭐⭐ |
| 添加索引         | 查询条件字段建索引  | ⭐⭐⭐⭐⭐ |
| 使用缓存         | Redis缓存热点数据   | ⭐⭐⭐⭐   |
| 读写分离         | 主从架构，读从库    | ⭐⭐⭐⭐   |

### 5. 常见场景最佳方案 ⭐⭐⭐⭐⭐

#### 场景1：分页查询 ⭐⭐⭐⭐⭐

```java
@GetMapping("/page")
public Page<User> getUserPage(
    @RequestParam(defaultValue = "1") int current,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(required = false) String keyword) {

    return userService.lambdaQuery()
        .like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
               .or()
        .like(StringUtils.isNotBlank(keyword), User::getEmail, keyword)
        .orderByDesc(User::getCreateTime)
        .page(new Page<>(current, size));
}
```

#### 场景2：批量操作 ⭐⭐⭐⭐⭐

```java
@PostMapping("/batch")
@Transactional
public boolean batchInsert(@RequestBody List<User> users) {
    // 批量插入，每批500条
    return userService.saveBatch(users, 500);
}
```

#### 场景3：更新部分字段 ⭐⭐⭐⭐⭐

```java
@PutMapping("/status")
public boolean updateStatus(@RequestParam Long id, @RequestParam Integer status) {
    return userService.lambdaUpdate()
        .set(User::getStatus, status)
        .set(User::getUpdateTime, LocalDateTime.now())
        .eq(User::getId, id)
        .update();
}
```

#### 场景4：复杂条件查询 ⭐⭐⭐⭐⭐

```java
public List<User> complexQuery(UserQueryDTO dto) {
    return userService.lambdaQuery()
        // 嵌套条件
        .and(StringUtils.isNotBlank(dto.getKeyword()), wrapper ->
            wrapper.like(User::getUsername, dto.getKeyword())
                   .or()
                   .like(User::getEmail, dto.getKeyword())
        )
        // 范围查询
        .between(dto.getMinAge() != null && dto.getMaxAge() != null,
                 User::getAge, dto.getMinAge(), dto.getMaxAge())
        // 状态筛选
        .in(CollectionUtils.isNotEmpty(dto.getStatuses()),
            User::getStatus, dto.getStatuses())
        // 排序
        .orderByDesc(User::getCreateTime)
        .list();
}
```

#### 场景5：并发更新（乐观锁）⭐⭐⭐⭐⭐

```java
@PutMapping("/update")
@Transactional
public boolean updateWithLock(@RequestBody User user) {
    // 先查询获取version
    User existUser = userService.getById(user.getId());
    if (existUser == null) {
        throw new BusinessException("用户不存在");
    }

    // 更新，MyBatis-Plus自动处理version
    existUser.setUsername(user.getUsername());
    existUser.setEmail(user.getEmail());

    boolean success = userService.updateById(existUser);
    if (!success) {
        throw new BusinessException("数据已被修改，请刷新后重试");
    }
    return true;
}
```

### 6. MyBatis vs MyBatis-Plus 对比 ⭐⭐⭐⭐⭐

| 特性       | MyBatis          | MyBatis-Plus                  |
| ---------- | ---------------- | ----------------------------- |
| CRUD       | 需要手写SQL      | 自动生成 ⭐⭐⭐⭐⭐           |
| 分页       | 需要插件+手写SQL | 内置支持，一行代码 ⭐⭐⭐⭐⭐ |
| 条件构造   | XML动态SQL       | LambdaQueryWrapper ⭐⭐⭐⭐⭐ |
| 批量操作   | 手写foreach      | saveBatch() ⭐⭐⭐⭐⭐        |
| 逻辑删除   | 手动实现         | 注解配置 ⭐⭐⭐⭐⭐           |
| 乐观锁     | 手动实现         | 注解+插件 ⭐⭐⭐⭐⭐          |
| 自动填充   | 拦截器实现       | MetaObjectHandler ⭐⭐⭐⭐⭐  |
| 代码生成   | 需要第三方工具   | 内置代码生成器 ⭐⭐⭐⭐⭐     |
| 学习曲线   | 较陡             | 简单 ⭐⭐⭐⭐⭐               |
| 开发效率   | 中等             | 高 ⭐⭐⭐⭐⭐                 |
| **推荐度** | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐ **强烈推荐**       |

### 7. 核心总结 ⭐⭐⭐⭐⭐

#### ✅ 推荐做法

1. **实体类统一继承BaseEntity** - 包含id、时间、删除标记等公共字段
2. **使用Lambda条件构造器** - 类型安全，避免字段名拼错
3. **配置逻辑删除** - 数据安全，可恢复
4. **配置自动填充** - createTime、updateTime自动填充
5. **简单CRUD用MP，复杂SQL用XML** - 各取所长
6. **分页查询必加索引** - 避免全表扫描
7. **批量操作用saveBatch** - 性能远超循环插入
8. **使用代码生成器** - 快速生成基础代码

#### ❌ 避免做法

1. ❌ 循环调用insert/update - 性能差
2. ❌ 使用`selectList(null)`查询全表 - 内存溢出风险
3. ❌ 深分页（如第10000页）- 性能差
4. ❌ 查询所有字段但只用几个 - 浪费资源
5. ❌ 不加where条件直接update/delete - 危险
6. ❌ N+1查询 - 性能杀手
7. ❌ 不使用逻辑删除，直接物理删除 - 数据不可恢复

### 8. 快速上手模板 ⭐⭐⭐⭐⭐

```java
// 1. 分页查询模板
public Page<User> pageQuery(int current, int size, String keyword) {
    return userService.lambdaQuery()
        .like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
        .orderByDesc(User::getCreateTime)
        .page(new Page<>(current, size));
}

// 2. 批量插入模板
public boolean batchSave(List<User> users) {
    return userService.saveBatch(users, 500);
}

// 3. 更新字段模板
public boolean updateField(Long id, String field, Object value) {
    return userService.lambdaUpdate()
        .set(User::getStatus, value)  // 修改为实际字段
        .eq(User::getId, id)
        .update();
}

// 4. 条件删除模板
public boolean deleteByCondition(Long id) {
    return userService.lambdaUpdate()
        .eq(User::getId, id)
        .remove();  // 逻辑删除
}

// 5. 复杂查询模板
public List<User> complexQuery(String keyword, Integer status) {
    return userService.lambdaQuery()
        .like(StringUtils.isNotBlank(keyword), User::getUsername, keyword)
        .eq(status != null, User::getStatus, status)
        .orderByDesc(User::getCreateTime)
        .list();
}
```

## 🎯 练习建议

### 入门练习 ⭐⭐⭐

1. ✅ 搭建MyBatis-Plus环境（Spring Boot + MyBatis-Plus）
2. ✅ 创建BaseEntity基类和User实体类
3. ✅ 实现基础CRUD操作（增删改查）
4. ✅ 配置逻辑删除和自动填充
5. ✅ 实现分页查询功能

### 进阶练习 ⭐⭐⭐⭐

1. ✅ 使用Lambda条件构造器实现动态查询
2. ✅ 实现批量插入和批量更新
3. ✅ 配置乐观锁并测试并发场景
4. ✅ 使用代码生成器生成完整代码
5. ✅ 编写自定义SQL实现复杂查询（JOIN）

### 高级练习 ⭐⭐⭐⭐⭐

1. ✅ 性能优化：只查询需要的字段
2. ✅ 实现游标分页避免深分页问题
3. ✅ 配置多租户插件（可选）
4. ✅ 配置动态表名插件实现分表（可选）
5. ✅ 编写完整的用户管理模块（含Controller、Service、Mapper）

### 实战项目建议

- 🎯 **博客系统** - 用户、文章、评论（一对多、多对多关系）
- 🎯 **电商系统** - 商品、订单、用户（复杂查询、分页、统计）
- 🎯 **权限管理系统** - RBAC权限模型（多表关联）

## 📚 参考资源

- 📖 [MyBatis-Plus官方文档](https://baomidou.com/)
- 📖 [MyBatis官方文档](https://mybatis.org/mybatis-3/zh/index.html)
- 💻 [MyBatis-Plus代码示例](https://gitee.com/baomidou/mybatis-plus-samples)

## 📚 下一步

完成数据库部分学习后，继续学习 [Spring生态](../04-Spring生态/)
