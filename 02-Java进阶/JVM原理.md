# JVM原理与性能优化

## 📌 学习目标

- 理解JVM内存结构
- 掌握垃圾回收机制
- 了解类加载机制
- 掌握JVM调优方法

## ⭐ JVM架构概览

```
JVM架构
├── 类加载子系统
├── 运行时数据区
│   ├── 方法区（元空间） ⭐⭐⭐⭐⭐
│   ├── 堆（Heap） ⭐⭐⭐⭐⭐
│   ├── 虚拟机栈 ⭐⭐⭐⭐⭐
│   ├── 本地方法栈
│   └── 程序计数器
├── 执行引擎
└── 本地方法接口
```

## 1. JVM内存结构 ⭐⭐⭐⭐⭐

### 内存区域详解

```java
/**
 * JVM内存区域示例
 */
public class JVMMemoryDemo {
    // 1. 方法区（元空间）- 存储类信息、常量、静态变量 ⭐⭐⭐⭐⭐
    private static int staticVar = 100;  // 静态变量
    private static final String CONSTANT = "常量";  // 常量
    
    // 2. 堆（Heap）- 存储对象实例 ⭐⭐⭐⭐⭐
    private String name;  // 实例变量，对象在堆中
    
    public void method() {
        // 3. 虚拟机栈 - 存储局部变量、方法调用 ⭐⭐⭐⭐⭐
        int localVar = 10;  // 局部变量，在栈中
        String str = "hello";  // 引用在栈，对象在堆
        
        // 4. 程序计数器 - 记录当前线程执行的字节码行号
        // 5. 本地方法栈 - native方法使用
    }
    
    public static void main(String[] args) {
        // 创建对象，在堆中分配内存
        JVMMemoryDemo demo = new JVMMemoryDemo();
        demo.method();
    }
}
```

### 堆内存结构 ⭐⭐⭐⭐⭐

```
堆内存（Heap）
├── 新生代（Young Generation）1/3
│   ├── Eden区 8/10 ⭐⭐⭐⭐⭐
│   ├── Survivor0(From) 1/10
│   └── Survivor1(To) 1/10
└── 老年代（Old Generation）2/3 ⭐⭐⭐⭐⭐
```

```java
/**
 * 堆内存分配示例
 */
public class HeapDemo {
    public static void main(String[] args) {
        // 新对象在Eden区分配
        byte[] arr1 = new byte[1024 * 1024];  // 1MB
        
        // Minor GC后，存活对象移到Survivor区
        byte[] arr2 = new byte[1024 * 1024];
        
        // 经过多次GC后，存活对象进入老年代
        // 或者大对象直接进入老年代
        byte[] bigArray = new byte[5 * 1024 * 1024];  // 5MB
        
        // JVM参数示例：
        // -Xms512m    初始堆大小
        // -Xmx1024m   最大堆大小
        // -Xmn256m    新生代大小
        // -XX:SurvivorRatio=8   Eden:Survivor = 8:1
    }
}
```

## 2. 垃圾回收（GC） ⭐⭐⭐⭐⭐

### 垃圾判定算法

```java
/**
 * 引用计数法 vs 可达性分析 ⭐⭐⭐⭐⭐
 */
public class GCAlgorithmDemo {
    private Object instance;
    
    public static void main(String[] args) {
        // 可达性分析：从GC Roots开始遍历
        // GC Roots包括：
        // 1. 虚拟机栈中的引用
        // 2. 方法区中的静态变量引用
        // 3. 方法区中的常量引用
        // 4. 本地方法栈中的引用
        
        GCAlgorithmDemo obj1 = new GCAlgorithmDemo();  // 可达
        GCAlgorithmDemo obj2 = new GCAlgorithmDemo();  // 可达
        
        obj1.instance = obj2;
        obj2.instance = obj1;
        
        obj1 = null;
        obj2 = null;
        
        // 此时obj1和obj2不可达，会被回收
        // 引用计数法会出现循环引用问题，但可达性分析不会
        
        System.gc();  // 建议JVM进行垃圾回收
    }
}
```

### 引用类型 ⭐⭐⭐⭐⭐

```java
import java.lang.ref.*;

/**
 * Java四种引用类型 ⭐⭐⭐⭐⭐
 */
public class ReferenceDemo {
    public static void main(String[] args) {
        // 1. 强引用（Strong Reference）- 永不回收 ⭐⭐⭐⭐⭐
        String strongRef = new String("强引用");
        // 只要强引用存在，永不回收
        
        // 2. 软引用（Soft Reference）- 内存不足时回收 ⭐⭐⭐⭐
        SoftReference<String> softRef = new SoftReference<>(new String("软引用"));
        System.out.println("软引用：" + softRef.get());
        // 适用场景：缓存
        
        // 3. 弱引用（Weak Reference）- GC时回收 ⭐⭐⭐⭐
        WeakReference<String> weakRef = new WeakReference<>(new String("弱引用"));
        System.out.println("弱引用：" + weakRef.get());
        System.gc();
        System.out.println("GC后：" + weakRef.get());  // null
        // 适用场景：WeakHashMap
        
        // 4. 虚引用（Phantom Reference）- 无法通过引用获取对象 ⭐⭐⭐
        ReferenceQueue<String> queue = new ReferenceQueue<>();
        PhantomReference<String> phantomRef = new PhantomReference<>(
            new String("虚引用"), queue
        );
        System.out.println("虚引用：" + phantomRef.get());  // null
        // 适用场景：跟踪对象回收
    }
}
```

### 垃圾回收器 ⭐⭐⭐⭐⭐

```java
/**
 * 常见垃圾回收器
 * 
 * 1. Serial GC - 单线程 ⭐⭐⭐
 *    -XX:+UseSerialGC
 * 
 * 2. Parallel GC - 多线程，吞吐量优先 ⭐⭐⭐⭐
 *    -XX:+UseParallelGC
 * 
 * 3. CMS GC - 并发标记清除，停顿时间短 ⭐⭐⭐⭐
 *    -XX:+UseConcMarkSweepGC
 * 
 * 4. G1 GC - 分代收集，可预测停顿 ⭐⭐⭐⭐⭐ (Java 9+默认)
 *    -XX:+UseG1GC
 * 
 * 5. ZGC - 低延迟（Java 11+） ⭐⭐⭐⭐⭐
 *    -XX:+UseZGC
 * 
 * 6. Shenandoah GC - 低停顿时间 ⭐⭐⭐⭐
 *    -XX:+UseShenandoahGC
 */
public class GarbageCollectorDemo {
    public static void main(String[] args) {
        // 查看当前使用的垃圾回收器
        System.out.println("垃圾回收器：" + 
            System.getProperty("java.vm.name"));
        
        // GC日志参数
        // -XX:+PrintGCDetails      打印GC详情
        // -XX:+PrintGCDateStamps   打印GC时间戳
        // -Xloggc:gc.log          GC日志文件
        
        // 触发GC
        System.gc();  // Full GC
    }
}
```

## 3. 类加载机制 ⭐⭐⭐⭐⭐

### 类加载过程

```
类加载过程：
加载（Loading） → 验证（Verification） → 准备（Preparation） 
→ 解析（Resolution） → 初始化（Initialization）
```

```java
/**
 * 类加载过程示例 ⭐⭐⭐⭐⭐
 */
public class ClassLoadingDemo {
    // 1. 准备阶段：分配内存，设置默认值
    private static int value = 100;  // 准备阶段value=0，初始化阶段value=100
    
    // 2. 初始化阶段：执行静态代码块和静态变量赋值
    static {
        System.out.println("静态代码块执行");
        value = 200;
    }
    
    public static void main(String[] args) {
        System.out.println("value = " + value);  // 200
        
        // 类的主动引用（会触发初始化）：
        // 1. new对象
        // 2. 访问静态变量或方法
        // 3. 反射调用
        // 4. 初始化子类
        // 5. main方法所在类
        
        // 类的被动引用（不会触发初始化）：
        // 1. 引用静态常量
        // 2. 通过数组定义引用
        // 3. 引用父类静态变量
    }
}
```

### 类加载器 ⭐⭐⭐⭐⭐

```java
/**
 * 类加载器层次结构 ⭐⭐⭐⭐⭐
 */
public class ClassLoaderDemo {
    public static void main(String[] args) {
        // 1. 启动类加载器（Bootstrap ClassLoader）
        //    加载Java核心库（rt.jar）
        System.out.println("String的类加载器：" + 
            String.class.getClassLoader());  // null（由C++实现）
        
        // 2. 扩展类加载器（Extension ClassLoader）
        //    加载ext目录下的类
        
        // 3. 应用类加载器（Application ClassLoader）⭐⭐⭐⭐⭐
        //    加载classpath下的类
        System.out.println("当前类的类加载器：" + 
            ClassLoaderDemo.class.getClassLoader());
        
        // 双亲委派模型 ⭐⭐⭐⭐⭐
        // 类加载器收到加载请求时，先委托给父加载器
        // 父加载器无法加载时，才自己加载
        
        // 获取类加载器
        ClassLoader classLoader = ClassLoaderDemo.class.getClassLoader();
        System.out.println("类加载器：" + classLoader);
        System.out.println("父加载器：" + classLoader.getParent());
        System.out.println("父父加载器：" + classLoader.getParent().getParent());
    }
}
```

## 4. JVM参数调优 ⭐⭐⭐⭐⭐

### 常用JVM参数

```bash
# 堆内存设置 ⭐⭐⭐⭐⭐
-Xms2g                  # 初始堆大小2GB
-Xmx4g                  # 最大堆大小4GB
-Xmn1g                  # 新生代大小1GB
-XX:MetaspaceSize=256m  # 元空间初始大小
-XX:MaxMetaspaceSize=512m  # 元空间最大大小

# 新生代配置 ⭐⭐⭐⭐
-XX:SurvivorRatio=8     # Eden:Survivor=8:1
-XX:NewRatio=2          # 老年代:新生代=2:1

# 栈内存 ⭐⭐⭐⭐
-Xss1m                  # 每个线程栈大小1MB

# 垃圾回收器选择 ⭐⭐⭐⭐⭐
-XX:+UseG1GC            # 使用G1垃圾回收器（推荐）
-XX:MaxGCPauseMillis=200  # 最大GC停顿时间
-XX:G1HeapRegionSize=16m  # G1 Region大小

# GC日志 ⭐⭐⭐⭐⭐
-XX:+PrintGCDetails     # 打印GC详细信息
-XX:+PrintGCDateStamps  # 打印GC时间戳
-Xloggc:logs/gc.log     # GC日志文件

# OOM时导出堆转储 ⭐⭐⭐⭐⭐
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=logs/heapdump.hprof

# 性能优化 ⭐⭐⭐⭐
-XX:+UseTLAB            # 使用线程本地分配缓冲
-XX:+DisableExplicitGC  # 禁用System.gc()
```

### JVM调优示例

```java
/**
 * JVM调优案例
 */
public class JVMTuningDemo {
    public static void main(String[] args) {
        // 启动参数示例：
        // java -Xms2g -Xmx4g -Xmn1g -XX:+UseG1GC 
        //      -XX:MaxGCPauseMillis=200 
        //      -XX:+PrintGCDetails 
        //      -Xloggc:gc.log 
        //      JVMTuningDemo
        
        // 1. 查看运行时内存信息 ⭐⭐⭐⭐⭐
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / 1024 / 1024;
        long totalMemory = runtime.totalMemory() / 1024 / 1024;
        long freeMemory = runtime.freeMemory() / 1024 / 1024;
        
        System.out.println("最大内存：" + maxMemory + "MB");
        System.out.println("总内存：" + totalMemory + "MB");
        System.out.println("空闲内存：" + freeMemory + "MB");
        System.out.println("已用内存：" + (totalMemory - freeMemory) + "MB");
        
        // 2. 模拟内存占用
        byte[] data = new byte[10 * 1024 * 1024];  // 10MB
        
        System.out.println("\n分配10MB后：");
        System.out.println("空闲内存：" + runtime.freeMemory() / 1024 / 1024 + "MB");
        
        // 3. 触发GC
        data = null;
        System.gc();
        
        System.out.println("\nGC后：");
        System.out.println("空闲内存：" + runtime.freeMemory() / 1024 / 1024 + "MB");
    }
}
```

## 5. 内存泄漏与分析 ⭐⭐⭐⭐⭐

### 常见内存泄漏场景

```java
import java.util.*;

/**
 * 内存泄漏示例 ⭐⭐⭐⭐⭐
 */
public class MemoryLeakDemo {
    // 1. 静态集合持有对象引用 ⭐⭐⭐⭐⭐
    private static List<Object> list = new ArrayList<>();
    
    public void leak1() {
        // 对象不断添加到静态集合，永不释放
        list.add(new byte[1024 * 1024]);  // 1MB
    }
    
    // 2. 未关闭的资源 ⭐⭐⭐⭐⭐
    public void leak2() {
        // 数据库连接、文件流等未关闭
        // 应使用try-with-resources
    }
    
    // 3. 监听器未移除 ⭐⭐⭐⭐
    public void leak3() {
        // 添加监听器后未移除
    }
    
    // 4. ThreadLocal未清理 ⭐⭐⭐⭐⭐
    private static ThreadLocal<List<String>> threadLocal = new ThreadLocal<>();
    
    public void leak4() {
        threadLocal.set(new ArrayList<>());
        // 使用线程池时，ThreadLocal未清理会导致内存泄漏
        // 应在finally中调用 threadLocal.remove();
    }
    
    // 5. 内部类持有外部类引用 ⭐⭐⭐⭐
    class InnerClass {
        // 非静态内部类持有外部类引用
        // 如果内部类生命周期长于外部类，会导致泄漏
    }
    
    public static void main(String[] args) {
        MemoryLeakDemo demo = new MemoryLeakDemo();
        
        // 模拟内存泄漏
        for (int i = 0; i < 1000; i++) {
            demo.leak1();
        }
        
        System.out.println("添加了 " + list.size() + " 个对象");
    }
}
```

### 内存分析工具 ⭐⭐⭐⭐⭐

```bash
# 1. jps - 查看Java进程
jps -l

# 2. jstat - 监控JVM统计信息 ⭐⭐⭐⭐⭐
jstat -gc <pid> 1000    # 每秒显示GC信息
jstat -gcutil <pid>     # GC统计汇总

# 3. jmap - 内存映像工具 ⭐⭐⭐⭐⭐
jmap -heap <pid>        # 查看堆信息
jmap -histo <pid>       # 查看对象统计
jmap -dump:format=b,file=heap.bin <pid>  # 导出堆转储

# 4. jstack - 线程快照 ⭐⭐⭐⭐⭐
jstack <pid>            # 查看线程栈信息
jstack -l <pid>         # 包含锁信息

# 5. jinfo - 查看JVM参数 ⭐⭐⭐⭐
jinfo <pid>             # 查看所有参数
jinfo -flags <pid>      # 查看JVM参数

# 6. 图形化工具
# - JVisualVM（推荐） ⭐⭐⭐⭐⭐
# - JConsole ⭐⭐⭐⭐
# - Eclipse MAT（内存分析） ⭐⭐⭐⭐⭐
```

## 💡 重点总结

### JVM调优原则 ⭐⭐⭐⭐⭐

1. **先优化代码** - 代码优化比JVM调优更重要
2. **监控先行** - 先监控再调优，有数据支撑
3. **小步快走** - 每次只调整一个参数
4. **合理设置堆大小** - Xms和Xmx设置相同，避免扩容
5. **选择合适的GC** - G1适合大堆，ZGC适合低延迟

### 性能优化建议 ⭐⭐⭐⭐⭐

```java
// 1. 对象复用
// ❌ 不推荐
for (int i = 0; i < 10000; i++) {
    String str = new String("test");  // 频繁创建对象
}

// ✅ 推荐
String str = "test";  // 字符串常量池

// 2. 使用StringBuilder
// ❌ 不推荐
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // 每次创建新String
}

// ✅ 推荐
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}

// 3. 及时释放资源
// ✅ 推荐
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 使用资源
} // 自动关闭
```

### 故障排查步骤 ⭐⭐⭐⭐⭐

1. **CPU过高**：jstack查看线程，找出耗CPU的线程
2. **内存溢出**：jmap导出堆转储，MAT分析
3. **GC频繁**：查看GC日志，调整堆大小
4. **响应慢**：jstack查看线程状态，是否死锁

## 🎯 学习建议

1. 理解JVM内存模型
2. 掌握垃圾回收原理
3. 熟练使用诊断工具
4. 实践调优案例
5. 阅读JVM规范

## 📚 下一步

学习完JVM原理后，继续学习 [函数式编程](./函数式编程.md)

