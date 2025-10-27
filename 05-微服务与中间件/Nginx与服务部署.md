# Nginx与服务部署 🚀

> Nginx 是高性能的 HTTP 和反向代理服务器，在微服务架构中扮演着重要角色。本文档涵盖 Nginx 基础配置、反向代理、负载均衡以及与 Java 应用的集成部署。

## 📚 学习目标

- 掌握 Nginx 的安装与基础配置
- 理解反向代理和负载均衡原理
- 学会配置 HTTPS 和 SSL 证书
- 掌握静态资源服务和缓存策略
- 实现 Spring Boot 应用的生产环境部署
- 了解 Nginx 性能优化技巧

---

## 1. Nginx 基础入门

### 1.1 什么是 Nginx？

Nginx（发音：engine-x）是一个高性能的 HTTP 服务器和反向代理服务器，具有以下特点：

- **高性能**：采用事件驱动架构，支持高并发
- **低资源消耗**：内存占用少，CPU 使用率低
- **高可靠性**：稳定性好，适合长时间运行
- **模块化设计**：功能通过模块扩展

### 1.2 Nginx 的主要应用场景

```
┌─────────────────────────────────────────┐
│         Nginx 应用场景                   │
├─────────────────────────────────────────┤
│ 1. 反向代理服务器                        │
│ 2. 负载均衡器                            │
│ 3. 静态资源服务器                        │
│ 4. API 网关                              │
│ 5. HTTPS 终止                            │
│ 6. 缓存服务器                            │
└─────────────────────────────────────────┘
```

### 1.3 安装 Nginx

#### Windows 安装

```bash
# 1. 下载 Nginx
# 访问 http://nginx.org/en/download.html

# 2. 解压到目录（如 C:\nginx）

# 3. 启动 Nginx
cd C:\nginx
start nginx

# 4. 验证安装
# 浏览器访问 http://localhost
```

#### Linux (Ubuntu/Debian) 安装

```bash
# 更新包索引
sudo apt update

# 安装 Nginx
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx
```

#### macOS 安装

```bash
# 使用 Homebrew 安装
brew install nginx

# 启动 Nginx
brew services start nginx
```

#### Docker 安装（推荐）

```bash
# 拉取 Nginx 镜像
docker pull nginx:latest

# 运行 Nginx 容器
docker run -d \
  --name my-nginx \
  -p 80:80 \
  -p 443:443 \
  nginx:latest
```

### 1.4 Nginx 基本命令

```bash
# 启动 Nginx
nginx

# 停止 Nginx
nginx -s stop          # 快速停止
nginx -s quit          # 优雅停止

# 重新加载配置
nginx -s reload

# 测试配置文件
nginx -t

# 查看版本
nginx -v
nginx -V              # 详细版本信息

# 查看进程
ps aux | grep nginx
```

---

## 2. Nginx 配置文件详解

### 2.1 配置文件结构

```nginx
# 全局块：影响 Nginx 全局的配置
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# events 块：影响 Nginx 服务器与用户的网络连接
events {
    worker_connections 1024;
    use epoll;
}

# http 块：配置 HTTP 服务器
http {
    # http 全局块
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    # server 块：配置虚拟主机
    server {
        # server 全局块
        listen 80;
        server_name localhost;

        # location 块：配置请求路由
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
        }

        location /api {
            proxy_pass http://backend;
        }
    }

    # 可以有多个 server 块
    server {
        listen 443 ssl;
        server_name example.com;
        # ...
    }
}
```

### 2.2 配置文件位置

| 系统    | 配置文件路径                      | 日志路径                    |
| ------- | --------------------------------- | --------------------------- |
| Linux   | `/etc/nginx/nginx.conf`           | `/var/log/nginx/`           |
| Windows | `C:\nginx\conf\nginx.conf`        | `C:\nginx\logs\`            |
| macOS   | `/usr/local/etc/nginx/nginx.conf` | `/usr/local/var/log/nginx/` |

### 2.3 常用配置指令

```nginx
# 工作进程数（通常设置为 CPU 核心数）
worker_processes auto;

# 每个进程的最大连接数
events {
    worker_connections 1024;
}

# 文件传输优化
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# 连接超时时间
keepalive_timeout 65;

# 客户端请求体大小限制
client_max_body_size 100M;

# Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## 3. 反向代理配置

### 3.1 什么是反向代理？

```text
客户端 → Nginx (反向代理) → 后端服务器
         ↓
    - 隐藏真实服务器
    - 负载均衡
    - 缓存
    - SSL 终止
```

### 3.2 基础反向代理配置

#### 代理单个 Spring Boot 应用

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        # 代理到后端服务
        proxy_pass http://localhost:8080;

        # 传递真实客户端 IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 传递 Host 头
        proxy_set_header Host $host;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### 代理多个服务（微服务场景）

```nginx
server {
    listen 80;
    server_name api.example.com;

    # 用户服务
    location /user/ {
        proxy_pass http://localhost:8081/;
        include /etc/nginx/proxy_params;
    }

    # 订单服务
    location /order/ {
        proxy_pass http://localhost:8082/;
        include /etc/nginx/proxy_params;
    }

    # 商品服务
    location /product/ {
        proxy_pass http://localhost:8083/;
        include /etc/nginx/proxy_params;
    }
}
```

#### 创建通用代理配置文件

```nginx
# /etc/nginx/proxy_params
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

---

## 4. 负载均衡配置

### 4.1 负载均衡策略

Nginx 支持多种负载均衡算法：

| 策略         | 说明                       | 使用场景           |
| ------------ | -------------------------- | ------------------ |
| 轮询（默认） | 依次分配请求               | 服务器性能相近     |
| weight       | 加权轮询                   | 服务器性能不同     |
| ip_hash      | 根据客户端 IP 哈希         | 需要会话保持       |
| least_conn   | 最少连接数                 | 请求处理时间差异大 |
| fair         | 根据响应时间分配（第三方） | 需要第三方模块     |

### 4.2 轮询负载均衡（默认）

```nginx
# 定义后端服务器组
upstream backend {
    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;
        include /etc/nginx/proxy_params;
    }
}
```

### 4.3 加权轮询

```nginx
upstream backend {
    # 权重比例 3:2:1
    server localhost:8081 weight=3;
    server localhost:8082 weight=2;
    server localhost:8083 weight=1;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
    }
}
```

### 4.4 IP Hash（会话保持）

```nginx
upstream backend {
    ip_hash;  # 同一客户端 IP 总是访问同一台服务器

    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
    }
}
```

### 4.5 最少连接

```nginx
upstream backend {
    least_conn;  # 将请求分配给连接数最少的服务器

    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
    }
}
```

### 4.6 健康检查

```nginx
upstream backend {
    server localhost:8081 max_fails=3 fail_timeout=30s;
    server localhost:8082 max_fails=3 fail_timeout=30s;
    server localhost:8083 max_fails=3 fail_timeout=30s;

    # backup 服务器（其他服务器都不可用时使用）
    server localhost:8084 backup;

    # down 标记服务器暂时不参与负载均衡
    # server localhost:8085 down;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

---

## 5. 静态资源服务

### 5.1 基础静态资源配置

```nginx
server {
    listen 80;
    server_name static.example.com;

    # 静态资源根目录
    root /var/www/static;

    # 默认首页
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # 图片资源
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # CSS 和 JavaScript
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # 字体文件
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 前后端分离部署

```nginx
server {
    listen 80;
    server_name www.example.com;

    # 前端静态资源
    root /var/www/frontend/dist;
    index index.html;

    # 前端路由（Vue/React SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 请求代理到后端
    location /api/ {
        proxy_pass http://localhost:8080/;
        include /etc/nginx/proxy_params;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.3 Gzip 压缩配置

```nginx
http {
    # 开启 Gzip 压缩
    gzip on;

    # 压缩级别（1-9，9 最高但最耗 CPU）
    gzip_comp_level 6;

    # 最小压缩文件大小
    gzip_min_length 1000;

    # 压缩的文件类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;

    # 为代理请求启用压缩
    gzip_proxied any;

    # 禁用 IE6 的 Gzip
    gzip_disable "msie6";

    # 添加 Vary: Accept-Encoding 头
    gzip_vary on;
}
```

---

## 6. HTTPS 配置

### 6.1 生成自签名证书（测试用）

```bash
# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 生成自签名证书
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt

# 设置权限
sudo chmod 600 /etc/nginx/ssl/nginx.key
```

### 6.2 HTTPS 基础配置

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

    # SSL 协议版本
    ssl_protocols TLSv1.2 TLSv1.3;

    # SSL 加密套件
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:8080;
        include /etc/nginx/proxy_params;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name www.example.com;

    return 301 https://$server_name$request_uri;
}
```

### 6.3 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置 HTTPS
sudo certbot --nginx -d example.com -d www.example.com

# 测试自动续期
sudo certbot renew --dry-run

# 自动续期（添加到 crontab）
0 0 * * * certbot renew --quiet
```

---

## 7. Spring Boot 应用部署实战

### 7.1 单应用部署

#### 步骤 1：打包 Spring Boot 应用

```bash
# Maven 打包
mvn clean package -DskipTests

# Gradle 打包
gradle build -x test
```

#### 步骤 2：运行 Spring Boot 应用

```bash
# 后台运行
nohup java -jar app.jar > app.log 2>&1 &

# 使用 systemd 管理（推荐）
sudo nano /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Spring Boot Application
After=syslog.target network.target

[Service]
User=appuser
ExecStart=/usr/bin/java -jar /opt/myapp/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl start myapp
sudo systemctl enable myapp
sudo systemctl status myapp
```

#### 步骤 3：配置 Nginx

```nginx
server {
    listen 80;
    server_name api.example.com;

    access_log /var/log/nginx/myapp-access.log;
    error_log /var/log/nginx/myapp-error.log;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7.2 多实例负载均衡部署

#### 步骤 1：启动多个应用实例

```bash
# 实例 1（端口 8081）
java -jar app.jar --server.port=8081 &

# 实例 2（端口 8082）
java -jar app.jar --server.port=8082 &

# 实例 3（端口 8083）
java -jar app.jar --server.port=8083 &
```

#### 步骤 2：配置 Nginx 负载均衡

```nginx
upstream myapp_backend {
    least_conn;

    server localhost:8081 max_fails=3 fail_timeout=30s;
    server localhost:8082 max_fails=3 fail_timeout=30s;
    server localhost:8083 max_fails=3 fail_timeout=30s;

    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://myapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 7.3 Docker + Nginx 部署

#### Dockerfile（Spring Boot）

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml

```yaml
version: "3.8"

services:
  # Spring Boot 应用（3个实例）
  app1:
    build: .
    ports:
      - "8081:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: always

  app2:
    build: .
    ports:
      - "8082:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: always

  app3:
    build: .
    ports:
      - "8083:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: always

  # Nginx 负载均衡
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app1
      - app2
      - app3
    restart: always
```

#### nginx.conf（Docker 环境）

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        least_conn;
        server app1:8080;
        server app2:8080;
        server app3:8080;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

#### 启动部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 扩展实例
docker-compose up -d --scale app1=5

# 停止
docker-compose down
```

---

## 8. 性能优化

### 8.1 连接优化

```nginx
events {
    # 使用 epoll（Linux）
    use epoll;

    # 每个 worker 进程的最大连接数
    worker_connections 4096;

    # 允许一个 worker 同时接受多个连接
    multi_accept on;
}

http {
    # 长连接超时时间
    keepalive_timeout 65;

    # 长连接请求数
    keepalive_requests 100;

    # 客户端请求头超时
    client_header_timeout 60;

    # 客户端请求体超时
    client_body_timeout 60;

    # 发送响应超时
    send_timeout 60;
}
```

### 8.2 缓冲区优化

```nginx
http {
    # 客户端请求体缓冲区大小
    client_body_buffer_size 128k;

    # 客户端请求头缓冲区大小
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    # 客户端请求体最大大小
    client_max_body_size 100m;

    # 代理缓冲
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

### 8.3 文件传输优化

```nginx
http {
    # 高效文件传输
    sendfile on;

    # 优化 sendfile
    tcp_nopush on;
    tcp_nodelay on;

    # 文件描述符缓存
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 8.4 缓存配置

```nginx
# 定义缓存路径
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

server {
    listen 80;

    location / {
        proxy_pass http://backend;

        # 启用缓存
        proxy_cache my_cache;

        # 缓存有效期
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;

        # 缓存键
        proxy_cache_key "$scheme$request_method$host$request_uri";

        # 添加缓存状态头
        add_header X-Cache-Status $upstream_cache_status;

        # 缓存绕过条件
        proxy_cache_bypass $http_pragma $http_authorization;
        proxy_no_cache $http_pragma $http_authorization;
    }
}
```

### 8.5 限流配置

```nginx
# 定义限流区域
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

server {
    listen 80;

    location /api/ {
        # 限制请求速率（每秒10个请求，突发20个）
        limit_req zone=api_limit burst=20 nodelay;

        # 限制并发连接数
        limit_conn conn_limit 10;

        proxy_pass http://backend;
    }
}
```

---

## 9. 安全配置

### 9.1 基础安全配置

```nginx
http {
    # 隐藏 Nginx 版本号
    server_tokens off;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # XSS 保护
    add_header X-XSS-Protection "1; mode=block" always;

    # 禁止 MIME 类型嗅探
    add_header X-Content-Type-Options "nosniff" always;

    # CSP 内容安全策略
    add_header Content-Security-Policy "default-src 'self'" always;

    # Referrer 策略
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 9.2 IP 访问控制

```nginx
server {
    listen 80;

    # 允许特定 IP
    location /admin/ {
        allow 192.168.1.0/24;
        allow 10.0.0.1;
        deny all;

        proxy_pass http://backend;
    }

    # 拒绝特定 IP
    location / {
        deny 192.168.1.100;
        allow all;

        proxy_pass http://backend;
    }
}
```

### 9.3 基本认证

```nginx
server {
    listen 80;

    location /admin/ {
        # 启用基本认证
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://backend;
    }
}
```

```bash
# 创建密码文件
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

### 9.4 防止 DDoS 攻击

```nginx
# 限制请求方法
server {
    listen 80;

    if ($request_method !~ ^(GET|POST|HEAD)$) {
        return 405;
    }

    # 限制请求体大小
    client_max_body_size 10m;

    # 限制请求速率
    limit_req_zone $binary_remote_addr zone=ddos:10m rate=5r/s;

    location / {
        limit_req zone=ddos burst=10 nodelay;
        proxy_pass http://backend;
    }
}
```

---

## 10. 监控与日志

### 10.1 访问日志配置

```nginx
http {
    # 自定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    log_format json escape=json '{'
        '"time": "$time_local",'
        '"remote_addr": "$remote_addr",'
        '"request": "$request",'
        '"status": $status,'
        '"body_bytes_sent": $body_bytes_sent,'
        '"request_time": $request_time,'
        '"upstream_response_time": "$upstream_response_time"'
    '}';

    # 访问日志
    access_log /var/log/nginx/access.log main;

    # 错误日志
    error_log /var/log/nginx/error.log warn;
}

server {
    listen 80;

    # 为特定 location 配置日志
    location /api/ {
        access_log /var/log/nginx/api-access.log json;
        proxy_pass http://backend;
    }

    # 禁用日志
    location /health {
        access_log off;
        return 200 "OK";
    }
}
```

### 10.2 状态监控

```nginx
server {
    listen 8080;
    server_name localhost;

    # Nginx 状态页面
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

访问 `http://localhost:8080/nginx_status` 查看状态：

```text
Active connections: 291
server accepts handled requests
 16630948 16630948 31070465
Reading: 6 Writing: 179 Waiting: 106
```

### 10.3 日志分析工具

```bash
# 实时查看访问日志
tail -f /var/log/nginx/access.log

# 统计访问最多的 IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计访问最多的 URL
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计 HTTP 状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 使用 GoAccess 分析日志（推荐）
sudo apt install goaccess
goaccess /var/log/nginx/access.log -o report.html --log-format=COMBINED
```

---

## 11. 常见问题与故障排查

### 11.1 常见错误

#### 502 Bad Gateway

**原因**：

- 后端服务未启动
- 后端服务响应超时
- 防火墙阻止连接

**解决方法**：

```bash
# 检查后端服务是否运行
netstat -tlnp | grep 8080

# 检查 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 测试后端连接
curl http://localhost:8080
```

#### 504 Gateway Timeout

**原因**：后端处理时间过长

**解决方法**：

```nginx
location / {
    proxy_pass http://backend;

    # 增加超时时间
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
}
```

#### 413 Request Entity Too Large

**原因**：请求体超过限制

**解决方法**：

```nginx
http {
    client_max_body_size 100M;
}
```

### 11.2 性能问题排查

```bash
# 查看 Nginx 进程
ps aux | grep nginx

# 查看连接数
netstat -an | grep :80 | wc -l

# 查看 worker 进程数
ps aux | grep "nginx: worker" | wc -l

# 测试配置文件
nginx -t

# 重新加载配置
nginx -s reload
```

### 11.3 调试技巧

```nginx
# 开启调试日志
error_log /var/log/nginx/error.log debug;

# 记录请求处理时间
log_format timing '$remote_addr - $request_time - $upstream_response_time';
access_log /var/log/nginx/timing.log timing;
```

---

## 12. 实战案例

### 12.1 电商系统部署架构

```nginx
# 前端静态资源
server {
    listen 80;
    server_name www.shop.com;

    root /var/www/shop-frontend/dist;
    index index.html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://api_backend/;
        include /etc/nginx/proxy_params;
    }
}

# API 网关
upstream api_backend {
    least_conn;
    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=2;
    server 192.168.1.103:8080 weight=1;
    server 192.168.1.104:8080 backup;
}

# 管理后台（需要认证）
server {
    listen 80;
    server_name admin.shop.com;

    location / {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://admin_backend;
        include /etc/nginx/proxy_params;
    }
}

upstream admin_backend {
    server 192.168.1.201:8081;
}
```

### 12.2 微服务网关配置

```nginx
# 用户服务
upstream user_service {
    server user-service-1:8081;
    server user-service-2:8081;
}

# 订单服务
upstream order_service {
    server order-service-1:8082;
    server order-service-2:8082;
}

# 商品服务
upstream product_service {
    server product-service-1:8083;
    server product-service-2:8083;
}

# API 网关
server {
    listen 80;
    server_name api.example.com;

    # 用户服务路由
    location /user/ {
        rewrite ^/user/(.*)$ /$1 break;
        proxy_pass http://user_service;
        include /etc/nginx/proxy_params;
    }

    # 订单服务路由
    location /order/ {
        rewrite ^/order/(.*)$ /$1 break;
        proxy_pass http://order_service;
        include /etc/nginx/proxy_params;
    }

    # 商品服务路由
    location /product/ {
        rewrite ^/product/(.*)$ /$1 break;
        proxy_pass http://product_service;
        include /etc/nginx/proxy_params;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "OK";
    }
}
```

---

## 13. 学习资源

### 13.1 官方文档

- [Nginx 官方文档](http://nginx.org/en/docs/)
- [Nginx 配置示例](https://www.nginx.com/resources/wiki/start/)

### 13.2 推荐书籍

- 《深入理解 Nginx》- 陶辉
- 《Nginx 高性能 Web 服务器详解》

### 13.3 在线工具

- [Nginx 配置生成器](https://www.digitalocean.com/community/tools/nginx)
- [SSL 配置生成器](https://ssl-config.mozilla.org/)

---

## 14. 学习路线总结

### 第 1-3 天：基础入门

- ✅ 安装 Nginx
- ✅ 理解配置文件结构
- ✅ 配置静态资源服务器

### 第 4-6 天：反向代理

- ✅ 配置反向代理
- ✅ 代理 Spring Boot 应用
- ✅ 配置负载均衡

### 第 7-9 天：HTTPS 与安全

- ✅ 配置 HTTPS
- ✅ 安全加固
- ✅ 访问控制

### 第 10-12 天：性能优化

- ✅ 缓存配置
- ✅ 性能调优
- ✅ 监控与日志

### 第 13-14 天：实战项目

- ✅ Docker 部署
- ✅ 微服务网关
- ✅ 生产环境部署

---

## 15. 实践练习

### 练习 1：基础部署

1. 安装 Nginx
2. 创建一个简单的 HTML 页面
3. 配置 Nginx 提供静态资源服务

### 练习 2：反向代理

1. 创建一个 Spring Boot 应用
2. 配置 Nginx 反向代理到 Spring Boot
3. 测试访问

### 练习 3：负载均衡

1. 启动 3 个 Spring Boot 实例
2. 配置 Nginx 负载均衡
3. 测试负载分配

### 练习 4：HTTPS 配置

1. 生成自签名证书
2. 配置 HTTPS
3. 配置 HTTP 到 HTTPS 重定向

### 练习 5：Docker 部署

1. 编写 Dockerfile
2. 编写 docker-compose.yml
3. 使用 Docker 部署完整应用

---

## 🎯 学习检查清单

- [ ] 能够独立安装和配置 Nginx
- [ ] 理解 Nginx 配置文件结构
- [ ] 掌握反向代理配置
- [ ] 掌握负载均衡策略
- [ ] 能够配置 HTTPS
- [ ] 了解性能优化技巧
- [ ] 能够部署 Spring Boot 应用
- [ ] 掌握 Docker + Nginx 部署
- [ ] 能够进行故障排查
- [ ] 了解安全配置最佳实践

---

**恭喜你完成 Nginx 学习！** 🎉

Nginx 是现代 Web 架构中不可或缺的组件，掌握它将大大提升你的部署和运维能力。继续实践，在实际项目中应用所学知识！
