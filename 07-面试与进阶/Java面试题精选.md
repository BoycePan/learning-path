# Java面试题精选

## 📌 学习目标

- 掌握Java基础高频面试题
- 理解框架原理面试题
- 熟悉数据库面试题
- 了解分布式系统面试题
- 掌握算法与数据结构

## ⭐ 核心内容

- **Java基础** ⭐⭐⭐⭐⭐
- **集合框架** ⭐⭐⭐⭐⭐
- **并发编程** ⭐⭐⭐⭐⭐
- **JVM** ⭐⭐⭐⭐⭐
- **Spring** ⭐⭐⭐⭐⭐
- **数据库** ⭐⭐⭐⭐⭐
- **分布式** ⭐⭐⭐⭐⭐

## 1. Java基础 ⭐⭐⭐⭐⭐

### Q1: == 和 equals的区别？⭐⭐⭐⭐⭐

```java
// == 比较引用地址
String s1 = new String("hello");
String s2 = new String("hello");
System.out.println(s1 == s2);  // false

// equals 比较内容（String重写了equals）
System.out.println(s1.equals(s2));  // true

// 基本类型用==
int a = 1, b = 1;
System.out.println(a == b);  // true
```

**答案**：
- `==` 比较的是引用地址（对象是否是同一个）
- `equals` 比较的是内容（需要类重写equals方法）
- 基本类型只能用 `==`

### Q2: String、StringBuilder、StringBuffer的区别？⭐⭐⭐⭐⭐

```java
// String：不可变，线程安全
String s = "hello";
s = s + " world";  // 创建新对象

// StringBuilder：可变，线程不安全，性能高 ⭐⭐⭐⭐⭐
StringBuilder sb = new StringBuilder("hello");
sb.append(" world");  // 不创建新对象

// StringBuffer：可变，线程安全，性能较低
StringBuffer sbf = new StringBuffer("hello");
sbf.append(" world");
```

**答案**：
- **String**：不可变，适合少量字符串操作
- **StringBuilder**：可变，线程不安全，适合单线程大量字符串操作 ⭐⭐⭐⭐⭐
- **StringBuffer**：可变，线程安全，适合多线程字符串操作

### Q3: 重载和重写的区别？⭐⭐⭐⭐⭐

```java
// 重载（Overload）：同一个类中，方法名相同，参数不同
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
}

// 重写（Override）：子类重写父类方法
public class Animal {
    public void makeSound() { System.out.println("动物叫"); }
}

public class Dog extends Animal {
    @Override
    public void makeSound() { System.out.println("汪汪"); }
}
```

**答案**：
- **重载**：同一个类，方法名相同，参数不同（编译时多态）
- **重写**：子类重写父类方法，方法签名必须相同（运行时多态）

### Q4: 接口和抽象类的区别？⭐⭐⭐⭐⭐

| 特性 | 接口 | 抽象类 |
|------|------|--------|
| 继承 | 可以实现多个接口 ⭐⭐⭐⭐⭐ | 只能继承一个抽象类 |
| 方法 | 默认public abstract | 可以有具体实现 |
| 变量 | 默认public static final | 可以有实例变量 |
| 构造器 | 没有 | 可以有 |
| 使用场景 | 定义规范 | 代码复用 |

```java
// 接口：定义规范
public interface Flyable {
    void fly();  // 抽象方法
    
    default void land() {  // 默认方法（Java 8+）
        System.out.println("降落");
    }
}

// 抽象类：代码复用
public abstract class Animal {
    protected String name;  // 实例变量
    
    public Animal(String name) {  // 构造器
        this.name = name;
    }
    
    public abstract void makeSound();  // 抽象方法
    
    public void sleep() {  // 具体方法
        System.out.println(name + "在睡觉");
    }
}
```

## 2. 集合框架 ⭐⭐⭐⭐⭐

### Q5: ArrayList和LinkedList的区别？⭐⭐⭐⭐⭐

| 特性 | ArrayList | LinkedList |
|------|-----------|------------|
| 底层结构 | 数组 ⭐⭐⭐⭐⭐ | 双向链表 |
| 随机访问 | O(1) 快 ⭐⭐⭐⭐⭐ | O(n) 慢 |
| 插入删除 | O(n) 慢 | O(1) 快 |
| 内存占用 | 连续内存 | 额外指针 |
| 使用场景 | 查询多 ⭐⭐⭐⭐⭐ | 插入删除多 |

```java
// ArrayList：查询快
List<String> arrayList = new ArrayList<>();
arrayList.add("a");
String s = arrayList.get(0);  // O(1)

// LinkedList：插入删除快
List<String> linkedList = new LinkedList<>();
linkedList.add(0, "a");  // O(1)
```

### Q6: HashMap的底层原理？⭐⭐⭐⭐⭐

```java
// HashMap底层：数组 + 链表 + 红黑树（JDK 8+）

// 1. 计算hash
int hash = key.hashCode();
int index = hash & (table.length - 1);  // 取模

// 2. 存储
// - 如果没有冲突，直接存入数组
// - 如果有冲突，使用链表
// - 如果链表长度>=8且数组长度>=64，转为红黑树

// 3. 扩容
// - 当size > capacity * loadFactor时扩容
// - 默认capacity=16, loadFactor=0.75
// - 扩容为原来的2倍
```

**关键点**：
- 初始容量16，负载因子0.75
- 链表长度>=8且数组长度>=64时转红黑树
- 扩容时容量翻倍
- 线程不安全

### Q7: HashMap和ConcurrentHashMap的区别？⭐⭐⭐⭐⭐

```java
// HashMap：线程不安全
HashMap<String, String> hashMap = new HashMap<>();

// ConcurrentHashMap：线程安全 ⭐⭐⭐⭐⭐
ConcurrentHashMap<String, String> concurrentHashMap = new ConcurrentHashMap<>();

// JDK 7：分段锁（Segment）
// JDK 8：CAS + synchronized
```

**答案**：
- **HashMap**：线程不安全，性能高
- **ConcurrentHashMap**：线程安全，使用CAS+synchronized ⭐⭐⭐⭐⭐
- **Hashtable**：线程安全，但性能低（已过时）

## 3. 并发编程 ⭐⭐⭐⭐⭐

### Q8: synchronized和Lock的区别？⭐⭐⭐⭐⭐

| 特性 | synchronized | Lock |
|------|--------------|------|
| 类型 | 关键字 | 接口 |
| 锁释放 | 自动释放 ⭐⭐⭐⭐⭐ | 手动释放 |
| 可中断 | 不可中断 | 可中断 |
| 公平锁 | 非公平 | 可选 |
| 性能 | 较低 | 较高 |

```java
// synchronized：自动释放
public synchronized void method() {
    // 业务逻辑
}  // 自动释放锁

// Lock：手动释放
private final Lock lock = new ReentrantLock();

public void method() {
    lock.lock();
    try {
        // 业务逻辑
    } finally {
        lock.unlock();  // 必须手动释放
    }
}
```

### Q9: volatile的作用？⭐⭐⭐⭐⭐

```java
public class VolatileExample {
    private volatile boolean flag = false;  // 可见性
    
    public void writer() {
        flag = true;  // 写操作立即刷新到主内存
    }
    
    public void reader() {
        if (flag) {  // 读操作从主内存读取
            // ...
        }
    }
}
```

**答案**：
1. **保证可见性**：一个线程修改后，其他线程立即可见 ⭐⭐⭐⭐⭐
2. **禁止指令重排序**：保证有序性
3. **不保证原子性**：不能替代synchronized

### Q10: 线程池的核心参数？⭐⭐⭐⭐⭐

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // corePoolSize：核心线程数 ⭐⭐⭐⭐⭐
    10,                     // maximumPoolSize：最大线程数
    60L,                    // keepAliveTime：空闲线程存活时间
    TimeUnit.SECONDS,       // unit：时间单位
    new LinkedBlockingQueue<>(100),  // workQueue：任务队列
    Executors.defaultThreadFactory(),  // threadFactory：线程工厂
    new ThreadPoolExecutor.AbortPolicy()  // handler：拒绝策略
);
```

**执行流程**：
1. 线程数 < corePoolSize：创建新线程
2. 线程数 >= corePoolSize：任务放入队列
3. 队列满 && 线程数 < maximumPoolSize：创建新线程
4. 队列满 && 线程数 >= maximumPoolSize：执行拒绝策略

## 4. JVM ⭐⭐⭐⭐⭐

### Q11: JVM内存结构？⭐⭐⭐⭐⭐

```
堆（Heap）：存放对象实例 ⭐⭐⭐⭐⭐
  - 年轻代（Young Generation）
    - Eden区
    - Survivor区（S0、S1）
  - 老年代（Old Generation）

方法区（Method Area）：存放类信息、常量、静态变量
  - 运行时常量池

栈（Stack）：存放局部变量、方法调用 ⭐⭐⭐⭐⭐
  - 虚拟机栈（Java方法）
  - 本地方法栈（Native方法）

程序计数器（PC Register）：当前线程执行的字节码行号
```

### Q12: 垃圾回收算法？⭐⭐⭐⭐⭐

```
1. 标记-清除（Mark-Sweep）
   - 标记存活对象，清除未标记对象
   - 缺点：产生内存碎片

2. 复制算法（Copying）⭐⭐⭐⭐⭐
   - 将内存分为两块，每次只用一块
   - 存活对象复制到另一块，清空当前块
   - 优点：无碎片，缺点：浪费空间
   - 用于年轻代

3. 标记-整理（Mark-Compact）⭐⭐⭐⭐⭐
   - 标记存活对象，移动到一端，清除边界外内存
   - 用于老年代

4. 分代收集（Generational）⭐⭐⭐⭐⭐
   - 年轻代：复制算法
   - 老年代：标记-整理
```

### Q13: 常见的垃圾回收器？⭐⭐⭐⭐⭐

```
Serial：单线程，适合客户端
Parallel：多线程，吞吐量优先
CMS：并发标记清除，停顿时间短
G1：分区收集，可预测停顿 ⭐⭐⭐⭐⭐（JDK 9默认）
ZGC：超低延迟（JDK 11+）
```

## 5. Spring ⭐⭐⭐⭐⭐

### Q14: Spring的核心特性？⭐⭐⭐⭐⭐

```
1. IOC（控制反转）⭐⭐⭐⭐⭐
   - 对象的创建和管理交给Spring容器
   - 通过依赖注入（DI）实现

2. AOP（面向切面编程）⭐⭐⭐⭐⭐
   - 将横切关注点（日志、事务）与业务逻辑分离
   - 通过动态代理实现
```

### Q15: Spring Bean的生命周期？⭐⭐⭐⭐⭐

```
1. 实例化（Instantiation）
2. 属性赋值（Populate）
3. 初始化（Initialization）
   - BeanNameAware
   - BeanFactoryAware
   - ApplicationContextAware
   - @PostConstruct
   - InitializingBean.afterPropertiesSet()
   - init-method
4. 使用（In Use）
5. 销毁（Destruction）
   - @PreDestroy
   - DisposableBean.destroy()
   - destroy-method
```

### Q16: Spring事务传播机制？⭐⭐⭐⭐⭐

```java
// REQUIRED：默认，如果有事务就加入，没有就新建 ⭐⭐⭐⭐⭐
@Transactional(propagation = Propagation.REQUIRED)

// REQUIRES_NEW：总是新建事务
@Transactional(propagation = Propagation.REQUIRES_NEW)

// NESTED：嵌套事务
@Transactional(propagation = Propagation.NESTED)

// SUPPORTS：有事务就加入，没有就非事务执行
@Transactional(propagation = Propagation.SUPPORTS)
```

## 6. 数据库 ⭐⭐⭐⭐⭐

### Q17: MySQL索引原理？⭐⭐⭐⭐⭐

```
B+树索引：⭐⭐⭐⭐⭐
- 非叶子节点只存索引
- 叶子节点存数据，并且有指针连接
- 适合范围查询

聚簇索引 vs 非聚簇索引：
- 聚簇索引：叶子节点存完整数据（主键索引）
- 非聚簇索引：叶子节点存主键值（二级索引）
```

### Q18: 事务的ACID？⭐⭐⭐⭐⭐

```
A（Atomicity）原子性：全部成功或全部失败
C（Consistency）一致性：数据保持一致状态
I（Isolation）隔离性：事务之间互不干扰
D（Durability）持久性：提交后永久保存
```

### Q19: MySQL的隔离级别？⭐⭐⭐⭐⭐

```
1. READ UNCOMMITTED：读未提交
   - 问题：脏读、不可重复读、幻读

2. READ COMMITTED：读已提交
   - 问题：不可重复读、幻读
   - Oracle默认

3. REPEATABLE READ：可重复读 ⭐⭐⭐⭐⭐
   - 问题：幻读（MySQL通过MVCC解决）
   - MySQL默认

4. SERIALIZABLE：串行化
   - 无并发问题，但性能最低
```

## 7. 分布式 ⭐⭐⭐⭐⭐

### Q20: CAP理论？⭐⭐⭐⭐⭐

```
C（Consistency）一致性：所有节点数据一致
A（Availability）可用性：服务一直可用
P（Partition tolerance）分区容错性：网络分区时仍能工作

CAP不可能同时满足，只能选择两个：
- CP：一致性 + 分区容错（ZooKeeper）
- AP：可用性 + 分区容错（Eureka）⭐⭐⭐⭐⭐
```

### Q21: 分布式锁的实现？⭐⭐⭐⭐⭐

```java
// 1. Redis实现 ⭐⭐⭐⭐⭐
public boolean tryLock(String key, String value, long expireTime) {
    return redisTemplate.opsForValue()
        .setIfAbsent(key, value, expireTime, TimeUnit.SECONDS);
}

// 2. ZooKeeper实现
// 创建临时顺序节点，最小节点获得锁

// 3. 数据库实现
// 使用唯一索引或for update
```

### Q22: 如何保证接口幂等性？⭐⭐⭐⭐⭐

```
1. 唯一ID：每次请求带唯一ID，服务端去重
2. Token机制：先获取token，提交时验证
3. 数据库唯一索引：利用唯一约束
4. 状态机：订单状态只能单向流转
```

## 💡 面试技巧

1. **STAR法则**：Situation、Task、Action、Result
2. **先总后分**：先说结论，再说细节
3. **举例说明**：用实际项目经验举例
4. **诚实回答**：不会的不要瞎说

## 🎯 高频考点

1. HashMap底层原理 ⭐⭐⭐⭐⭐
2. JVM内存模型和GC ⭐⭐⭐⭐⭐
3. Spring IOC和AOP ⭐⭐⭐⭐⭐
4. MySQL索引和事务 ⭐⭐⭐⭐⭐
5. Redis缓存和分布式锁 ⭐⭐⭐⭐⭐
6. 线程池原理 ⭐⭐⭐⭐⭐
7. 分布式事务 ⭐⭐⭐⭐⭐

## 📚 下一步

- [算法与数据结构](./算法与数据结构.md)
- [系统设计](./系统设计.md)
- [项目实战](../06-项目实战/项目实战.md)

