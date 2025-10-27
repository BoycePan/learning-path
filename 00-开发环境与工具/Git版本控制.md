# Git版本控制

## 📌 学习目标

- 理解版本控制的概念
- 掌握Git基础命令
- 熟练使用Git分支
- 掌握团队协作流程
- 了解GitHub/Gitee使用

## ⭐ 核心概念

- **版本控制** ⭐⭐⭐⭐⭐
- **分支管理** ⭐⭐⭐⭐⭐
- **远程仓库** ⭐⭐⭐⭐⭐
- **团队协作** ⭐⭐⭐⭐⭐
- **冲突解决** ⭐⭐⭐⭐

## 1. Git简介 ⭐⭐⭐⭐⭐

### 什么是Git？

Git是一个**分布式版本控制系统**，用于：

1. **代码版本管理** - 记录每次修改
2. **团队协作** - 多人同时开发
3. **代码备份** - 防止代码丢失
4. **历史追溯** - 查看修改历史

### Git vs SVN

| 特性 | Git | SVN |
|------|-----|-----|
| 类型 | 分布式 ⭐⭐⭐⭐⭐ | 集中式 |
| 速度 | 快 ⭐⭐⭐⭐⭐ | 慢 |
| 离线工作 | 支持 ⭐⭐⭐⭐⭐ | 不支持 |
| 分支 | 轻量级 ⭐⭐⭐⭐⭐ | 重量级 |
| 学习曲线 | 较陡 | 简单 |

## 2. Git基础配置 ⭐⭐⭐⭐⭐

### 初次配置

```bash
# 设置用户名和邮箱（必须）⭐⭐⭐⭐⭐
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"

# 设置默认编辑器
git config --global core.editor "vim"

# 设置换行符处理
git config --global core.autocrlf input   # macOS/Linux
git config --global core.autocrlf true    # Windows

# 设置默认分支名
git config --global init.defaultBranch main

# 查看配置
git config --list
git config user.name
git config user.email

# 配置别名（提高效率）⭐⭐⭐⭐
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

### 配置文件位置

```bash
# 系统级配置
/etc/gitconfig

# 用户级配置（推荐）⭐⭐⭐⭐⭐
~/.gitconfig

# 项目级配置
.git/config
```

## 3. Git基础操作 ⭐⭐⭐⭐⭐

### 创建仓库

```bash
# 初始化新仓库 ⭐⭐⭐⭐⭐
git init

# 克隆远程仓库 ⭐⭐⭐⭐⭐
git clone https://github.com/username/repo.git
git clone https://github.com/username/repo.git my-project  # 指定目录名

# 克隆指定分支
git clone -b develop https://github.com/username/repo.git
```

### 文件状态

```bash
# 查看状态 ⭐⭐⭐⭐⭐
git status
git status -s  # 简洁输出

# 文件状态说明
# ?? - 未跟踪（Untracked）
# A  - 已暂存（Staged）
# M  - 已修改（Modified）
# D  - 已删除（Deleted）
```

### 添加和提交 ⭐⭐⭐⭐⭐

```bash
# 添加文件到暂存区 ⭐⭐⭐⭐⭐
git add file.txt           # 添加单个文件
git add *.java            # 添加所有Java文件
git add .                 # 添加所有文件（最常用）
git add -A                # 添加所有文件（包括删除）

# 提交到本地仓库 ⭐⭐⭐⭐⭐
git commit -m "提交说明"
git commit -am "提交说明"  # 跳过add，直接提交已跟踪文件

# 修改最后一次提交 ⭐⭐⭐⭐
git commit --amend -m "新的提交说明"
```

### 查看历史 ⭐⭐⭐⭐⭐

```bash
# 查看提交历史 ⭐⭐⭐⭐⭐
git log
git log --oneline          # 单行显示
git log --graph            # 图形化显示
git log --all              # 显示所有分支
git log -5                 # 显示最近5条
git log --author="张三"    # 查看某人的提交

# 查看文件修改历史
git log -p file.txt
git log --follow file.txt  # 包括重命名

# 查看某次提交的详情
git show commit-id

# 查看简洁历史（推荐）⭐⭐⭐⭐⭐
git log --graph --oneline --all
```

### 查看差异 ⭐⭐⭐⭐

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和仓库的差异
git diff --staged
git diff --cached

# 查看两个提交之间的差异
git diff commit1 commit2

# 查看某个文件的差异
git diff file.txt
```

## 4. 分支管理 ⭐⭐⭐⭐⭐

### 分支基础

```bash
# 查看分支 ⭐⭐⭐⭐⭐
git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支

# 创建分支 ⭐⭐⭐⭐⭐
git branch feature-login

# 切换分支 ⭐⭐⭐⭐⭐
git checkout feature-login
git switch feature-login    # Git 2.23+推荐

# 创建并切换分支（常用）⭐⭐⭐⭐⭐
git checkout -b feature-login
git switch -c feature-login

# 删除分支 ⭐⭐⭐⭐
git branch -d feature-login   # 安全删除
git branch -D feature-login   # 强制删除

# 重命名分支
git branch -m old-name new-name
```

### 合并分支 ⭐⭐⭐⭐⭐

```bash
# 合并分支（Fast-forward）⭐⭐⭐⭐⭐
git checkout main
git merge feature-login

# 禁用Fast-forward（保留分支历史）⭐⭐⭐⭐
git merge --no-ff feature-login -m "合并feature-login分支"

# 变基（Rebase）⭐⭐⭐⭐
git checkout feature-login
git rebase main

# 取消合并
git merge --abort
```

### 分支策略 ⭐⭐⭐⭐⭐

```bash
# Git Flow工作流（推荐）⭐⭐⭐⭐⭐
main        # 主分支，生产环境代码
develop     # 开发分支
feature/*   # 功能分支
release/*   # 发布分支
hotfix/*    # 热修复分支

# 示例：开发新功能
git checkout develop
git checkout -b feature/user-login
# 开发完成后
git checkout develop
git merge --no-ff feature/user-login
git branch -d feature/user-login
```

## 5. 远程仓库 ⭐⭐⭐⭐⭐

### 远程仓库操作

```bash
# 查看远程仓库 ⭐⭐⭐⭐⭐
git remote
git remote -v           # 显示URL

# 添加远程仓库 ⭐⭐⭐⭐⭐
git remote add origin https://github.com/username/repo.git

# 修改远程仓库URL
git remote set-url origin https://github.com/username/new-repo.git

# 删除远程仓库
git remote remove origin

# 重命名远程仓库
git remote rename origin upstream
```

### 推送和拉取 ⭐⭐⭐⭐⭐

```bash
# 推送到远程仓库 ⭐⭐⭐⭐⭐
git push origin main
git push -u origin main    # 首次推送，设置上游分支
git push                   # 后续推送

# 推送所有分支
git push --all

# 推送标签
git push --tags

# 强制推送（慎用！）⭐⭐⭐
git push -f origin main

# 拉取远程更新 ⭐⭐⭐⭐⭐
git pull origin main       # fetch + merge
git pull --rebase          # fetch + rebase（推荐）

# 仅获取不合并
git fetch origin
```

## 6. 撤销操作 ⭐⭐⭐⭐⭐

### 撤销修改

```bash
# 撤销工作区修改 ⭐⭐⭐⭐⭐
git checkout -- file.txt
git restore file.txt       # Git 2.23+

# 撤销暂存区修改 ⭐⭐⭐⭐⭐
git reset HEAD file.txt
git restore --staged file.txt

# 撤销提交 ⭐⭐⭐⭐
git reset --soft HEAD~1    # 保留修改，撤销提交
git reset --mixed HEAD~1   # 保留修改，撤销提交和暂存
git reset --hard HEAD~1    # 删除修改（危险！）

# 回退到指定提交
git reset --hard commit-id

# 创建反向提交（推荐）⭐⭐⭐⭐⭐
git revert commit-id
```

### 暂存工作 ⭐⭐⭐⭐

```bash
# 暂存当前工作 ⭐⭐⭐⭐
git stash
git stash save "暂存说明"

# 查看暂存列表
git stash list

# 恢复暂存
git stash pop              # 恢复并删除
git stash apply            # 仅恢复
git stash apply stash@{0}  # 恢复指定暂存

# 删除暂存
git stash drop stash@{0}
git stash clear            # 清空所有暂存
```

## 7. .gitignore文件 ⭐⭐⭐⭐⭐

### Java项目.gitignore示例

```gitignore
# 编译输出
target/
*.class
*.jar
*.war
*.ear

# IDE文件
.idea/
*.iml
.vscode/
.settings/
.project
.classpath

# 日志文件
*.log
logs/

# 临时文件
*.tmp
*.bak
*.swp
*~

# 操作系统文件
.DS_Store
Thumbs.db

# Maven
.mvn/
mvnw
mvnw.cmd

# Gradle
.gradle/
build/

# Spring Boot
application-local.properties
application-dev.properties

# 数据库
*.db
*.sqlite

# 环境变量
.env
```

## 8. 标签管理 ⭐⭐⭐⭐

```bash
# 创建标签 ⭐⭐⭐⭐
git tag v1.0.0
git tag -a v1.0.0 -m "版本1.0.0发布"

# 查看标签
git tag
git show v1.0.0

# 推送标签
git push origin v1.0.0
git push origin --tags

# 删除标签
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

## 9. 团队协作流程 ⭐⭐⭐⭐⭐

### Fork + Pull Request流程

```bash
# 1. Fork项目到自己的GitHub

# 2. 克隆自己的仓库
git clone https://github.com/your-username/repo.git

# 3. 添加上游仓库
git remote add upstream https://github.com/original-owner/repo.git

# 4. 创建功能分支
git checkout -b feature/new-feature

# 5. 开发并提交
git add .
git commit -m "添加新功能"

# 6. 推送到自己的仓库
git push origin feature/new-feature

# 7. 在GitHub上创建Pull Request

# 8. 同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 10. 常见问题解决 ⭐⭐⭐⭐⭐

### 冲突解决

```bash
# 1. 拉取代码时出现冲突
git pull origin main

# 2. 手动解决冲突文件
# <<<<<<< HEAD
# 你的修改
# =======
# 别人的修改
# >>>>>>> commit-id

# 3. 标记为已解决
git add conflict-file.txt

# 4. 完成合并
git commit -m "解决冲突"
```

### 撤销已推送的提交

```bash
# 方法1：revert（推荐）⭐⭐⭐⭐⭐
git revert commit-id
git push origin main

# 方法2：reset + force push（慎用）
git reset --hard commit-id
git push -f origin main
```

## 💡 最佳实践 ⭐⭐⭐⭐⭐

### 提交信息规范

```bash
# 格式：<type>: <subject>

# type类型：
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
test:     测试相关
chore:    构建/工具相关

# 示例：
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复登录验证码错误"
git commit -m "docs: 更新README文档"
```

### 分支命名规范

```bash
feature/功能名    # 功能分支
bugfix/bug描述    # bug修复
hotfix/紧急修复   # 热修复
release/版本号    # 发布分支

# 示例：
feature/user-login
bugfix/fix-null-pointer
hotfix/security-patch
release/v1.0.0
```

## 🎯 实战练习

1. 创建本地仓库并提交代码
2. 创建GitHub仓库并推送
3. 创建分支开发新功能
4. 模拟冲突并解决
5. 使用Fork工作流协作

## 📚 下一步

学习完Git后，继续学习：
- [Docker容器化](./Docker容器化.md)
- [Linux基础命令](./Linux基础命令.md)

