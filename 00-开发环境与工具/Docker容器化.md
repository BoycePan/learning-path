# Docker容器化

## 📌 学习目标

- 理解容器化概念
- 掌握Docker基础命令
- 学会编写Dockerfile
- 掌握Docker Compose
- 了解容器化部署

## ⭐ 核心概念

- **容器vs虚拟机** ⭐⭐⭐⭐⭐
- **镜像与容器** ⭐⭐⭐⭐⭐
- **Dockerfile** ⭐⭐⭐⭐⭐
- **Docker Compose** ⭐⭐⭐⭐⭐
- **容器编排** ⭐⭐⭐⭐

## 1. Docker简介 ⭐⭐⭐⭐⭐

### 什么是Docker？

Docker是一个**容器化平台**，用于：

1. **应用打包** - 将应用及依赖打包成镜像
2. **环境一致** - 开发、测试、生产环境一致
3. **快速部署** - 秒级启动应用
4. **资源隔离** - 容器间相互隔离

### 容器 vs 虚拟机

| 特性 | Docker容器 | 虚拟机 |
|------|-----------|--------|
| 启动速度 | 秒级 ⭐⭐⭐⭐⭐ | 分钟级 |
| 资源占用 | 少 ⭐⭐⭐⭐⭐ | 多 |
| 性能 | 接近原生 ⭐⭐⭐⭐⭐ | 有损耗 |
| 隔离性 | 进程级 | 系统级 ⭐⭐⭐⭐⭐ |
| 镜像大小 | MB级 ⭐⭐⭐⭐⭐ | GB级 |

## 2. Docker安装 ⭐⭐⭐⭐⭐

### Windows安装

```bash
# 1. 下载Docker Desktop
# https://www.docker.com/products/docker-desktop

# 2. 安装并启动

# 3. 验证安装
docker --version
docker run hello-world
```

### macOS安装

```bash
# 方法1：Docker Desktop（推荐）
# https://www.docker.com/products/docker-desktop

# 方法2：Homebrew
brew install --cask docker

# 验证安装
docker --version
```

### Linux安装（Ubuntu）

```bash
# 1. 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. 安装依赖
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release

# 3. 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. 验证安装
sudo docker run hello-world

# 7. 配置非root用户使用Docker
sudo usermod -aG docker $USER
newgrp docker
```

### 配置镜像加速 ⭐⭐⭐⭐⭐

```bash
# 编辑 /etc/docker/daemon.json
sudo vim /etc/docker/daemon.json
```

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

```bash
# 重启Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 3. Docker核心概念 ⭐⭐⭐⭐⭐

### 镜像（Image）

```bash
# 镜像是只读的模板，包含运行应用所需的一切
# 类似于：类（Class）

# 查看本地镜像 ⭐⭐⭐⭐⭐
docker images
docker image ls

# 搜索镜像
docker search mysql

# 拉取镜像 ⭐⭐⭐⭐⭐
docker pull mysql:8.0
docker pull openjdk:17

# 删除镜像
docker rmi image-id
docker image rm mysql:8.0

# 导出/导入镜像
docker save -o mysql.tar mysql:8.0
docker load -i mysql.tar
```

### 容器（Container）

```bash
# 容器是镜像的运行实例
# 类似于：对象（Object）

# 查看运行中的容器 ⭐⭐⭐⭐⭐
docker ps
docker container ls

# 查看所有容器（包括停止的）
docker ps -a

# 创建并启动容器 ⭐⭐⭐⭐⭐
docker run -d --name mysql-server \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -p 3306:3306 \
  mysql:8.0

# 参数说明：
# -d: 后台运行
# --name: 容器名称
# -e: 环境变量
# -p: 端口映射（主机端口:容器端口）
# -v: 数据卷挂载

# 停止容器 ⭐⭐⭐⭐⭐
docker stop container-id
docker stop mysql-server

# 启动容器
docker start container-id

# 重启容器
docker restart container-id

# 删除容器
docker rm container-id
docker rm -f container-id  # 强制删除运行中的容器

# 进入容器 ⭐⭐⭐⭐⭐
docker exec -it container-id /bin/bash
docker exec -it mysql-server mysql -uroot -p

# 查看容器日志 ⭐⭐⭐⭐⭐
docker logs container-id
docker logs -f container-id  # 实时查看
docker logs --tail 100 container-id  # 查看最后100行
```

## 4. Dockerfile ⭐⭐⭐⭐⭐

### Dockerfile基础

```dockerfile
# 基础镜像 ⭐⭐⭐⭐⭐
FROM openjdk:17-jdk-slim

# 维护者信息
LABEL maintainer="your-email@example.com"

# 工作目录
WORKDIR /app

# 复制文件
COPY target/app.jar app.jar

# 暴露端口
EXPOSE 8080

# 环境变量
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# 启动命令 ⭐⭐⭐⭐⭐
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Spring Boot应用Dockerfile ⭐⭐⭐⭐⭐

```dockerfile
# 多阶段构建（推荐）⭐⭐⭐⭐⭐
# 阶段1：构建
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 阶段2：运行
FROM openjdk:17-jdk-slim
WORKDIR /app

# 复制jar包
COPY --from=builder /build/target/*.jar app.jar

# 创建非root用户
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
```

### 构建和运行

```bash
# 构建镜像 ⭐⭐⭐⭐⭐
docker build -t my-app:1.0 .
docker build -t my-app:1.0 -f Dockerfile.prod .

# 运行容器
docker run -d --name my-app \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  my-app:1.0

# 查看日志
docker logs -f my-app
```

## 5. Docker Compose ⭐⭐⭐⭐⭐

### 什么是Docker Compose？

Docker Compose用于**定义和运行多容器应用**。

### docker-compose.yml示例

```yaml
version: '3.8'

services:
  # MySQL数据库 ⭐⭐⭐⭐⭐
  mysql:
    image: mysql:8.0
    container_name: mysql-server
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: mydb
      MYSQL_USER: user
      MYSQL_PASSWORD: user123
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  # Redis缓存 ⭐⭐⭐⭐⭐
  redis:
    image: redis:7-alpine
    container_name: redis-server
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    networks:
      - app-network

  # Spring Boot应用 ⭐⭐⭐⭐⭐
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: spring-app
    restart: always
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/mydb
      SPRING_DATASOURCE_USERNAME: user
      SPRING_DATASOURCE_PASSWORD: user123
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    depends_on:
      - mysql
      - redis
    networks:
      - app-network

  # Nginx反向代理 ⭐⭐⭐⭐
  nginx:
    image: nginx:alpine
    container_name: nginx-server
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

# 数据卷
volumes:
  mysql-data:
  redis-data:

# 网络
networks:
  app-network:
    driver: bridge
```

### Docker Compose命令 ⭐⭐⭐⭐⭐

```bash
# 启动所有服务 ⭐⭐⭐⭐⭐
docker-compose up
docker-compose up -d  # 后台运行

# 停止所有服务
docker-compose down
docker-compose down -v  # 同时删除数据卷

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
docker-compose logs -f app  # 查看指定服务日志

# 重启服务
docker-compose restart
docker-compose restart app

# 构建镜像
docker-compose build
docker-compose build --no-cache

# 执行命令
docker-compose exec app /bin/bash
docker-compose exec mysql mysql -uroot -p
```

## 6. 常用容器部署 ⭐⭐⭐⭐⭐

### MySQL

```bash
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=mydb \
  -p 3306:3306 \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0
```

### Redis

```bash
docker run -d --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine redis-server --appendonly yes
```

### Nginx

```bash
docker run -d --name nginx \
  -p 80:80 \
  -v ./nginx.conf:/etc/nginx/nginx.conf \
  -v ./html:/usr/share/nginx/html \
  nginx:alpine
```

### RabbitMQ

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3-management
```

### Nacos

```bash
docker run -d --name nacos \
  -e MODE=standalone \
  -p 8848:8848 \
  -p 9848:9848 \
  nacos/nacos-server:latest
```

## 7. 数据管理 ⭐⭐⭐⭐⭐

### 数据卷（Volume）

```bash
# 创建数据卷
docker volume create mysql-data

# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect mysql-data

# 删除数据卷
docker volume rm mysql-data

# 清理未使用的数据卷
docker volume prune

# 使用数据卷
docker run -d --name mysql \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0
```

### 挂载主机目录

```bash
# 挂载主机目录
docker run -d --name nginx \
  -v /path/on/host:/path/in/container \
  nginx:alpine

# 只读挂载
docker run -d --name nginx \
  -v /path/on/host:/path/in/container:ro \
  nginx:alpine
```

## 8. 网络管理 ⭐⭐⭐⭐

```bash
# 查看网络
docker network ls

# 创建网络
docker network create app-network

# 查看网络详情
docker network inspect app-network

# 连接容器到网络
docker network connect app-network container-name

# 断开网络连接
docker network disconnect app-network container-name

# 删除网络
docker network rm app-network
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 1. 使用.dockerignore

```
# .dockerignore
target/
.git/
.idea/
*.md
.gitignore
```

### 2. 镜像优化

```dockerfile
# 使用轻量级基础镜像
FROM openjdk:17-jdk-slim  # 而不是 openjdk:17

# 多阶段构建减小镜像大小
FROM maven:3.8-openjdk-17 AS builder
# ...
FROM openjdk:17-jdk-slim
COPY --from=builder /build/target/*.jar app.jar

# 合并RUN命令减少层数
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

### 3. 安全建议

```dockerfile
# 使用非root用户
RUN addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup
USER appuser

# 不在镜像中存储敏感信息
# 使用环境变量或secrets
```

## 🎯 实战练习

1. 部署MySQL + Redis环境
2. 编写Spring Boot应用的Dockerfile
3. 使用Docker Compose部署完整应用
4. 配置Nginx反向代理

## 📚 下一步

学习完Docker后，继续学习：
- [Kubernetes入门](../05-微服务与中间件/Kubernetes入门.md)
- [Linux基础命令](./Linux基础命令.md)

