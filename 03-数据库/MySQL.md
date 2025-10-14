# MySQL数据库

## 📌 学习目标

- 掌握MySQL基础操作
- 熟练使用SQL语句
- 理解索引和优化
- 掌握事务处理
- 了解数据库设计原则

## ⭐ MySQL核心知识

- **SQL基础语法** ⭐⭐⭐⭐⭐
- **索引优化** ⭐⭐⭐⭐⭐
- **事务处理** ⭐⭐⭐⭐⭐
- **存储引擎** ⭐⭐⭐⭐
- **性能优化** ⭐⭐⭐⭐⭐

## 1. SQL基础操作 ⭐⭐⭐⭐⭐

### 数据库和表操作

```sql
-- 创建数据库 ⭐⭐⭐⭐⭐
CREATE DATABASE IF NOT EXISTS mydb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE mydb;

-- 删除数据库
DROP DATABASE IF EXISTS mydb;

-- 创建表 ⭐⭐⭐⭐⭐
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    age INT DEFAULT 0 COMMENT '年龄',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),  -- 普通索引
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 查看表结构
DESC users;
SHOW CREATE TABLE users;

-- 修改表结构 ⭐⭐⭐⭐
ALTER TABLE users ADD COLUMN phone VARCHAR(20) COMMENT '手机号';  -- 添加列
ALTER TABLE users MODIFY COLUMN age INT DEFAULT 18;  -- 修改列
ALTER TABLE users CHANGE COLUMN phone mobile VARCHAR(20);  -- 重命名列
ALTER TABLE users DROP COLUMN mobile;  -- 删除列
ALTER TABLE users ADD INDEX idx_age (age);  -- 添加索引

-- 删除表
DROP TABLE IF EXISTS users;
```

### 数据操作（CRUD）⭐⭐⭐⭐⭐

```sql
-- 插入数据（INSERT） ⭐⭐⭐⭐⭐
INSERT INTO users (username, password, email, age)
VALUES ('zhangsan', '123456', 'zhang@example.com', 25);

-- 批量插入（推荐）
INSERT INTO users (username, password, email, age) VALUES
('lisi', '123456', 'li@example.com', 28),
('wangwu', '123456', 'wang@example.com', 30),
('zhaoliu', '123456', 'zhao@example.com', 22);

-- 查询数据（SELECT） ⭐⭐⭐⭐⭐
-- 查询所有
SELECT * FROM users;

-- 指定列查询
SELECT id, username, email FROM users;

-- 条件查询 WHERE ⭐⭐⭐⭐⭐
SELECT * FROM users WHERE age > 25;
SELECT * FROM users WHERE username = 'zhangsan';
SELECT * FROM users WHERE age BETWEEN 20 AND 30;
SELECT * FROM users WHERE username IN ('zhangsan', 'lisi');
SELECT * FROM users WHERE email LIKE '%@example.com';
SELECT * FROM users WHERE age > 25 AND status = 1;

-- 排序 ORDER BY ⭐⭐⭐⭐⭐
SELECT * FROM users ORDER BY age DESC;  -- 降序
SELECT * FROM users ORDER BY age ASC;   -- 升序
SELECT * FROM users ORDER BY age DESC, id ASC;  -- 多字段排序

-- 分页 LIMIT ⭐⭐⭐⭐⭐
SELECT * FROM users LIMIT 10;  -- 前10条
SELECT * FROM users LIMIT 10, 10;  -- 跳过10条，取10条（第2页）
SELECT * FROM users LIMIT 10 OFFSET 10;  -- 同上

-- 更新数据（UPDATE） ⭐⭐⭐⭐⭐
UPDATE users SET age = 26 WHERE username = 'zhangsan';
UPDATE users SET age = age + 1 WHERE age < 30;
UPDATE users SET email = 'new@example.com', age = 27 WHERE id = 1;

-- 删除数据（DELETE） ⭐⭐⭐⭐⭐
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE age > 60;

-- 清空表（慎用！）
TRUNCATE TABLE users;  -- 比DELETE快，但不能回滚
```

## 2. 高级查询 ⭐⭐⭐⭐⭐

### 聚合函数

```sql
-- 常用聚合函数 ⭐⭐⭐⭐⭐
SELECT COUNT(*) AS total FROM users;  -- 总数
SELECT COUNT(DISTINCT email) AS unique_emails FROM users;  -- 去重计数
SELECT AVG(age) AS avg_age FROM users;  -- 平均值
SELECT SUM(age) AS sum_age FROM users;  -- 求和
SELECT MAX(age) AS max_age FROM users;  -- 最大值
SELECT MIN(age) AS min_age FROM users;  -- 最小值

-- 分组 GROUP BY ⭐⭐⭐⭐⭐
SELECT age, COUNT(*) AS count
FROM users
GROUP BY age;

SELECT age, AVG(age) AS avg_age
FROM users
GROUP BY age
HAVING COUNT(*) > 2;  -- HAVING用于分组后的条件过滤

-- 分组后排序
SELECT age, COUNT(*) AS count
FROM users
GROUP BY age
ORDER BY count DESC;
```

### 多表查询

```sql
-- 创建订单表
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_name VARCHAR(100),
    price DECIMAL(10, 2),
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 内连接 INNER JOIN ⭐⭐⭐⭐⭐
SELECT u.username, o.product_name, o.price
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 左连接 LEFT JOIN ⭐⭐⭐⭐⭐
SELECT u.username, o.product_name, o.price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 右连接 RIGHT JOIN ⭐⭐⭐⭐
SELECT u.username, o.product_name, o.price
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 子查询 ⭐⭐⭐⭐⭐
-- 查询有订单的用户
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- 查询购买金额大于平均值的订单
SELECT * FROM orders
WHERE price > (SELECT AVG(price) FROM orders);

-- EXISTS子查询
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

## 3. 索引优化 ⭐⭐⭐⭐⭐

### 索引类型

```sql
-- 1. 主键索引（PRIMARY KEY）⭐⭐⭐⭐⭐
CREATE TABLE test1 (
    id INT PRIMARY KEY AUTO_INCREMENT
);

-- 2. 唯一索引（UNIQUE）⭐⭐⭐⭐⭐
CREATE TABLE test2 (
    email VARCHAR(100) UNIQUE
);
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);

-- 3. 普通索引（INDEX）⭐⭐⭐⭐⭐
CREATE INDEX idx_username ON users(username);
ALTER TABLE users ADD INDEX idx_age (age);

-- 4. 组合索引 ⭐⭐⭐⭐⭐
CREATE INDEX idx_name_age ON users(username, age);

-- 5. 全文索引（FULLTEXT）⭐⭐⭐⭐
ALTER TABLE articles ADD FULLTEXT INDEX idx_content (content);

-- 查看索引
SHOW INDEX FROM users;

-- 删除索引
DROP INDEX idx_username ON users;
ALTER TABLE users DROP INDEX idx_age;
```

### 索引优化建议 ⭐⭐⭐⭐⭐

```sql
-- ✅ 好的索引使用
-- 1. 在WHERE、ORDER BY、GROUP BY的列上建索引
SELECT * FROM users WHERE username = 'zhangsan';  -- username有索引

-- 2. 选择性高的列建索引
-- 性别（只有男/女）选择性低，不适合单独建索引
-- 用户名（唯一）选择性高，适合建索引

-- 3. 组合索引遵循最左前缀原则 ⭐⭐⭐⭐⭐
-- 索引：(username, age, email)
-- ✅ 会用到索引
SELECT * FROM users WHERE username = 'zhangsan';
SELECT * FROM users WHERE username = 'zhangsan' AND age = 25;
SELECT * FROM users WHERE username = 'zhangsan' AND age = 25 AND email = 'a@a.com';

-- ❌ 不会用到索引
SELECT * FROM users WHERE age = 25;
SELECT * FROM users WHERE email = 'a@a.com';

-- 4. 避免索引失效 ⭐⭐⭐⭐⭐
-- ❌ 在索引列上使用函数
SELECT * FROM users WHERE UPPER(username) = 'ZHANGSAN';

-- ✅ 应该这样
SELECT * FROM users WHERE username = 'zhangsan';

-- ❌ 使用!=、<>、NOT IN
SELECT * FROM users WHERE age != 25;

-- ✅ 应该使用
SELECT * FROM users WHERE age < 25 OR age > 25;

-- ❌ LIKE以%开头
SELECT * FROM users WHERE username LIKE '%zhang%';

-- ✅ 应该这样
SELECT * FROM users WHERE username LIKE 'zhang%';

-- 使用EXPLAIN分析查询 ⭐⭐⭐⭐⭐
EXPLAIN SELECT * FROM users WHERE username = 'zhangsan';
```

## 4. 事务处理 ⭐⭐⭐⭐⭐

### 事务基础

```sql
-- 事务的ACID特性 ⭐⭐⭐⭐⭐
-- A：原子性（Atomicity） - 要么全部成功，要么全部失败
-- C：一致性（Consistency） - 数据完整性
-- I：隔离性（Isolation） - 多个事务互不干扰
-- D：持久性（Durability） - 提交后永久保存

-- 开启事务 ⭐⭐⭐⭐⭐
START TRANSACTION;
-- 或
BEGIN;

-- 执行SQL
UPDATE users SET age = age - 1 WHERE id = 1;
UPDATE users SET age = age + 1 WHERE id = 2;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 实际案例：转账 ⭐⭐⭐⭐⭐
START TRANSACTION;

-- 扣款
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;

-- 加款
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;

-- 检查是否成功
-- 如果都成功
COMMIT;
-- 如果有错误
-- ROLLBACK;

-- 保存点（SavePoint）⭐⭐⭐⭐
START TRANSACTION;
UPDATE users SET age = 26 WHERE id = 1;
SAVEPOINT sp1;
UPDATE users SET age = 27 WHERE id = 2;
ROLLBACK TO sp1;  -- 回滚到保存点
COMMIT;
```

### 事务隔离级别 ⭐⭐⭐⭐⭐

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;  -- MySQL默认
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 隔离级别说明 ⭐⭐⭐⭐⭐
-- 1. READ UNCOMMITTED（读未提交）⭐⭐
--    问题：脏读、不可重复读、幻读

-- 2. READ COMMITTED（读已提交）⭐⭐⭐⭐
--    问题：不可重复读、幻读
--    Oracle默认级别

-- 3. REPEATABLE READ（可重复读）⭐⭐⭐⭐⭐
--    问题：幻读（MySQL通过间隙锁解决）
--    MySQL默认级别

-- 4. SERIALIZABLE（串行化）⭐⭐⭐
--    最高级别，无并发问题，性能最差
```

## 5. MySQL与Java集成 ⭐⭐⭐⭐⭐

### JDBC基础操作

```java
import java.sql.*;

/**
 * JDBC基础示例 ⭐⭐⭐⭐⭐
 */
public class JDBCDemo {
    // 数据库连接信息
    private static final String URL = "jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC&characterEncoding=utf8";
    private static final String USER = "root";
    private static final String PASSWORD = "password";

    public static void main(String[] args) {
        // 1. 加载驱动（MySQL 8.0+可省略）
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        // 插入数据
        insertUser("testuser", "password123", "test@example.com", 25);

        // 查询数据
        queryAllUsers();

        // 更新数据
        updateUser(1, 26);

        // 删除数据
        deleteUser(1);
    }

    /**
     * 插入数据 ⭐⭐⭐⭐⭐
     */
    public static void insertUser(String username, String password,
                                  String email, int age) {
        String sql = "INSERT INTO users(username, password, email, age) VALUES(?,?,?,?)";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            // 设置参数（防止SQL注入）⭐⭐⭐⭐⭐
            pstmt.setString(1, username);
            pstmt.setString(2, password);
            pstmt.setString(3, email);
            pstmt.setInt(4, age);

            int rows = pstmt.executeUpdate();
            System.out.println("插入了 " + rows + " 行数据");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 查询数据 ⭐⭐⭐⭐⭐
     */
    public static void queryAllUsers() {
        String sql = "SELECT id, username, email, age FROM users";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                int id = rs.getInt("id");
                String username = rs.getString("username");
                String email = rs.getString("email");
                int age = rs.getInt("age");

                System.out.printf("ID:%d, 用户名:%s, 邮箱:%s, 年龄:%d\n",
                    id, username, email, age);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 更新数据 ⭐⭐⭐⭐⭐
     */
    public static void updateUser(int id, int newAge) {
        String sql = "UPDATE users SET age = ? WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, newAge);
            pstmt.setInt(2, id);

            int rows = pstmt.executeUpdate();
            System.out.println("更新了 " + rows + " 行数据");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 删除数据 ⭐⭐⭐⭐⭐
     */
    public static void deleteUser(int id) {
        String sql = "DELETE FROM users WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);

            int rows = pstmt.executeUpdate();
            System.out.println("删除了 " + rows + " 行数据");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 事务处理 ⭐⭐⭐⭐⭐
     */
    public static void transferMoney(int fromId, int toId, double amount) {
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
            // 关闭自动提交
            conn.setAutoCommit(false);

            String deductSql = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
            String addSql = "UPDATE accounts SET balance = balance + ? WHERE id = ?";

            try (PreparedStatement deduct = conn.prepareStatement(deductSql);
                 PreparedStatement add = conn.prepareStatement(addSql)) {

                // 扣款
                deduct.setDouble(1, amount);
                deduct.setInt(2, fromId);
                deduct.executeUpdate();

                // 加款
                add.setDouble(1, amount);
                add.setInt(2, toId);
                add.executeUpdate();

                // 提交事务
                conn.commit();
                System.out.println("转账成功！");
            }

        } catch (SQLException e) {
            // 回滚事务
            if (conn != null) {
                try {
                    conn.rollback();
                    System.out.println("转账失败，已回滚");
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

## 💡 重点总结

### SQL优化建议 ⭐⭐⭐⭐⭐

1. **使用索引** - WHERE、ORDER BY、JOIN的列
2. **避免SELECT \*** - 只查询需要的列
3. **使用LIMIT** - 限制返回行数
4. **批量操作** - 批量INSERT代替单条
5. **避免子查询** - 能JOIN就不用子查询
6. **使用PreparedStatement** - 防SQL注入，性能更好

### 数据库设计原则 ⭐⭐⭐⭐⭐

1. **三范式**：
   - 1NF：字段不可分
   - 2NF：非主键字段完全依赖主键
   - 3NF：非主键字段不传递依赖

2. **命名规范**：
   - 表名、字段名小写，下划线分隔
   - 表名用复数形式
   - 主键统一用id

3. **字段类型选择**：
   - 整数：INT、BIGINT
   - 小数：DECIMAL（精确）、DOUBLE（性能）
   - 字符串：VARCHAR（可变）、CHAR（固定）
   - 时间：DATETIME、TIMESTAMP
   - 布尔：TINYINT(1)

### 常用SQL模板

```sql
-- 分页查询 ⭐⭐⭐⭐⭐
SELECT * FROM users
WHERE status = 1
ORDER BY create_time DESC
LIMIT 20 OFFSET 0;

-- 统计查询 ⭐⭐⭐⭐⭐
SELECT
    COUNT(*) AS total,
    COUNT(DISTINCT user_id) AS unique_users,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM orders
WHERE order_time >= '2024-01-01';

-- 关联查询 ⭐⭐⭐⭐⭐
SELECT
    u.username,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING order_count > 0
ORDER BY total_amount DESC;
```

## 🎯 练习建议

1. 设计一个电商数据库（用户、商品、订单）
2. 实现常见的CRUD操作
3. 练习复杂的多表查询
4. 使用EXPLAIN分析SQL性能
5. 实现事务处理场景

## 📚 下一步

学习完MySQL后，继续学习 [Redis](./Redis.md)
