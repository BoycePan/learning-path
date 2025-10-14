@echo off
chcp 65001 >nul
echo ========================================
echo    Java学习路线 - GitHub 部署脚本
echo ========================================
echo.

REM 检查是否已经初始化 Git
if not exist .git (
    echo [1/5] 初始化 Git 仓库...
    git init
    echo.
) else (
    echo [1/5] Git 仓库已存在
    echo.
)

REM 添加所有文件
echo [2/5] 添加所有文件...
git add .
echo.

REM 提交
echo [3/5] 提交更改...
set /p commit_msg="请输入提交说明 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=更新内容
git commit -m "%commit_msg%"
echo.

REM 检查是否已添加远程仓库
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo [4/5] 添加远程仓库...
    echo.
    echo ⚠️  请先在 GitHub 创建仓库，然后输入仓库地址
    echo 例如: https://github.com/你的用户名/java-learning-path.git
    echo.
    set /p repo_url="请输入仓库地址: "
    git remote add origin %repo_url%
    echo.
    echo 设置主分支为 main...
    git branch -M main
    echo.
) else (
    echo [4/5] 远程仓库已配置
    echo.
)

REM 推送到 GitHub
echo [5/5] 推送到 GitHub...
git push -u origin main
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ 部署成功！
    echo ========================================
    echo.
    echo 📝 下一步：
    echo 1. 访问 GitHub 仓库的 Settings → Pages
    echo 2. Source 选择 "GitHub Actions"
    echo 3. 等待 Actions 构建完成
    echo 4. 访问你的网站
    echo.
) else (
    echo ========================================
    echo ❌ 推送失败！
    echo ========================================
    echo.
    echo 💡 可能的原因：
    echo 1. 首次推送需要先拉取: git pull origin main --allow-unrelated-histories
    echo 2. 需要身份验证: 配置 GitHub token 或 SSH
    echo 3. 远程仓库地址错误: 检查仓库 URL
    echo.
)

pause

