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

### 基础使用

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.annotation.*;
import org.apache.ibatis.annotations.Mapper;

/**
 * 实体类（MyBatis-Plus注解） ⭐⭐⭐⭐⭐
 */
@TableName("users")  // 表名
public class User {
    @TableId(type = IdType.AUTO)  // 主键自增
    private Long id;

    private String username;

    private String password;

    private String email;

    private Integer age;

    @TableField(fill = FieldFill.INSERT)  // 插入时自动填充
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)  // 插入和更新时填充
    private LocalDateTime updateTime;

    @TableLogic  // 逻辑删除
    private Integer deleted;

    @Version  // 乐观锁
    private Integer version;

    // Getters and Setters
}

/**
 * Mapper接口（继承BaseMapper） ⭐⭐⭐⭐⭐
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 无需写任何代码，已有基础CRUD方法！
    // - insert(entity)
    // - deleteById(id)
    // - updateById(entity)
    // - selectById(id)
    // - selectList(wrapper)
    // 等等...
}

/**
 * Service接口 ⭐⭐⭐⭐⭐
 */
public interface UserService extends IService<User> {
    // 继承IService，获得更多方法
}

/**
 * Service实现类 ⭐⭐⭐⭐⭐
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
    implements UserService {
    // 直接继承ServiceImpl，无需实现基础方法
}
```

### MyBatis-Plus使用示例

```java
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * MyBatis-Plus使用示例 ⭐⭐⭐⭐⭐
 */
@Service
public class UserServiceExample {
    @Autowired
    private UserMapper userMapper;

    /**
     * 基础CRUD ⭐⭐⭐⭐⭐
     */
    public void basicCRUD() {
        // 插入
        User user = new User();
        user.setUsername("zhangsan");
        user.setEmail("zhang@example.com");
        userMapper.insert(user);

        // 根据ID查询
        User queryUser = userMapper.selectById(1L);

        // 更新
        user.setAge(26);
        userMapper.updateById(user);

        // 删除
        userMapper.deleteById(1L);

        // 批量删除
        userMapper.deleteBatchIds(Arrays.asList(1L, 2L, 3L));
    }

    /**
     * 条件构造器（QueryWrapper） ⭐⭐⭐⭐⭐
     */
    public void queryWrapper() {
        // 查询username='zhangsan'的用户
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", "zhangsan");
        List<User> users = userMapper.selectList(wrapper);

        // 复杂条件
        QueryWrapper<User> wrapper2 = new QueryWrapper<>();
        wrapper2.like("username", "zhang")
                .ge("age", 18)  // age >= 18
                .le("age", 30)  // age <= 30
                .orderByDesc("create_time");
        List<User> result = userMapper.selectList(wrapper2);

        // 或条件
        QueryWrapper<User> wrapper3 = new QueryWrapper<>();
        wrapper3.eq("username", "zhangsan")
                .or()
                .eq("email", "zhang@example.com");

        // IN查询
        QueryWrapper<User> wrapper4 = new QueryWrapper<>();
        wrapper4.in("id", Arrays.asList(1, 2, 3, 4, 5));

        // 排序
        QueryWrapper<User> wrapper5 = new QueryWrapper<>();
        wrapper5.orderByAsc("age")
                .orderByDesc("create_time");
    }

    /**
     * Lambda条件构造器（推荐，类型安全） ⭐⭐⭐⭐⭐
     */
    public void lambdaQueryWrapper() {
        // Lambda方式（推荐）⭐⭐⭐⭐⭐
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
    }

    /**
     * 分页查询 ⭐⭐⭐⭐⭐
     */
    public Page<User> pageQuery(int pageNum, int pageSize) {
        // 创建分页对象
        Page<User> page = new Page<>(pageNum, pageSize);

        // 分页查询
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(User::getAge, 18)
               .orderByDesc(User::getCreateTime);

        Page<User> result = userMapper.selectPage(page, wrapper);

        // 获取结果
        List<User> records = result.getRecords();  // 数据列表
        long total = result.getTotal();            // 总记录数
        long pages = result.getPages();            // 总页数

        return result;
    }

    /**
     * 批量操作（IService提供） ⭐⭐⭐⭐⭐
     */
    @Autowired
    private UserService userService;

    public void batchOperations() {
        // 批量插入
        List<User> users = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            User user = new User();
            user.setUsername("user" + i);
            users.add(user);
        }
        userService.saveBatch(users);

        // 批量更新
        userService.updateBatchById(users);

        // 保存或更新（根据ID判断）
        userService.saveOrUpdate(new User());

        // 链式查询
        List<User> list = userService.lambdaQuery()
            .eq(User::getAge, 25)
            .like(User::getUsername, "zhang")
            .list();

        // 链式更新
        boolean success = userService.lambdaUpdate()
            .set(User::getAge, 26)
            .eq(User::getId, 1L)
            .update();
    }
}
```

### MyBatis-Plus配置

```yaml
# application.yml
mybatis-plus:
  # Mapper XML文件位置
  mapper-locations: classpath*:/mapper/**/*.xml
  # 实体类包路径
  type-aliases-package: com.example.entity
  # 全局配置
  global-config:
    db-config:
      # 主键类型
      id-type: auto
      # 表名前缀
      table-prefix: t_
      # 逻辑删除字段
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
  # 配置
  configuration:
    # 下划线转驼峰
    map-underscore-to-camel-case: true
    # 日志
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 缓存
    cache-enabled: true
```

## 💡 重点总结

### MyBatis vs MyBatis-Plus ⭐⭐⭐⭐⭐

| 特性     | MyBatis     | MyBatis-Plus            |
| -------- | ----------- | ----------------------- |
| CRUD     | 需要手写SQL | 自动生成 ⭐⭐⭐⭐⭐     |
| 分页     | 需要插件    | 内置支持 ⭐⭐⭐⭐⭐     |
| 条件构造 | 动态SQL     | QueryWrapper ⭐⭐⭐⭐⭐ |
| 批量操作 | 手写foreach | saveBatch ⭐⭐⭐⭐⭐    |
| 学习曲线 | 较陡        | 简单 ⭐⭐⭐⭐⭐         |
| 推荐度   | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐              |

### 最佳实践 ⭐⭐⭐⭐⭐

1. **简单CRUD用MyBatis-Plus** - 节省时间
2. **复杂SQL用XML** - 可读性好
3. **使用Lambda条件构造器** - 类型安全
4. **合理使用缓存** - 提高性能
5. **分页查询加索引** - 避免慢查询

### 常用代码模板

```java
// 1. 分页查询 ⭐⭐⭐⭐⭐
public Page<User> getUserPage(int pageNum, int pageSize, String keyword) {
    Page<User> page = new Page<>(pageNum, pageSize);
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    if (StringUtils.isNotBlank(keyword)) {
        wrapper.like(User::getUsername, keyword)
               .or()
               .like(User::getEmail, keyword);
    }
    return userMapper.selectPage(page, wrapper);
}

// 2. 批量插入 ⭐⭐⭐⭐⭐
public boolean batchSave(List<User> users) {
    return userService.saveBatch(users);
}

// 3. 更新指定字段 ⭐⭐⭐⭐⭐
public boolean updateAge(Long id, Integer age) {
    return userService.lambdaUpdate()
        .set(User::getAge, age)
        .eq(User::getId, id)
        .update();
}

// 4. 条件删除 ⭐⭐⭐⭐⭐
public boolean deleteByCondition(String username) {
    return userService.lambdaUpdate()
        .eq(User::getUsername, username)
        .remove();
}
```

## 🎯 练习建议

1. 搭建MyBatis环境，实现基础CRUD
2. 使用MyBatis-Plus简化开发
3. 实现复杂的多表查询
4. 实现动态SQL条件查询
5. 实现分页查询功能

## 📚 下一步

完成数据库部分学习后，继续学习 [Spring生态](../04-Spring生态/)
