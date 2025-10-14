# Java IO与NIO

## 📌 学习目标

- 理解IO流的概念和分类
- 掌握常用IO类的使用
- 理解NIO的核心概念
- 掌握文件操作最佳实践

## ⭐ IO体系结构

```
IO流分类：
├── 按方向分
│   ├── 输入流（InputStream/Reader）
│   └── 输出流（OutputStream/Writer）
│
├── 按数据类型分
│   ├── 字节流（Stream） ⭐⭐⭐⭐⭐
│   └── 字符流（Reader/Writer） ⭐⭐⭐⭐⭐
│
└── 按功能分
    ├── 节点流（直接操作数据源）
    └── 处理流（对其他流进行包装）
```

## 1. 字节流 ⭐⭐⭐⭐⭐

### FileInputStream和FileOutputStream

```java
import java.io.*;

public class ByteStreamDemo {
    /**
     * 文件复制（字节流） ⭐⭐⭐⭐⭐
     */
    public static void copyFile(String src, String dest) throws IOException {
        // 使用try-with-resources自动关闭流
        try (FileInputStream fis = new FileInputStream(src);
             FileOutputStream fos = new FileOutputStream(dest)) {
            
            byte[] buffer = new byte[1024];  // 缓冲区
            int len;
            
            while ((len = fis.read(buffer)) != -1) {
                fos.write(buffer, 0, len);
            }
            
            System.out.println("文件复制成功！");
        }
    }
    
    /**
     * 读取文件内容
     */
    public static void readFile(String fileName) throws IOException {
        try (FileInputStream fis = new FileInputStream(fileName)) {
            int data;
            while ((data = fis.read()) != -1) {
                System.out.print((char) data);
            }
        }
    }
    
    /**
     * 写入文件
     */
    public static void writeFile(String fileName, String content) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(fileName)) {
            fos.write(content.getBytes());
            System.out.println("写入成功！");
        }
    }
    
    public static void main(String[] args) {
        try {
            writeFile("test.txt", "Hello, Java IO!");
            readFile("test.txt");
            copyFile("test.txt", "test_copy.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### BufferedInputStream和BufferedOutputStream ⭐⭐⭐⭐⭐

```java
import java.io.*;

public class BufferedStreamDemo {
    /**
     * 高效文件复制（使用缓冲流） ⭐⭐⭐⭐⭐
     */
    public static void copyFileBuffered(String src, String dest) throws IOException {
        try (BufferedInputStream bis = new BufferedInputStream(
                new FileInputStream(src));
             BufferedOutputStream bos = new BufferedOutputStream(
                new FileOutputStream(dest))) {
            
            byte[] buffer = new byte[8192];  // 8KB缓冲区
            int len;
            
            while ((len = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, len);
            }
            
            System.out.println("高效复制完成！");
        }
    }
    
    public static void main(String[] args) {
        try {
            long start = System.currentTimeMillis();
            copyFileBuffered("large_file.dat", "large_file_copy.dat");
            long end = System.currentTimeMillis();
            System.out.println("耗时：" + (end - start) + "ms");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 2. 字符流 ⭐⭐⭐⭐⭐

### FileReader和FileWriter

```java
import java.io.*;

public class CharStreamDemo {
    /**
     * 读取文本文件 ⭐⭐⭐⭐⭐
     */
    public static void readTextFile(String fileName) throws IOException {
        try (FileReader fr = new FileReader(fileName)) {
            int data;
            while ((data = fr.read()) != -1) {
                System.out.print((char) data);
            }
        }
    }
    
    /**
     * 写入文本文件
     */
    public static void writeTextFile(String fileName, String content) throws IOException {
        try (FileWriter fw = new FileWriter(fileName)) {
            fw.write(content);
            System.out.println("文本写入成功！");
        }
    }
    
    /**
     * 追加内容
     */
    public static void appendToFile(String fileName, String content) throws IOException {
        try (FileWriter fw = new FileWriter(fileName, true)) {  // true表示追加
            fw.write(content);
        }
    }
    
    public static void main(String[] args) {
        try {
            writeTextFile("demo.txt", "第一行内容\n");
            appendToFile("demo.txt", "追加的内容\n");
            readTextFile("demo.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### BufferedReader和BufferedWriter ⭐⭐⭐⭐⭐

```java
import java.io.*;

public class BufferedCharStreamDemo {
    /**
     * 按行读取文件（推荐） ⭐⭐⭐⭐⭐
     */
    public static void readFileByLine(String fileName) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            int lineNumber = 1;
            
            while ((line = br.readLine()) != null) {
                System.out.println(lineNumber + ": " + line);
                lineNumber++;
            }
        }
    }
    
    /**
     * 按行写入文件 ⭐⭐⭐⭐⭐
     */
    public static void writeFileByLine(String fileName, String[] lines) throws IOException {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(fileName))) {
            for (String line : lines) {
                bw.write(line);
                bw.newLine();  // 换行
            }
            System.out.println("写入完成！");
        }
    }
    
    /**
     * 文本文件复制
     */
    public static void copyTextFile(String src, String dest) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(src));
             BufferedWriter bw = new BufferedWriter(new FileWriter(dest))) {
            
            String line;
            while ((line = br.readLine()) != null) {
                bw.write(line);
                bw.newLine();
            }
        }
    }
    
    public static void main(String[] args) {
        try {
            String[] lines = {"Java IO学习", "BufferedReader很好用", "推荐使用"};
            writeFileByLine("notes.txt", lines);
            
            System.out.println("文件内容：");
            readFileByLine("notes.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 3. 对象流（序列化）⭐⭐⭐⭐⭐

### Serializable接口

```java
import java.io.*;

/**
 * 学生类（可序列化） ⭐⭐⭐⭐⭐
 */
class Student implements Serializable {
    private static final long serialVersionUID = 1L;  // 版本号
    
    private String name;
    private int age;
    private transient String password;  // transient: 不序列化
    
    public Student(String name, int age, String password) {
        this.name = name;
        this.age = age;
        this.password = password;
    }
    
    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + 
               ", password='" + password + "'}";
    }
}

public class SerializationDemo {
    /**
     * 序列化对象 ⭐⭐⭐⭐⭐
     */
    public static void serializeObject(String fileName, Object obj) throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream(fileName))) {
            oos.writeObject(obj);
            System.out.println("对象序列化成功！");
        }
    }
    
    /**
     * 反序列化对象 ⭐⭐⭐⭐⭐
     */
    public static Object deserializeObject(String fileName) 
            throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream(fileName))) {
            return ois.readObject();
        }
    }
    
    public static void main(String[] args) {
        try {
            // 序列化
            Student student = new Student("张三", 20, "123456");
            System.out.println("原始对象：" + student);
            serializeObject("student.dat", student);
            
            // 反序列化
            Student loaded = (Student) deserializeObject("student.dat");
            System.out.println("反序列化对象：" + loaded);
            
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}
```

## 4. Files类（Java 7+，推荐）⭐⭐⭐⭐⭐

### 现代文件操作

```java
import java.nio.file.*;
import java.io.IOException;
import java.util.List;
import java.util.stream.Stream;

public class FilesDemo {
    public static void main(String[] args) {
        try {
            // 1. 读取所有行（小文件） ⭐⭐⭐⭐⭐
            List<String> lines = Files.readAllLines(Paths.get("demo.txt"));
            lines.forEach(System.out::println);
            
            // 2. 写入文件（推荐） ⭐⭐⭐⭐⭐
            String content = "使用Files类写入文件\n非常简洁！";
            Files.write(Paths.get("output.txt"), content.getBytes());
            
            // 3. 复制文件 ⭐⭐⭐⭐⭐
            Files.copy(
                Paths.get("source.txt"), 
                Paths.get("target.txt"),
                StandardCopyOption.REPLACE_EXISTING  // 替换已存在文件
            );
            
            // 4. 移动文件 ⭐⭐⭐⭐
            Files.move(
                Paths.get("old.txt"), 
                Paths.get("new.txt"),
                StandardCopyOption.REPLACE_EXISTING
            );
            
            // 5. 删除文件 ⭐⭐⭐⭐
            Files.deleteIfExists(Paths.get("temp.txt"));
            
            // 6. 创建目录 ⭐⭐⭐⭐⭐
            Files.createDirectories(Paths.get("data/backup/2024"));
            
            // 7. 检查文件 ⭐⭐⭐⭐⭐
            Path path = Paths.get("demo.txt");
            System.out.println("文件是否存在：" + Files.exists(path));
            System.out.println("是否是文件：" + Files.isRegularFile(path));
            System.out.println("是否是目录：" + Files.isDirectory(path));
            System.out.println("文件大小：" + Files.size(path) + " bytes");
            
            // 8. 遍历目录（推荐） ⭐⭐⭐⭐⭐
            System.out.println("\n当前目录下的文件：");
            try (Stream<Path> paths = Files.list(Paths.get("."))) {
                paths.filter(Files::isRegularFile)
                     .forEach(System.out::println);
            }
            
            // 9. 递归遍历目录树 ⭐⭐⭐⭐
            System.out.println("\n递归遍历：");
            try (Stream<Path> paths = Files.walk(Paths.get("."))) {
                paths.filter(Files::isRegularFile)
                     .filter(p -> p.toString().endsWith(".java"))
                     .forEach(System.out::println);
            }
            
            // 10. 读取大文件（逐行处理） ⭐⭐⭐⭐⭐
            try (Stream<String> stream = Files.lines(Paths.get("large_file.txt"))) {
                stream.filter(line -> line.contains("关键词"))
                      .forEach(System.out::println);
            }
            
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 5. NIO核心概念 ⭐⭐⭐⭐⭐

### Channel和Buffer

```java
import java.nio.*;
import java.nio.channels.*;
import java.nio.file.*;
import java.io.IOException;

public class NIODemo {
    /**
     * 使用NIO读取文件 ⭐⭐⭐⭐
     */
    public static void readFileNIO(String fileName) throws IOException {
        try (FileChannel channel = FileChannel.open(
                Paths.get(fileName), StandardOpenOption.READ)) {
            
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            
            while (channel.read(buffer) > 0) {
                buffer.flip();  // 切换到读模式
                
                while (buffer.hasRemaining()) {
                    System.out.print((char) buffer.get());
                }
                
                buffer.clear();  // 清空缓冲区
            }
        }
    }
    
    /**
     * 使用NIO写入文件 ⭐⭐⭐⭐
     */
    public static void writeFileNIO(String fileName, String content) throws IOException {
        try (FileChannel channel = FileChannel.open(
                Paths.get(fileName), 
                StandardOpenOption.WRITE, 
                StandardOpenOption.CREATE)) {
            
            ByteBuffer buffer = ByteBuffer.wrap(content.getBytes());
            channel.write(buffer);
            
            System.out.println("NIO写入成功！");
        }
    }
    
    /**
     * NIO文件复制（高效） ⭐⭐⭐⭐⭐
     */
    public static void copyFileNIO(String src, String dest) throws IOException {
        try (FileChannel srcChannel = FileChannel.open(
                Paths.get(src), StandardOpenOption.READ);
             FileChannel destChannel = FileChannel.open(
                Paths.get(dest), 
                StandardOpenOption.WRITE, 
                StandardOpenOption.CREATE)) {
            
            // 直接传输（零拷贝）
            srcChannel.transferTo(0, srcChannel.size(), destChannel);
            
            System.out.println("NIO高效复制完成！");
        }
    }
    
    public static void main(String[] args) {
        try {
            writeFileNIO("nio_test.txt", "NIO测试内容");
            readFileNIO("nio_test.txt");
            copyFileNIO("nio_test.txt", "nio_copy.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 6. 实战案例

### 文件工具类 ⭐⭐⭐⭐⭐

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class FileUtils {
    /**
     * 读取文件为字符串
     */
    public static String readFileAsString(String fileName) throws IOException {
        return new String(Files.readAllBytes(Paths.get(fileName)));
    }
    
    /**
     * 写入字符串到文件
     */
    public static void writeStringToFile(String fileName, String content) 
            throws IOException {
        Files.write(Paths.get(fileName), content.getBytes());
    }
    
    /**
     * 读取文件为列表
     */
    public static List<String> readFileAsList(String fileName) throws IOException {
        return Files.readAllLines(Paths.get(fileName));
    }
    
    /**
     * 追加内容到文件
     */
    public static void appendToFile(String fileName, String content) 
            throws IOException {
        Files.write(
            Paths.get(fileName), 
            content.getBytes(), 
            StandardOpenOption.CREATE,
            StandardOpenOption.APPEND
        );
    }
    
    /**
     * 复制文件
     */
    public static void copyFile(String src, String dest) throws IOException {
        Files.copy(
            Paths.get(src), 
            Paths.get(dest), 
            StandardCopyOption.REPLACE_EXISTING
        );
    }
    
    /**
     * 删除文件或目录
     */
    public static boolean deleteFile(String fileName) {
        try {
            return Files.deleteIfExists(Paths.get(fileName));
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * 获取文件扩展名
     */
    public static String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }
    
    /**
     * 获取文件大小（格式化）
     */
    public static String getFileSize(String fileName) throws IOException {
        long bytes = Files.size(Paths.get(fileName));
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024) + " KB";
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024) + " MB";
        return (bytes / 1024 / 1024 / 1024) + " GB";
    }
    
    /**
     * 列出目录下所有文件
     */
    public static List<String> listFiles(String directory) throws IOException {
        List<String> files = new ArrayList<>();
        try (var paths = Files.list(Paths.get(directory))) {
            paths.filter(Files::isRegularFile)
                 .forEach(p -> files.add(p.getFileName().toString()));
        }
        return files;
    }
}
```

## 💡 重点总结

### IO流选择指南 ⭐⭐⭐⭐⭐

| 场景 | 推荐方案 |
|------|---------|
| 读写文本文件 | **Files类**（首选） |
| 读写二进制文件 | **BufferedInputStream/OutputStream** |
| 对象序列化 | **ObjectInputStream/OutputStream** |
| 大文件处理 | **NIO Channel+Buffer** |
| 按行读取 | **Files.lines()** 或 **BufferedReader** |
| 文件复制 | **Files.copy()** |

### 性能对比 ⭐⭐⭐⭐⭐

```
FileInputStream                  ⭐⭐
BufferedInputStream             ⭐⭐⭐⭐
Files类                         ⭐⭐⭐⭐⭐
NIO Channel                     ⭐⭐⭐⭐⭐
```

### 最佳实践 ⭐⭐⭐⭐⭐

1. **优先使用Files类** - Java 7+的现代API
2. **使用try-with-resources** - 自动关闭资源
3. **使用缓冲流** - 提高性能
4. **选择合适的流** - 文本用字符流，二进制用字节流
5. **大文件使用NIO** - 更高效

### 常见错误避免

```java
// ❌ 不推荐：没有关闭流
FileInputStream fis = new FileInputStream("file.txt");
// 使用fis...
// 忘记关闭

// ✅ 推荐：使用try-with-resources
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // 使用fis...
} // 自动关闭

// ❌ 不推荐：没有缓冲
FileReader fr = new FileReader("file.txt");

// ✅ 推荐：使用缓冲
BufferedReader br = new BufferedReader(new FileReader("file.txt"));

// ❌ 不推荐：逐字节读取
int data;
while ((data = fis.read()) != -1) { ... }

// ✅ 推荐：使用缓冲区
byte[] buffer = new byte[8192];
int len;
while ((len = fis.read(buffer)) != -1) { ... }
```

## 🎯 练习建议

1. 实现一个文本文件搜索工具
2. 编写文件批量重命名工具
3. 实现简单的日志记录系统
4. 开发文件分割与合并工具
5. 实现配置文件读写工具

## 📚 下一步

学习完IO与NIO后，继续学习 [JVM原理](./JVM原理.md)

