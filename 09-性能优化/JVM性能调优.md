# JVM性能调优

## 📌 学习目标

- 深入理解JVM内存模型和垃圾回收机制
- 掌握JVM性能分析工具的使用
- 学会JVM参数调优的方法
- 掌握常见JVM问题的排查和解决
- 理解GC调优的策略和实践

## ⭐ 学习建议

**适合学习阶段**：完成JVM原理学习后 ⭐⭐⭐⭐⭐

**前置知识**：
- JVM原理 ⭐⭐⭐⭐⭐
- 多线程并发 ⭐⭐⭐⭐
- Linux基础命令 ⭐⭐⭐⭐

## 1. JVM内存模型回顾 ⭐⭐⭐⭐⭐

### JVM内存结构

```
┌─────────────────────────────────────────┐
│            JVM内存结构                   │
├─────────────────────────────────────────┤
│  线程私有区域：                          │
│  ├── 程序计数器（Program Counter）       │
│  ├── 虚拟机栈（VM Stack）                │
│  └── 本地方法栈（Native Method Stack）  │
├─────────────────────────────────────────┤
│  线程共享区域：                          │
│  ├── 堆（Heap）                          │
│  │   ├── 新生代（Young Generation）      │
│  │   │   ├── Eden区                     │
│  │   │   ├── Survivor0区（From）        │
│  │   │   └── Survivor1区（To）          │
│  │   └── 老年代（Old Generation）        │
│  ├── 方法区（Method Area）               │
│  │   └── 运行时常量池                    │
│  └── 直接内存（Direct Memory）           │
└─────────────────────────────────────────┘
```

### 堆内存分代模型

```
堆内存默认比例：
新生代:老年代 = 1:2
Eden:Survivor0:Survivor1 = 8:1:1

对象分配流程：
1. 新对象优先在Eden区分配
2. Eden区满时触发Minor GC
3. 存活对象移到Survivor区
4. Survivor区对象年龄+1
5. 年龄达到15（默认）晋升到老年代
6. 大对象直接进入老年代
7. 老年代满时触发Full GC
```

## 2. 垃圾回收器详解 ⭐⭐⭐⭐⭐

### 常见垃圾回收器对比

| GC类型 | 特点 | 适用场景 | STW时间 |
|--------|------|---------|---------|
| **Serial GC** | 单线程、简单 | 客户端应用 | 长 |
| **Parallel GC** | 多线程、吞吐量优先 | 后台计算 | 中 |
| **CMS GC** | 并发、停顿时间短 | 互联网应用 | 短 |
| **G1 GC** | 分区、可预测停顿 | 大内存应用 | 可控 |
| **ZGC** | 超低延迟、TB级内存 | 低延迟应用 | 极短 |
| **Shenandoah GC** | 并发、低延迟 | 低延迟应用 | 极短 |

### G1 GC详解（推荐）

```
G1 GC特点：
1. 分区（Region）设计
   - 将堆划分为多个大小相等的Region
   - 每个Region可以是Eden、Survivor、Old
   - 灵活分配，避免内存碎片

2. 可预测的停顿时间
   - 可以设置期望的停顿时间
   - G1会尽量满足停顿时间目标
   - 通过-XX:MaxGCPauseMillis设置

3. 并发标记
   - 大部分工作并发进行
   - 减少STW时间
   - 提高应用响应性

4. 增量回收
   - 不需要一次回收整个堆
   - 优先回收价值最大的Region
   - 提高回收效率

G1 GC适用场景：
✅ 堆内存 > 6GB
✅ 需要可预测的停顿时间
✅ 互联网应用、微服务
✅ Java 9+推荐使用
```

### ZGC详解（Java 11+）

```
ZGC特点：
1. 超低延迟
   - STW时间 < 10ms
   - 不随堆大小增加而增加
   - 适合低延迟场景

2. 支持TB级内存
   - 支持8MB - 16TB堆内存
   - 适合大内存应用

3. 并发回收
   - 几乎所有工作并发进行
   - 应用线程几乎不受影响

4. 着色指针
   - 使用64位指针的部分位存储元数据
   - 实现并发标记和重定位

ZGC适用场景：
✅ 对延迟极度敏感的应用
✅ 大内存应用（> 100GB）
✅ 金融交易系统
✅ 实时数据处理
```

## 3. JVM参数调优 ⭐⭐⭐⭐⭐

### 核心JVM参数

```bash
# 1. 堆内存设置
-Xms4g                    # 初始堆大小4GB
-Xmx4g                    # 最大堆大小4GB（建议与Xms相同，避免动态扩容）
-Xmn2g                    # 新生代大小2GB
-XX:MetaspaceSize=256m    # 元空间初始大小
-XX:MaxMetaspaceSize=512m # 元空间最大大小

# 2. 垃圾回收器选择
-XX:+UseG1GC              # 使用G1垃圾回收器（推荐）
-XX:MaxGCPauseMillis=200  # 期望最大停顿时间200ms
-XX:G1HeapRegionSize=16m  # G1 Region大小16MB

# 3. GC日志配置（Java 9+）
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags
-Xlog:gc*:file=/var/log/gc.log::filecount=10,filesize=100M

# 4. OOM时自动dump
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heapdump.hprof

# 5. 性能优化参数
-XX:+UseStringDeduplication  # 字符串去重（G1 GC）
-XX:+ParallelRefProcEnabled  # 并行处理引用
-XX:+AlwaysPreTouch          # 启动时预分配内存
```

### 不同场景的JVM参数配置

**场景1：高吞吐量应用（批处理、大数据）**

```bash
java -Xms8g -Xmx8g \
     -XX:+UseParallelGC \
     -XX:ParallelGCThreads=8 \
     -XX:+UseAdaptiveSizePolicy \
     -jar app.jar
```

**场景2：低延迟应用（Web应用、微服务）**

```bash
java -Xms4g -Xmx4g \
     -Xmn2g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:G1HeapRegionSize=16m \
     -XX:+ParallelRefProcEnabled \
     -XX:+UseStringDeduplication \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/heapdump.hprof \
     -Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags \
     -jar app.jar
```

**场景3：超低延迟应用（金融交易）**

```bash
java -Xms16g -Xmx16g \
     -XX:+UseZGC \
     -XX:+UnlockExperimentalVMOptions \
     -XX:ZCollectionInterval=5 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/var/log/heapdump.hprof \
     -Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags \
     -jar app.jar
```

## 4. JVM性能分析工具 ⭐⭐⭐⭐⭐

### 命令行工具

```bash
# 1. jps - 查看Java进程
jps -lvm

# 2. jstat - 查看JVM统计信息
jstat -gc <pid> 1000 10        # 每秒输出GC信息，共10次
jstat -gcutil <pid> 1000       # 查看GC百分比
jstat -gccause <pid>           # 查看GC原因

# 3. jmap - 内存映像工具
jmap -heap <pid>               # 查看堆内存信息
jmap -histo <pid>              # 查看对象统计信息
jmap -dump:format=b,file=heap.hprof <pid>  # dump堆内存

# 4. jstack - 线程堆栈工具
jstack <pid>                   # 查看线程堆栈
jstack -l <pid>                # 查看锁信息

# 5. jinfo - 配置信息工具
jinfo -flags <pid>             # 查看JVM参数
jinfo -flag MaxHeapSize <pid>  # 查看特定参数

# 6. jcmd - 多功能命令工具
jcmd <pid> VM.flags            # 查看JVM参数
jcmd <pid> GC.heap_info        # 查看堆信息
jcmd <pid> Thread.print        # 打印线程堆栈
jcmd <pid> GC.run              # 手动触发GC
```

### 图形化工具

```
1. JVisualVM（推荐）
   - JDK自带，功能强大
   - 实时监控CPU、内存、线程
   - 支持插件扩展
   - 可以分析堆dump文件

2. JProfiler（商业）
   - 功能最强大的性能分析工具
   - CPU分析、内存分析、线程分析
   - 支持远程监控
   - 收费软件

3. Arthas（阿里开源）
   - 在线诊断工具
   - 无需重启应用
   - 支持热更新
   - 功能强大

4. MAT（Memory Analyzer Tool）
   - 专业的堆dump分析工具
   - 自动分析内存泄漏
   - 生成分析报告
   - Eclipse基金会开源
```

### Arthas使用示例

```bash
# 1. 启动Arthas
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar

# 2. 查看JVM信息
dashboard          # 实时仪表盘
jvm                # JVM信息
thread             # 线程信息
thread -n 3        # 查看CPU占用最高的3个线程
thread <tid>       # 查看特定线程堆栈

# 3. 监控方法调用
monitor -c 5 com.example.UserService getUserById  # 监控方法调用统计
watch com.example.UserService getUserById "{params,returnObj}" -x 2  # 观察方法参数和返回值
trace com.example.UserService getUserById  # 追踪方法调用路径

# 4. 内存分析
heapdump /tmp/heap.hprof  # dump堆内存
memory                     # 查看内存信息

# 5. 热更新代码（慎用）
redefine /tmp/UserService.class  # 热更新类
```

## 5. 常见JVM问题排查 ⭐⭐⭐⭐⭐

### 问题1：内存泄漏

**现象**：
```
- 内存持续增长
- Full GC频繁但内存不下降
- 最终OOM
```

**排查步骤**：

```bash
# 1. dump堆内存
jmap -dump:format=b,file=heap.hprof <pid>

# 2. 使用MAT分析
# - 打开heap.hprof文件
# - 查看Leak Suspects Report
# - 分析Dominator Tree
# - 找到占用内存最大的对象

# 3. 常见内存泄漏原因
# - 静态集合类持有对象引用
# - 监听器未注销
# - 数据库连接未关闭
# - ThreadLocal未清理
# - 缓存无限增长
```

**代码示例**：

```java
// 内存泄漏示例1：静态集合
public class MemoryLeakExample {
    private static List<Object> list = new ArrayList<>();
    
    public void addObject(Object obj) {
        list.add(obj);  // 对象永远不会被回收
    }
}

// 修复方案：使用WeakHashMap或定期清理
public class MemoryLeakFixed {
    private static Map<Object, Object> cache = new WeakHashMap<>();
    
    public void addObject(Object key, Object value) {
        cache.put(key, value);  // 弱引用，可以被GC回收
    }
}

// 内存泄漏示例2：ThreadLocal未清理
public class ThreadLocalLeak {
    private static ThreadLocal<byte[]> threadLocal = new ThreadLocal<>();
    
    public void process() {
        threadLocal.set(new byte[1024 * 1024]);  // 1MB
        // 忘记清理
    }
}

// 修复方案：使用try-finally清理
public class ThreadLocalFixed {
    private static ThreadLocal<byte[]> threadLocal = new ThreadLocal<>();
    
    public void process() {
        try {
            threadLocal.set(new byte[1024 * 1024]);
            // 业务逻辑
        } finally {
            threadLocal.remove();  // 清理ThreadLocal
        }
    }
}
```

### 问题2：CPU占用过高

**排查步骤**：

```bash
# 1. 找到占用CPU最高的Java进程
top

# 2. 找到占用CPU最高的线程
top -Hp <pid>

# 3. 将线程ID转换为16进制
printf "%x\n" <tid>

# 4. 查看线程堆栈
jstack <pid> | grep <tid_hex> -A 50

# 5. 分析线程堆栈，定位问题代码
```

**常见原因**：
```
- 死循环
- 正则表达式回溯
- 频繁GC
- 大量线程竞争
```

### 问题3：频繁Full GC

**现象**：
```
- Full GC频繁（每分钟多次）
- 应用响应变慢
- CPU占用高
```

**排查步骤**：

```bash
# 1. 查看GC日志
jstat -gcutil <pid> 1000

# 2. 分析GC原因
jstat -gccause <pid>

# 3. 查看堆内存使用情况
jmap -heap <pid>

# 4. dump堆内存分析
jmap -dump:format=b,file=heap.hprof <pid>
```

**常见原因**：
```
- 老年代空间不足
- 元空间不足
- 大对象频繁创建
- 内存泄漏
- 堆内存设置过小
```

**优化方案**：
```
1. 增大堆内存
   -Xms8g -Xmx8g

2. 调整新生代大小
   -Xmn4g

3. 使用G1 GC
   -XX:+UseG1GC -XX:MaxGCPauseMillis=200

4. 优化代码，减少对象创建
   - 使用对象池
   - 复用对象
   - 使用StringBuilder
```

## 💡 最佳实践

### JVM调优步骤

```
1. 收集基线数据
   - 记录当前性能指标
   - 记录当前JVM参数
   - 记录GC日志

2. 分析性能瓶颈
   - 分析GC日志
   - 分析堆dump
   - 分析线程dump

3. 制定优化方案
   - 调整JVM参数
   - 优化代码
   - 优化架构

4. 验证优化效果
   - 压力测试
   - 对比性能指标
   - 持续监控

5. 持续优化
   - 定期review
   - 持续监控
   - 及时调整
```

### JVM调优原则

```
1. 不要过早优化
   - 先保证功能正确
   - 再考虑性能优化

2. 基于数据优化
   - 收集性能数据
   - 分析瓶颈
   - 针对性优化

3. 小步快跑
   - 每次只调整一个参数
   - 观察效果
   - 记录结果

4. 权衡取舍
   - 吞吐量 vs 延迟
   - 内存 vs CPU
   - 复杂度 vs 性能

5. 持续监控
   - 生产环境监控
   - 及时发现问题
   - 快速响应
```

## 🎯 实战练习

### 练习1：分析GC日志

**任务**：
1. 启动应用并开启GC日志
2. 运行压力测试
3. 分析GC日志，找出问题
4. 调整JVM参数优化

### 练习2：排查内存泄漏

**场景**：
- 应用运行一段时间后OOM
- Full GC频繁但内存不下降

**任务**：
1. dump堆内存
2. 使用MAT分析
3. 找出内存泄漏原因
4. 修复代码

## 📚 下一步学习

- [数据库性能优化](./数据库性能优化.md)
- [缓存架构设计](./缓存架构设计.md)
- [高并发系统设计](./高并发系统设计.md)

---

**恭喜你完成了JVM性能调优的学习！** 🎉

JVM调优是高级工程师的必备技能。继续学习，不断实践！

