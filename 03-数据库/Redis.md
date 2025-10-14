# Redis缓存数据库

## 📌 学习目标

- 理解Redis核心数据结构
- 掌握Redis常用命令
- 理解Redis持久化机制
- 掌握Redis与Java集成
- 了解Redis应用场景

## ⭐ Redis核心概念

- **NoSQL数据库** - 键值对存储 ⭐⭐⭐⭐⭐
- **内存数据库** - 高性能 ⭐⭐⭐⭐⭐
- **数据结构服务器** - 支持多种数据类型 ⭐⭐⭐⭐⭐
- **单线程** - 原子操作 ⭐⭐⭐⭐⭐

## 1. Redis数据类型 ⭐⭐⭐⭐⭐

### String（字符串）⭐⭐⭐⭐⭐

```bash
# 设置值
SET name "张三"
SET age 25

# 获取值
GET name

# 设置并返回旧值
GETSET name "李四"

# 设置多个值
MSET name "张三" age 25 city "北京"

# 获取多个值
MGET name age city

# 追加
APPEND name "同学"

# 获取长度
STRLEN name

# 数字操作 ⭐⭐⭐⭐⭐
SET counter 100
INCR counter  # +1
DECR counter  # -1
INCRBY counter 10  # +10
DECRBY counter 5   # -5

# 设置过期时间 ⭐⭐⭐⭐⭐
SETEX session 3600 "session_data"  # 3600秒后过期
SET token "abc123" EX 7200  # 2小时后过期

# 不存在才设置
SETNX lock "locked"  # 分布式锁的基础
```

### Hash（哈希）⭐⭐⭐⭐⭐

```bash
# 设置字段
HSET user:1 name "张三"
HSET user:1 age 25
HSET user:1 email "zhang@example.com"

# 设置多个字段
HMSET user:2 name "李四" age 28 email "li@example.com"

# 获取字段
HGET user:1 name

# 获取多个字段
HMGET user:1 name age email

# 获取所有字段和值
HGETALL user:1

# 判断字段是否存在
HEXISTS user:1 name

# 删除字段
HDEL user:1 email

# 获取所有字段名
HKEYS user:1

# 获取所有值
HVALS user:1

# 字段数量
HLEN user:1

# 数字操作
HINCRBY user:1 age 1  # age +1
```

### List（列表）⭐⭐⭐⭐⭐

```bash
# 左侧插入（头部）
LPUSH tasks "任务1" "任务2" "任务3"

# 右侧插入（尾部）
RPUSH tasks "任务4"

# 左侧弹出
LPOP tasks

# 右侧弹出
RPOP tasks

# 获取范围元素 ⭐⭐⭐⭐⭐
LRANGE tasks 0 -1  # 获取所有
LRANGE tasks 0 9   # 获取前10个

# 获取指定索引元素
LINDEX tasks 0

# 列表长度
LLEN tasks

# 删除元素
LREM tasks 1 "任务1"  # 删除1个"任务1"

# 修剪列表
LTRIM tasks 0 99  # 只保留前100个

# 阻塞式弹出（消息队列） ⭐⭐⭐⭐⭐
BLPOP tasks 30  # 等待30秒
BRPOP tasks 30
```

### Set（集合）⭐⭐⭐⭐⭐

```bash
# 添加成员
SADD tags "Java" "Python" "Go"

# 获取所有成员
SMEMBERS tags

# 判断是否存在
SISMEMBER tags "Java"

# 删除成员
SREM tags "Go"

# 集合大小
SCARD tags

# 随机获取成员
SRANDMEMBER tags 2

# 弹出成员
SPOP tags

# 集合运算 ⭐⭐⭐⭐⭐
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"

# 交集
SINTER set1 set2

# 并集
SUNION set1 set2

# 差集
SDIFF set1 set2  # set1中有但set2中没有的
```

### Sorted Set（有序集合）⭐⭐⭐⭐⭐

```bash
# 添加成员（带分数）
ZADD leaderboard 100 "张三"
ZADD leaderboard 95 "李四"
ZADD leaderboard 88 "王五"
ZADD leaderboard 92 "赵六"

# 获取排名范围 ⭐⭐⭐⭐⭐
ZRANGE leaderboard 0 -1  # 升序，所有
ZRANGE leaderboard 0 9   # 前10名
ZREVRANGE leaderboard 0 9  # 降序，前10名

# 带分数显示
ZRANGE leaderboard 0 -1 WITHSCORES
ZREVRANGE leaderboard 0 9 WITHSCORES

# 获取分数
ZSCORE leaderboard "张三"

# 获取排名 ⭐⭐⭐⭐⭐
ZRANK leaderboard "张三"  # 升序排名
ZREVRANK leaderboard "张三"  # 降序排名

# 增加分数
ZINCRBY leaderboard 5 "李四"

# 按分数范围查询
ZRANGEBYSCORE leaderboard 90 100

# 统计数量
ZCARD leaderboard
ZCOUNT leaderboard 90 100  # 90-100分的人数

# 删除成员
ZREM leaderboard "王五"
```

## 2. Redis通用命令 ⭐⭐⭐⭐⭐

```bash
# 键操作 ⭐⭐⭐⭐⭐
KEYS *  # 查看所有key（生产环境禁用！）
KEYS user:*  # 查看匹配的key

# 扫描（推荐，不阻塞） ⭐⭐⭐⭐⭐
SCAN 0 MATCH user:* COUNT 100

# 判断key是否存在
EXISTS name

# 删除key
DEL name age

# 设置过期时间 ⭐⭐⭐⭐⭐
EXPIRE name 3600  # 秒
PEXPIRE name 3600000  # 毫秒

# 查看剩余时间
TTL name  # 秒
PTTL name  # 毫秒

# 移除过期时间
PERSIST name

# 重命名
RENAME oldkey newkey

# 查看类型
TYPE name

# 查看内存使用
MEMORY USAGE name

# 数据库切换（默认16个数据库）
SELECT 0  # 切换到DB0
SELECT 1  # 切换到DB1

# 清空当前数据库
FLUSHDB

# 清空所有数据库
FLUSHALL
```

## 3. Redis持久化 ⭐⭐⭐⭐⭐

### RDB（快照）⭐⭐⭐⭐

```bash
# 配置文件（redis.conf）
# 900秒内至少1个key变化，触发RDB
save 900 1
# 300秒内至少10个key变化
save 300 10
# 60秒内至少10000个key变化
save 60 10000

# 手动触发RDB
SAVE    # 阻塞，直到完成
BGSAVE  # 后台保存，不阻塞（推荐）

# RDB文件名
dbfilename dump.rdb

# RDB文件目录
dir /var/lib/redis
```

### AOF（追加文件）⭐⭐⭐⭐⭐

```bash
# 启用AOF
appendonly yes

# AOF文件名
appendfilename "appendonly.aof"

# 同步策略 ⭐⭐⭐⭐⭐
# always：每次写操作都同步（最安全，性能差）
# everysec：每秒同步一次（推荐）⭐⭐⭐⭐⭐
# no：由操作系统决定（性能好，可能丢数据）
appendfsync everysec

# AOF重写（压缩）
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 手动重写
BGREWRITEAOF
```

## 4. Redis与Java集成 ⭐⭐⭐⭐⭐

### Jedis客户端

```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

/**
 * Jedis基础使用 ⭐⭐⭐⭐⭐
 */
public class JedisDemo {
    public static void main(String[] args) {
        // 1. 创建Jedis连接
        Jedis jedis = new Jedis("localhost", 6379);
        // 如果设置了密码
        // jedis.auth("password");
        
        // 2. String操作 ⭐⭐⭐⭐⭐
        jedis.set("name", "张三");
        String name = jedis.get("name");
        System.out.println("name: " + name);
        
        jedis.setex("code", 300, "123456");  // 5分钟后过期
        
        // 3. Hash操作 ⭐⭐⭐⭐⭐
        jedis.hset("user:1", "name", "李四");
        jedis.hset("user:1", "age", "25");
        String userName = jedis.hget("user:1", "name");
        Map<String, String> user = jedis.hgetAll("user:1");
        
        // 4. List操作 ⭐⭐⭐⭐⭐
        jedis.lpush("tasks", "任务1", "任务2");
        List<String> tasks = jedis.lrange("tasks", 0, -1);
        
        // 5. Set操作 ⭐⭐⭐⭐⭐
        jedis.sadd("tags", "Java", "Redis", "MySQL");
        Set<String> tags = jedis.smembers("tags");
        
        // 6. Sorted Set操作 ⭐⭐⭐⭐⭐
        jedis.zadd("rank", 100, "张三");
        jedis.zadd("rank", 95, "李四");
        List<String> topUsers = jedis.zrevrange("rank", 0, 9);  // 前10名
        
        // 关闭连接
        jedis.close();
    }
}

/**
 * 使用连接池（推荐） ⭐⭐⭐⭐⭐
 */
public class JedisPoolDemo {
    private static JedisPool jedisPool;
    
    static {
        // 连接池配置
        JedisPoolConfig config = new JedisPoolConfig();
        config.setMaxTotal(100);  // 最大连接数
        config.setMaxIdle(10);    // 最大空闲连接
        config.setMinIdle(5);     // 最小空闲连接
        config.setTestOnBorrow(true);  // 获取连接时检测可用性
        
        // 创建连接池
        jedisPool = new JedisPool(config, "localhost", 6379);
    }
    
    public static Jedis getJedis() {
        return jedisPool.getResource();
    }
    
    public static void main(String[] args) {
        // 从连接池获取连接
        try (Jedis jedis = getJedis()) {
            jedis.set("pool", "连接池测试");
            System.out.println(jedis.get("pool"));
        }
    }
}
```

### Spring Data Redis（推荐）⭐⭐⭐⭐⭐

```java
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.concurrent.TimeUnit;

/**
 * Spring Data Redis ⭐⭐⭐⭐⭐
 */
@Service
public class RedisService {
    
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * String操作 ⭐⭐⭐⭐⭐
     */
    public void stringOperations() {
        // 设置值
        stringRedisTemplate.opsForValue().set("key", "value");
        
        // 设置值和过期时间
        stringRedisTemplate.opsForValue().set("code", "123456", 5, TimeUnit.MINUTES);
        
        // 获取值
        String value = stringRedisTemplate.opsForValue().get("key");
        
        // 自增
        stringRedisTemplate.opsForValue().increment("counter");
        stringRedisTemplate.opsForValue().increment("counter", 10);
        
        // 不存在才设置
        Boolean success = stringRedisTemplate.opsForValue().setIfAbsent("lock", "1");
    }
    
    /**
     * Hash操作 ⭐⭐⭐⭐⭐
     */
    public void hashOperations() {
        // 设置字段
        stringRedisTemplate.opsForHash().put("user:1", "name", "张三");
        
        // 获取字段
        Object name = stringRedisTemplate.opsForHash().get("user:1", "name");
        
        // 获取所有
        Map<Object, Object> user = stringRedisTemplate.opsForHash().entries("user:1");
        
        // 批量设置
        Map<String, String> map = new HashMap<>();
        map.put("name", "李四");
        map.put("age", "25");
        stringRedisTemplate.opsForHash().putAll("user:2", map);
    }
    
    /**
     * List操作 ⭐⭐⭐⭐⭐
     */
    public void listOperations() {
        // 左侧插入
        stringRedisTemplate.opsForList().leftPush("tasks", "任务1");
        
        // 右侧插入
        stringRedisTemplate.opsForList().rightPush("tasks", "任务2");
        
        // 获取范围
        List<String> tasks = stringRedisTemplate.opsForList().range("tasks", 0, -1);
        
        // 左侧弹出
        String task = stringRedisTemplate.opsForList().leftPop("tasks");
        
        // 大小
        Long size = stringRedisTemplate.opsForList().size("tasks");
    }
    
    /**
     * Set操作 ⭐⭐⭐⭐⭐
     */
    public void setOperations() {
        // 添加
        stringRedisTemplate.opsForSet().add("tags", "Java", "Redis", "MySQL");
        
        // 获取所有
        Set<String> tags = stringRedisTemplate.opsForSet().members("tags");
        
        // 判断存在
        Boolean exists = stringRedisTemplate.opsForSet().isMember("tags", "Java");
        
        // 删除
        stringRedisTemplate.opsForSet().remove("tags", "MySQL");
        
        // 大小
        Long size = stringRedisTemplate.opsForSet().size("tags");
    }
    
    /**
     * Sorted Set操作 ⭐⭐⭐⭐⭐
     */
    public void zsetOperations() {
        // 添加
        stringRedisTemplate.opsForZSet().add("rank", "张三", 100);
        stringRedisTemplate.opsForZSet().add("rank", "李四", 95);
        
        // 获取范围（降序）
        Set<String> top10 = stringRedisTemplate.opsForZSet()
            .reverseRange("rank", 0, 9);
        
        // 带分数
        Set<ZSetOperations.TypedTuple<String>> topWithScores = 
            stringRedisTemplate.opsForZSet()
                .reverseRangeWithScores("rank", 0, 9);
        
        // 获取排名
        Long rank = stringRedisTemplate.opsForZSet().reverseRank("rank", "张三");
        
        // 增加分数
        stringRedisTemplate.opsForZSet().incrementScore("rank", "李四", 5);
        
        // 获取分数
        Double score = stringRedisTemplate.opsForZSet().score("rank", "张三");
    }
    
    /**
     * 通用操作 ⭐⭐⭐⭐⭐
     */
    public void commonOperations() {
        // 设置过期时间
        stringRedisTemplate.expire("key", 1, TimeUnit.HOURS);
        
        // 获取剩余时间
        Long ttl = stringRedisTemplate.getExpire("key", TimeUnit.SECONDS);
        
        // 删除
        stringRedisTemplate.delete("key");
        
        // 判断存在
        Boolean exists = stringRedisTemplate.hasKey("key");
    }
}
```

## 5. Redis应用场景 ⭐⭐⭐⭐⭐

### 1. 缓存 ⭐⭐⭐⭐⭐

```java
/**
 * 缓存示例
 */
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 查询用户（带缓存） ⭐⭐⭐⭐⭐
     */
    public User getUserById(Long id) {
        String key = "user:" + id;
        
        // 1. 先查缓存
        String userJson = redisTemplate.opsForValue().get(key);
        if (userJson != null) {
            return JSON.parseObject(userJson, User.class);
        }
        
        // 2. 缓存未命中，查数据库
        User user = userMapper.selectById(id);
        if (user != null) {
            // 3. 写入缓存
            redisTemplate.opsForValue().set(key, JSON.toJSONString(user), 
                1, TimeUnit.HOURS);
        }
        
        return user;
    }
    
    /**
     * 更新用户（删除缓存） ⭐⭐⭐⭐⭐
     */
    public void updateUser(User user) {
        // 1. 更新数据库
        userMapper.updateById(user);
        
        // 2. 删除缓存
        String key = "user:" + user.getId();
        redisTemplate.delete(key);
    }
}
```

### 2. 分布式锁 ⭐⭐⭐⭐⭐

```java
/**
 * 分布式锁
 */
@Service
public class DistributedLockService {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 获取锁 ⭐⭐⭐⭐⭐
     */
    public boolean tryLock(String lockKey, String requestId, long expireTime) {
        // SETNX + 过期时间，原子操作
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, requestId, expireTime, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(success);
    }
    
    /**
     * 释放锁 ⭐⭐⭐⭐⭐
     */
    public boolean releaseLock(String lockKey, String requestId) {
        // Lua脚本保证原子性
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                       "return redis.call('del', KEYS[1]) else return 0 end";
        
        Long result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class),
            Collections.singletonList(lockKey),
            requestId
        );
        
        return Long.valueOf(1).equals(result);
    }
    
    /**
     * 使用示例
     */
    public void processOrder(Long orderId) {
        String lockKey = "order:lock:" + orderId;
        String requestId = UUID.randomUUID().toString();
        
        try {
            // 获取锁
            if (tryLock(lockKey, requestId, 30)) {
                // 执行业务逻辑
                System.out.println("处理订单：" + orderId);
            } else {
                System.out.println("获取锁失败");
            }
        } finally {
            // 释放锁
            releaseLock(lockKey, requestId);
        }
    }
}
```

### 3. 限流 ⭐⭐⭐⭐⭐

```java
/**
 * 滑动窗口限流
 */
@Service
public class RateLimiterService {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    /**
     * 限流检查 ⭐⭐⭐⭐⭐
     * @param key 限流key
     * @param limit 限制次数
     * @param window 时间窗口（秒）
     */
    public boolean isAllowed(String key, int limit, int window) {
        long now = System.currentTimeMillis();
        long windowStart = now - window * 1000;
        
        // 移除窗口外的记录
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, windowStart);
        
        // 统计窗口内的请求数
        Long count = redisTemplate.opsForZSet().zCard(key);
        
        if (count < limit) {
            // 添加当前请求
            redisTemplate.opsForZSet().add(key, String.valueOf(now), now);
            redisTemplate.expire(key, window, TimeUnit.SECONDS);
            return true;
        }
        
        return false;
    }
}
```

### 4. 排行榜 ⭐⭐⭐⭐⭐

```java
/**
 * 排行榜
 */
@Service
public class LeaderboardService {
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    private static final String RANK_KEY = "game:rank";
    
    /**
     * 更新分数 ⭐⭐⭐⭐⭐
     */
    public void updateScore(String userId, double score) {
        redisTemplate.opsForZSet().add(RANK_KEY, userId, score);
    }
    
    /**
     * 获取前N名 ⭐⭐⭐⭐⭐
     */
    public List<RankItem> getTopN(int n) {
        Set<ZSetOperations.TypedTuple<String>> tops = 
            redisTemplate.opsForZSet()
                .reverseRangeWithScores(RANK_KEY, 0, n - 1);
        
        List<RankItem> result = new ArrayList<>();
        int rank = 1;
        for (ZSetOperations.TypedTuple<String> item : tops) {
            result.add(new RankItem(rank++, item.getValue(), 
                item.getScore()));
        }
        return result;
    }
    
    /**
     * 获取用户排名 ⭐⭐⭐⭐⭐
     */
    public Long getUserRank(String userId) {
        Long rank = redisTemplate.opsForZSet().reverseRank(RANK_KEY, userId);
        return rank != null ? rank + 1 : null;
    }
}
```

## 💡 重点总结

### Redis vs MySQL ⭐⭐⭐⭐⭐

| 特性 | Redis | MySQL |
|------|-------|-------|
| 存储 | 内存 | 磁盘 |
| 速度 | 极快（10万QPS+） | 较快 |
| 数据类型 | 5种数据结构 | 表格 |
| 持久化 | RDB/AOF | 原生支持 |
| 事务 | 简单事务 | 完整事务 |
| 使用场景 | 缓存、计数器、排行榜 | 持久化存储 |

### 缓存策略 ⭐⭐⭐⭐⭐

1. **Cache Aside**（旁路缓存）- 最常用 ⭐⭐⭐⭐⭐
   - 读：先读缓存，miss则读DB并更新缓存
   - 写：先写DB，再删除缓存

2. **Read Through**（读穿透）
   - 缓存层负责读DB

3. **Write Through**（写穿透）
   - 缓存层负责写DB

4. **Write Behind**（写回）
   - 异步写DB

### 缓存问题解决 ⭐⭐⭐⭐⭐

1. **缓存穿透**（查询不存在的数据）
   - 解决：布隆过滤器、缓存空值

2. **缓存击穿**（热点key过期）
   - 解决：热点数据永不过期、互斥锁

3. **缓存雪崩**（大量key同时过期）
   - 解决：过期时间加随机值、多级缓存

## 🎯 练习建议

1. 实现用户信息缓存
2. 实现分布式锁
3. 实现接口限流
4. 实现商品排行榜
5. 实现购物车功能

## 📚 下一步

学习完Redis后，继续学习 [MyBatis](./MyBatis.md)

