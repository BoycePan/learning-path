# 📦 GitHub Pages 部署指南

## 🚀 快速部署步骤

### 1️⃣ 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `java-learning-path` （或其他名称）
   - **Description**: `2025年Java学习路线 - 从基础到微服务`
   - **Public** （必须是公开仓库才能使用免费的 GitHub Pages）
   - ✅ **不要**勾选 "Add a README file"
4. 点击 **Create repository**

### 2️⃣ 配置 VitePress base 路径

⚠️ **重要**：如果你的仓库名**不是** `你的用户名.github.io`，需要修改配置。

打开 `.vitepress/config.mts`，在开头添加 `base` 配置：

```typescript
export default defineConfig({
  base: '/java-learning-path/', // 改为你的仓库名
  title: "Java学习路线 2025",
  // ... 其他配置
})
```

**示例**：
- 如果仓库名是 `java-learning-path`，则 `base: '/java-learning-path/'`
- 如果仓库名是 `你的用户名.github.io`，则**不需要**设置 base，或设置为 `base: '/'`

### 3️⃣ 初始化 Git 并推送代码

在项目根目录运行以下命令：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交：Java学习路线项目"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/java-learning-path.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4️⃣ 配置 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 下拉菜单中选择：
   - **GitHub Actions** （不是 Deploy from a branch）
5. 保存设置

### 5️⃣ 触发部署

推送代码后，GitHub Actions 会自动运行：

1. 访问仓库的 **Actions** 标签页
2. 你会看到 "Deploy VitePress to GitHub Pages" 工作流正在运行
3. 等待构建完成（约 2-3 分钟）
4. 构建成功后，访问你的网站：

```
https://你的用户名.github.io/java-learning-path/
```

## 🔧 配置文件说明

### `.github/workflows/deploy.yml`

这是 GitHub Actions 的配置文件，定义了自动部署流程：

- ✅ 检出代码
- ✅ 安装 Node.js 和 pnpm
- ✅ 安装依赖
- ✅ 构建 VitePress
- ✅ 部署到 GitHub Pages

### `.vitepress/config.mts`

VitePress 的配置文件，包含：
- `base`: 网站的基础路径
- `title`: 网站标题
- `themeConfig`: 主题配置（导航、侧边栏等）

## 📝 完整示例

假设你的 GitHub 用户名是 `zhangsan`，仓库名是 `java-learning-path`：

### 1. 修改配置

```typescript
// .vitepress/config.mts
export default defineConfig({
  base: '/java-learning-path/', // ⚠️ 注意斜杠
  title: "Java学习路线 2025",
  // ...
})
```

### 2. 提交并推送

```bash
git add .vitepress/config.mts
git commit -m "配置 base 路径"
git push
```

### 3. 访问网站

```
https://zhangsan.github.io/java-learning-path/
```

## 🎯 常见问题

### Q1: 部署后页面显示 404

**原因**：`base` 路径配置错误

**解决方案**：
1. 检查 `.vitepress/config.mts` 中的 `base` 配置
2. 确保 `base` 与仓库名一致
3. 注意前后都要有斜杠：`/仓库名/`

### Q2: 样式丢失或加载失败

**原因**：同样是 `base` 路径问题

**解决方案**：
```typescript
// ✅ 正确
base: '/java-learning-path/'

// ❌ 错误
base: '/java-learning-path'   // 缺少尾部斜杠
base: 'java-learning-path/'   // 缺少开头斜杠
```

### Q3: Actions 构建失败

**解决方案**：
1. 检查 Actions 日志：仓库 → Actions → 点击失败的工作流
2. 常见原因：
   - 依赖安装失败：检查 `pnpm-lock.yaml` 是否提交
   - 构建错误：本地先运行 `pnpm docs:build` 测试

### Q4: 如何更新网站？

只需要推送代码到 GitHub：

```bash
git add .
git commit -m "更新内容"
git push
```

GitHub Actions 会自动重新部署。

## 🔄 更新流程

### 日常更新

```bash
# 1. 修改文档
# 2. 本地预览
pnpm docs:dev --host 0.0.0.0

# 3. 确认无误后提交
git add .
git commit -m "更新：添加新内容"
git push

# 4. 等待 GitHub Actions 自动部署
# 5. 访问网站查看更新
```

## 🌐 自定义域名（可选）

如果你有自己的域名：

### 1. 添加 CNAME 文件

在 `public` 目录创建 `CNAME` 文件：

```bash
mkdir -p public
echo "yourdomain.com" > public/CNAME
```

### 2. 配置 DNS

在你的域名提供商添加 DNS 记录：

```
类型: CNAME
名称: www (或 @)
值: 你的用户名.github.io
```

### 3. 在 GitHub 配置自定义域名

Settings → Pages → Custom domain → 输入域名 → Save

### 4. 更新 VitePress 配置

```typescript
export default defineConfig({
  base: '/', // 使用自定义域名时设置为 /
  // ...
})
```

## 📊 监控部署状态

### 方法1：GitHub Badge

在 README.md 中添加状态徽章：

```markdown
[![Deploy](https://github.com/你的用户名/java-learning-path/actions/workflows/deploy.yml/badge.svg)](https://github.com/你的用户名/java-learning-path/actions/workflows/deploy.yml)
```

### 方法2：查看 Actions

访问：`https://github.com/你的用户名/java-learning-path/actions`

## 🎉 完成！

现在你的 Java 学习路线已经部署到 GitHub Pages 了！

- 🌐 **在线访问**：https://你的用户名.github.io/仓库名/
- 📝 **编辑内容**：直接修改 Markdown 文件
- 🚀 **自动部署**：推送代码即可
- 🔍 **全文搜索**：内置搜索功能
- 📱 **移动适配**：响应式设计

---

## 📚 相关链接

- [VitePress 官方文档](https://vitepress.dev/)
- [GitHub Pages 文档](https://docs.github.com/pages)
- [GitHub Actions 文档](https://docs.github.com/actions)

有问题？查看 GitHub Actions 的运行日志或提 Issue！

