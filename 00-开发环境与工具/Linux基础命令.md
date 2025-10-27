# Linux基础命令

## 📌 学习目标

- 掌握Linux常用命令
- 熟悉文件系统操作
- 了解进程和服务管理
- 掌握文本处理命令
- 学会Shell脚本基础

## ⭐ 核心内容

- **文件操作** ⭐⭐⭐⭐⭐
- **权限管理** ⭐⭐⭐⭐⭐
- **进程管理** ⭐⭐⭐⭐⭐
- **网络命令** ⭐⭐⭐⭐
- **文本处理** ⭐⭐⭐⭐

## 1. 文件和目录操作 ⭐⭐⭐⭐⭐

### 目录操作

```bash
# 查看当前目录 ⭐⭐⭐⭐⭐
pwd

# 切换目录 ⭐⭐⭐⭐⭐
cd /path/to/directory
cd ~           # 切换到家目录
cd -           # 切换到上一次的目录
cd ..          # 切换到上级目录

# 列出文件 ⭐⭐⭐⭐⭐
ls             # 列出文件
ls -l          # 详细信息
ls -a          # 显示隐藏文件
ls -lh         # 人类可读的文件大小
ls -lt         # 按时间排序
ls -lS         # 按大小排序

# 创建目录 ⭐⭐⭐⭐⭐
mkdir mydir
mkdir -p parent/child/grandchild  # 递归创建

# 删除目录
rmdir mydir              # 删除空目录
rm -r mydir              # 递归删除
rm -rf mydir             # 强制递归删除（危险！）
```

### 文件操作

```bash
# 创建文件 ⭐⭐⭐⭐⭐
touch file.txt
echo "Hello" > file.txt

# 复制文件 ⭐⭐⭐⭐⭐
cp source.txt dest.txt
cp -r source_dir dest_dir  # 递归复制目录
cp -p file.txt backup.txt  # 保留属性

# 移动/重命名 ⭐⭐⭐⭐⭐
mv old.txt new.txt
mv file.txt /path/to/directory/

# 删除文件 ⭐⭐⭐⭐⭐
rm file.txt
rm -f file.txt  # 强制删除
rm -i file.txt  # 交互式删除

# 查看文件内容 ⭐⭐⭐⭐⭐
cat file.txt              # 显示全部内容
head file.txt             # 显示前10行
head -n 20 file.txt       # 显示前20行
tail file.txt             # 显示后10行
tail -n 20 file.txt       # 显示后20行
tail -f file.txt          # 实时查看文件更新（日志）

# 分页查看 ⭐⭐⭐⭐⭐
less file.txt             # 推荐
more file.txt

# 查找文件 ⭐⭐⭐⭐⭐
find /path -name "*.txt"
find . -name "*.java"
find . -type f -name "*.log"
find . -type d -name "target"
find . -mtime -7          # 7天内修改的文件
find . -size +100M        # 大于100M的文件
```

## 2. 文件权限 ⭐⭐⭐⭐⭐

### 权限说明

```bash
# 查看权限
ls -l file.txt
# -rw-r--r-- 1 user group 1024 Jan 1 12:00 file.txt
# 权限说明：
# - : 文件类型（-文件 d目录 l链接）
# rw- : 所有者权限（读写）
# r-- : 组权限（只读）
# r-- : 其他人权限（只读）

# 权限数字表示：
# r(读) = 4
# w(写) = 2
# x(执行) = 1
# rwx = 7, rw- = 6, r-- = 4
```

### 修改权限 ⭐⭐⭐⭐⭐

```bash
# chmod - 修改权限 ⭐⭐⭐⭐⭐
chmod 755 file.sh         # rwxr-xr-x
chmod 644 file.txt        # rw-r--r--
chmod +x file.sh          # 添加执行权限
chmod -x file.sh          # 移除执行权限
chmod u+x file.sh         # 所有者添加执行权限
chmod g+w file.txt        # 组添加写权限
chmod o-r file.txt        # 其他人移除读权限

# chown - 修改所有者 ⭐⭐⭐⭐
sudo chown user file.txt
sudo chown user:group file.txt
sudo chown -R user:group directory/

# chgrp - 修改组
sudo chgrp group file.txt
```

## 3. 文本处理 ⭐⭐⭐⭐⭐

### grep - 文本搜索 ⭐⭐⭐⭐⭐

```bash
# 基本搜索
grep "pattern" file.txt
grep "error" application.log

# 常用选项
grep -i "error" file.txt      # 忽略大小写
grep -n "error" file.txt      # 显示行号
grep -v "error" file.txt      # 反向匹配（不包含）
grep -r "pattern" directory/  # 递归搜索
grep -c "error" file.txt      # 统计匹配行数
grep -A 3 "error" file.txt    # 显示匹配行及后3行
grep -B 3 "error" file.txt    # 显示匹配行及前3行
grep -C 3 "error" file.txt    # 显示匹配行及前后3行

# 正则表达式
grep "^error" file.txt        # 以error开头
grep "error$" file.txt        # 以error结尾
grep "erro[r|n]" file.txt     # error或erron
```

### sed - 文本替换 ⭐⭐⭐⭐

```bash
# 替换文本
sed 's/old/new/' file.txt              # 替换每行第一个
sed 's/old/new/g' file.txt             # 替换所有
sed -i 's/old/new/g' file.txt          # 直接修改文件
sed '1,10s/old/new/g' file.txt         # 替换1-10行

# 删除行
sed '1d' file.txt                      # 删除第1行
sed '1,10d' file.txt                   # 删除1-10行
sed '/pattern/d' file.txt              # 删除匹配行
```

### awk - 文本分析 ⭐⭐⭐⭐

```bash
# 打印列
awk '{print $1}' file.txt              # 打印第1列
awk '{print $1, $3}' file.txt          # 打印第1和第3列
awk -F: '{print $1}' /etc/passwd       # 指定分隔符

# 条件过滤
awk '$3 > 100' file.txt                # 第3列大于100
awk '/error/ {print $0}' file.txt      # 包含error的行

# 统计
awk '{sum+=$1} END {print sum}' file.txt  # 求和
```

### 其他文本工具

```bash
# wc - 统计 ⭐⭐⭐⭐⭐
wc file.txt           # 行数 单词数 字节数
wc -l file.txt        # 统计行数
wc -w file.txt        # 统计单词数

# sort - 排序 ⭐⭐⭐⭐
sort file.txt
sort -r file.txt      # 逆序
sort -n file.txt      # 数字排序
sort -u file.txt      # 去重排序

# uniq - 去重 ⭐⭐⭐⭐
uniq file.txt
sort file.txt | uniq  # 先排序再去重
uniq -c file.txt      # 统计重复次数

# cut - 切割 ⭐⭐⭐⭐
cut -d: -f1 /etc/passwd        # 以:分割，取第1列
cut -c1-10 file.txt            # 取每行1-10字符
```

## 4. 进程管理 ⭐⭐⭐⭐⭐

### 查看进程

```bash
# ps - 查看进程 ⭐⭐⭐⭐⭐
ps aux                # 查看所有进程
ps aux | grep java    # 查找Java进程
ps -ef | grep mysql   # 查找MySQL进程

# top - 实时监控 ⭐⭐⭐⭐⭐
top                   # 实时查看进程
top -u username       # 查看指定用户进程

# htop - 增强版top（需安装）⭐⭐⭐⭐⭐
htop

# 查看进程树
pstree
pstree -p             # 显示PID
```

### 管理进程

```bash
# 杀死进程 ⭐⭐⭐⭐⭐
kill PID              # 正常终止
kill -9 PID           # 强制终止
killall process_name  # 杀死所有同名进程
pkill -f "java.*myapp"  # 模糊匹配杀死

# 后台运行 ⭐⭐⭐⭐⭐
command &             # 后台运行
nohup command &       # 后台运行，忽略挂断信号
nohup java -jar app.jar > app.log 2>&1 &

# 查看后台任务
jobs
fg %1                 # 将后台任务调到前台
bg %1                 # 继续后台任务
```

## 5. 系统信息 ⭐⭐⭐⭐⭐

```bash
# 系统信息
uname -a              # 系统信息
hostname              # 主机名
uptime                # 运行时间
date                  # 当前时间

# CPU和内存 ⭐⭐⭐⭐⭐
free -h               # 内存使用情况
df -h                 # 磁盘使用情况
du -sh directory/     # 目录大小
du -h --max-depth=1   # 当前目录各子目录大小

# 网络信息 ⭐⭐⭐⭐⭐
ifconfig              # 网络接口（旧）
ip addr               # 网络接口（新）
netstat -tuln         # 监听端口
ss -tuln              # 监听端口（新）
lsof -i :8080         # 查看端口占用
```

## 6. 网络命令 ⭐⭐⭐⭐

```bash
# ping - 测试连通性 ⭐⭐⭐⭐⭐
ping google.com
ping -c 4 google.com  # 发送4个包

# curl - HTTP请求 ⭐⭐⭐⭐⭐
curl http://example.com
curl -X POST http://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'

# wget - 下载文件 ⭐⭐⭐⭐⭐
wget http://example.com/file.zip
wget -O custom_name.zip http://example.com/file.zip

# telnet - 测试端口
telnet localhost 8080

# nc - 网络工具
nc -zv localhost 8080  # 测试端口
```

## 7. 压缩和解压 ⭐⭐⭐⭐⭐

```bash
# tar - 打包 ⭐⭐⭐⭐⭐
tar -cvf archive.tar directory/       # 打包
tar -czvf archive.tar.gz directory/   # 打包并gzip压缩
tar -cjvf archive.tar.bz2 directory/  # 打包并bzip2压缩

# 解包 ⭐⭐⭐⭐⭐
tar -xvf archive.tar
tar -xzvf archive.tar.gz
tar -xjvf archive.tar.bz2
tar -xzvf archive.tar.gz -C /path/    # 解压到指定目录

# 查看内容
tar -tvf archive.tar

# zip/unzip ⭐⭐⭐⭐
zip -r archive.zip directory/
unzip archive.zip
unzip archive.zip -d /path/
```

## 8. 服务管理（systemd）⭐⭐⭐⭐⭐

```bash
# systemctl - 服务管理 ⭐⭐⭐⭐⭐
sudo systemctl start service_name     # 启动服务
sudo systemctl stop service_name      # 停止服务
sudo systemctl restart service_name   # 重启服务
sudo systemctl status service_name    # 查看状态
sudo systemctl enable service_name    # 开机自启
sudo systemctl disable service_name   # 禁用自启

# 常用服务
sudo systemctl start mysql
sudo systemctl start nginx
sudo systemctl start docker
```

## 9. 用户管理 ⭐⭐⭐⭐

```bash
# 用户操作
sudo useradd username         # 创建用户
sudo passwd username          # 设置密码
sudo userdel username         # 删除用户
sudo usermod -aG group user   # 添加用户到组

# 切换用户
su - username                 # 切换用户
sudo command                  # 以root权限执行

# 查看用户
whoami                        # 当前用户
id                            # 用户ID和组ID
groups                        # 用户所属组
```

## 10. Shell脚本基础 ⭐⭐⭐⭐⭐

### 基础脚本

```bash
#!/bin/bash
# 这是注释

# 变量
NAME="John"
echo "Hello, $NAME"

# 条件判断
if [ -f "file.txt" ]; then
    echo "文件存在"
else
    echo "文件不存在"
fi

# 循环
for i in {1..5}; do
    echo "Number: $i"
done

# 函数
function greet() {
    echo "Hello, $1"
}
greet "World"
```

### 实用脚本示例

```bash
#!/bin/bash
# 部署Spring Boot应用

APP_NAME="myapp"
JAR_FILE="target/myapp.jar"
PID_FILE="/var/run/$APP_NAME.pid"

# 停止应用
if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    kill $PID
    echo "应用已停止"
fi

# 启动应用
nohup java -jar $JAR_FILE > app.log 2>&1 &
echo $! > $PID_FILE
echo "应用已启动，PID: $(cat $PID_FILE)"
```

## 💡 常用组合命令 ⭐⭐⭐⭐⭐

```bash
# 查找并删除.class文件
find . -name "*.class" -type f -delete

# 查找大文件
find / -type f -size +100M -exec ls -lh {} \;

# 统计代码行数
find . -name "*.java" | xargs wc -l

# 查看最占空间的目录
du -h --max-depth=1 | sort -hr | head -10

# 查看日志中的错误
tail -f application.log | grep -i error

# 批量重命名
for file in *.txt; do mv "$file" "${file%.txt}.md"; done

# 监控端口
watch -n 1 'netstat -tuln | grep 8080'
```

## 🎯 Java开发常用命令 ⭐⭐⭐⭐⭐

```bash
# 查找Java进程
ps aux | grep java
jps                   # Java进程

# 查看Java进程详情
jinfo PID
jstat -gc PID 1000    # 每秒查看GC情况

# 生成堆转储
jmap -dump:format=b,file=heap.bin PID

# 查看线程栈
jstack PID

# 查看Spring Boot应用日志
tail -f logs/spring.log | grep -i error

# 部署应用
nohup java -jar -Xms512m -Xmx1024m app.jar \
  --spring.profiles.active=prod > app.log 2>&1 &
```

## 📚 下一步

学习完Linux基础后，继续学习：
- [Java基础语法](../01-Java基础/基础语法.md)
- [Docker容器化](./Docker容器化.md)

