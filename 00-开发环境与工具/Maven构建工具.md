# Maven构建工具

## 📌 学习目标

- 理解Maven的作用和原理
- 掌握Maven项目结构
- 熟练使用Maven命令
- 掌握依赖管理
- 了解Maven生命周期

## ⭐ 核心概念

- **项目对象模型（POM）** ⭐⭐⭐⭐⭐
- **依赖管理** ⭐⭐⭐⭐⭐
- **生命周期** ⭐⭐⭐⭐⭐
- **插件机制** ⭐⭐⭐⭐
- **仓库管理** ⭐⭐⭐⭐⭐

## 1. Maven简介 ⭐⭐⭐⭐⭐

### 什么是Maven？

Maven是一个**项目管理和构建工具**，主要用于：

1. **依赖管理** - 自动下载和管理项目依赖
2. **项目构建** - 编译、测试、打包、部署
3. **项目信息管理** - 生成项目文档和报告
4. **标准化项目结构** - 统一的目录结构

### Maven vs Gradle

| 特性 | Maven | Gradle |
|------|-------|--------|
| 配置文件 | pom.xml（XML） | build.gradle（Groovy/Kotlin） |
| 学习曲线 | 简单 ⭐⭐⭐⭐⭐ | 较陡 |
| 构建速度 | 较慢 | 快 ⭐⭐⭐⭐⭐ |
| 生态系统 | 成熟 ⭐⭐⭐⭐⭐ | 新兴 |
| 推荐度 | 企业首选 ⭐⭐⭐⭐⭐ | Android开发 |

## 2. Maven项目结构 ⭐⭐⭐⭐⭐

### 标准目录结构

```
my-project/
├── pom.xml                    # Maven配置文件 ⭐⭐⭐⭐⭐
├── src/
│   ├── main/                  # 主代码
│   │   ├── java/             # Java源代码 ⭐⭐⭐⭐⭐
│   │   │   └── com/example/
│   │   │       └── App.java
│   │   ├── resources/        # 资源文件 ⭐⭐⭐⭐⭐
│   │   │   ├── application.properties
│   │   │   └── logback.xml
│   │   └── webapp/           # Web资源（Web项目）
│   │       └── WEB-INF/
│   │           └── web.xml
│   └── test/                  # 测试代码
│       ├── java/             # 测试源代码 ⭐⭐⭐⭐⭐
│       │   └── com/example/
│       │       └── AppTest.java
│       └── resources/        # 测试资源文件
└── target/                    # 编译输出目录（自动生成）
    ├── classes/              # 编译后的class文件
    ├── test-classes/         # 测试class文件
    └── my-project-1.0.jar    # 打包后的文件
```

## 3. POM文件详解 ⭐⭐⭐⭐⭐

### 基础POM结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <!-- POM模型版本 -->
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 项目坐标 ⭐⭐⭐⭐⭐ -->
    <groupId>com.example</groupId>        <!-- 组织ID -->
    <artifactId>my-project</artifactId>   <!-- 项目ID -->
    <version>1.0.0</version>              <!-- 版本号 -->
    <packaging>jar</packaging>            <!-- 打包方式：jar/war/pom -->
    
    <!-- 项目信息 -->
    <name>My Project</name>
    <description>项目描述</description>
    <url>https://example.com</url>
    
    <!-- 属性配置 ⭐⭐⭐⭐⭐ -->
    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.boot.version>3.2.0</spring.boot.version>
    </properties>
    
    <!-- 依赖管理 ⭐⭐⭐⭐⭐ -->
    <dependencies>
        <!-- 依赖项 -->
    </dependencies>
    
    <!-- 构建配置 ⭐⭐⭐⭐ -->
    <build>
        <plugins>
            <!-- 插件配置 -->
        </plugins>
    </build>
</project>
```

### 完整示例：Spring Boot项目

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 继承Spring Boot父POM ⭐⭐⭐⭐⭐ -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    
    <name>demo</name>
    <description>Demo project for Spring Boot</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- MyBatis Plus ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.3.2</version>
        </dependency>
        
        <!-- MySQL驱动 ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Redis ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        
        <!-- Lombok（开发工具）⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- 测试依赖 ⭐⭐⭐⭐⭐ -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- Spring Boot打包插件 ⭐⭐⭐⭐⭐ -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 4. 依赖管理 ⭐⭐⭐⭐⭐

### 依赖坐标

```xml
<dependency>
    <groupId>组织ID</groupId>
    <artifactId>项目ID</artifactId>
    <version>版本号</version>
    <scope>作用域</scope>
    <optional>是否可选</optional>
    <exclusions>排除依赖</exclusions>
</dependency>
```

### 依赖作用域（scope）⭐⭐⭐⭐⭐

```xml
<!-- compile（默认）- 编译、测试、运行都有效 ⭐⭐⭐⭐⭐ -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- 不写scope，默认就是compile -->
</dependency>

<!-- provided - 编译和测试有效，运行时由容器提供 ⭐⭐⭐⭐ -->
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>

<!-- runtime - 测试和运行有效，编译不需要 ⭐⭐⭐⭐ -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- test - 仅测试有效 ⭐⭐⭐⭐⭐ -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>

<!-- system - 系统依赖，需要指定路径（不推荐）⭐⭐ -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>custom-lib</artifactId>
    <version>1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/custom-lib.jar</systemPath>
</dependency>
```

### 依赖传递与排除 ⭐⭐⭐⭐⭐

```xml
<!-- 排除传递依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- 排除默认的Tomcat，使用Jetty -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 添加Jetty -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

### 依赖版本管理 ⭐⭐⭐⭐⭐

```xml
<!-- 使用dependencyManagement统一管理版本 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>2.0.43</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 子模块中使用，不需要指定版本 -->
<dependencies>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <!-- 版本由dependencyManagement管理 -->
    </dependency>
</dependencies>
```

## 5. Maven命令 ⭐⭐⭐⭐⭐

### 常用命令

```bash
# 清理项目（删除target目录）⭐⭐⭐⭐⭐
mvn clean

# 编译项目 ⭐⭐⭐⭐⭐
mvn compile

# 编译测试代码
mvn test-compile

# 运行测试 ⭐⭐⭐⭐⭐
mvn test

# 打包项目 ⭐⭐⭐⭐⭐
mvn package

# 安装到本地仓库 ⭐⭐⭐⭐
mvn install

# 部署到远程仓库
mvn deploy

# 组合命令（最常用）⭐⭐⭐⭐⭐
mvn clean package        # 清理并打包
mvn clean install        # 清理并安装到本地仓库
mvn clean test          # 清理并测试

# 跳过测试打包 ⭐⭐⭐⭐⭐
mvn clean package -DskipTests
mvn clean package -Dmaven.test.skip=true

# 查看依赖树 ⭐⭐⭐⭐
mvn dependency:tree

# 查看有效POM
mvn help:effective-pom

# 创建项目（使用原型）⭐⭐⭐⭐
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=my-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

### Spring Boot专用命令

```bash
# 运行Spring Boot应用 ⭐⭐⭐⭐⭐
mvn spring-boot:run

# 指定配置文件运行
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 打包为可执行jar ⭐⭐⭐⭐⭐
mvn clean package spring-boot:repackage
```

## 6. Maven生命周期 ⭐⭐⭐⭐⭐

### 三大生命周期

```
1. clean生命周期
   pre-clean → clean → post-clean

2. default生命周期（核心）⭐⭐⭐⭐⭐
   validate → compile → test → package → verify → install → deploy

3. site生命周期
   pre-site → site → post-site → site-deploy
```

### 生命周期阶段详解

```bash
# validate - 验证项目是否正确
# compile - 编译源代码 ⭐⭐⭐⭐⭐
# test - 运行测试 ⭐⭐⭐⭐⭐
# package - 打包成jar/war ⭐⭐⭐⭐⭐
# verify - 验证包是否有效
# install - 安装到本地仓库 ⭐⭐⭐⭐
# deploy - 部署到远程仓库 ⭐⭐⭐⭐
```

## 7. Maven仓库 ⭐⭐⭐⭐⭐

### 仓库类型

```
1. 本地仓库（Local Repository）⭐⭐⭐⭐⭐
   - 位置：~/.m2/repository
   - 存储下载的依赖

2. 中央仓库（Central Repository）⭐⭐⭐⭐⭐
   - Maven官方仓库
   - https://repo.maven.apache.org/maven2/

3. 远程仓库（Remote Repository）⭐⭐⭐⭐
   - 公司私服
   - 第三方仓库（阿里云等）
```

### 配置阿里云镜像 ⭐⭐⭐⭐⭐

编辑 `~/.m2/settings.xml`：

```xml
<settings>
    <mirrors>
        <mirror>
            <id>aliyun-central</id>
            <mirrorOf>central</mirrorOf>
            <name>Aliyun Central</name>
            <url>https://maven.aliyun.com/repository/central</url>
        </mirror>
        <mirror>
            <id>aliyun-public</id>
            <mirrorOf>*</mirrorOf>
            <name>Aliyun Public</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 版本号规范

```xml
<!-- 开发版本 -->
<version>1.0.0-SNAPSHOT</version>

<!-- 发布版本 -->
<version>1.0.0</version>

<!-- 版本号格式：主版本.次版本.修订号 -->
<!-- 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0 -->
```

### 2. 使用属性管理版本

```xml
<properties>
    <spring.version>6.1.0</spring.version>
    <mysql.version>8.0.33</mysql.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

### 3. 多模块项目结构

```
parent-project/
├── pom.xml              # 父POM
├── module-common/       # 公共模块
│   └── pom.xml
├── module-service/      # 服务模块
│   └── pom.xml
└── module-web/          # Web模块
    └── pom.xml
```

## 🎯 实战练习

1. 创建一个Maven项目
2. 添加Spring Boot依赖
3. 编写Hello World程序
4. 使用mvn命令打包运行

## 📚 下一步

学习完Maven后，继续学习：
- [Git版本控制](./Git版本控制.md)
- [Docker容器化](./Docker容器化.md)

