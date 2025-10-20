# VitePress 配置说明

本目录包含 VitePress 的主题配置文件，采用模块化结构便于维护和管理。

## 📁 文件结构

```
.vitepress/config/
├── nav.mts           # 导航栏配置
├── sidebar.mts       # 侧边栏配置
├── themeConfig.mts   # 主题配置（汇总）
└── README.md         # 配置说明文档
```

## 📝 配置文件说明

### nav.mts - 导航栏配置

定义网站顶部导航栏的菜单项。

**类型**: `DefaultTheme.NavItem[]`

**示例**:

```typescript
export const nav: DefaultTheme.NavItem[] = [
  { text: "首页", link: "/" },
  { text: "学习路线", link: "/README" },
  {
    text: "阶段学习",
    items: [
      { text: "Java基础", link: "/01-Java基础/基础语法" },
      // ... 更多子菜单
    ],
  },
];
```

### sidebar.mts - 侧边栏配置

定义文档侧边栏的目录结构。

**类型**: `DefaultTheme.Sidebar`

**特性**:

- 支持分组
- 支持折叠/展开
- 支持 emoji 图标

**示例**:

```typescript
export const sidebar: DefaultTheme.Sidebar = [
  {
    text: "📚 Java基础",
    collapsed: false, // 默认展开
    items: [
      { text: "基础语法", link: "/01-Java基础/基础语法" },
      // ... 更多项
    ],
  },
];
```

### themeConfig.mts - 主题配置

汇总所有主题相关配置，包括导航栏、侧边栏、社交链接、搜索等。

**包含配置**:

- `nav` - 导航栏（从 nav.mts 导入）
- `sidebar` - 侧边栏（从 sidebar.mts 导入）
- `socialLinks` - 社交链接（GitHub 等）
- `search` - 本地搜索配置
- `outline` - 大纲显示配置
- `docFooter` - 文档页脚（上一页/下一页）
- `footer` - 网站页脚

## 🔧 如何修改配置

### 添加新的导航菜单

1. 编辑 `nav.mts` 文件
2. 在数组中添加新的菜单项
3. 保存后自动生效

```typescript
// 添加新的顶级菜单
{ text: "新菜单", link: "/new-page" }

// 添加带子菜单的下拉菜单
{
  text: "新分类",
  items: [
    { text: "子页面1", link: "/category/page1" },
    { text: "子页面2", link: "/category/page2" }
  ]
}
```

### 添加新的侧边栏分组

1. 编辑 `sidebar.mts` 文件
2. 在数组中添加新的分组对象
3. 设置 `collapsed` 属性控制默认展开状态

```typescript
{
  text: "🆕 新分类",
  collapsed: true,  // 默认折叠
  items: [
    { text: "新页面", link: "/new-category/new-page" }
  ]
}
```

### 修改社交链接

编辑 `themeConfig.mts` 文件中的 `socialLinks` 配置：

```typescript
socialLinks: [
  { icon: "github", link: "https://github.com/your-username/repo" },
  { icon: "twitter", link: "https://twitter.com/your-username" },
];
```

### 修改搜索配置

当前使用本地搜索，如需自定义可编辑 `themeConfig.mts`：

```typescript
search: {
  provider: "local",
  options: {
    // 自定义搜索选项
  },
};
```

## 🎨 最佳实践

1. **模块化管理**: 保持配置文件的模块化结构，不要将所有配置写在一个文件中
2. **使用 emoji**: 在侧边栏标题中使用 emoji 可以提升视觉效果
3. **合理折叠**: 将不常用的分组设置为 `collapsed: true`
4. **保持同步**: 修改导航/侧边栏后，确保对应的 markdown 文件存在
5. **类型安全**: 使用 TypeScript 类型确保配置的正确性

## 🔗 相关文档

- [VitePress 官方文档](https://vitepress.dev/)
- [默认主题配置](https://vitepress.dev/reference/default-theme-config)
- [导航配置](https://vitepress.dev/reference/default-theme-nav)
- [侧边栏配置](https://vitepress.dev/reference/default-theme-sidebar)

## 📦 配置导入关系

```
config.mts (主配置)
  └── themeConfig.mts (主题配置)
      ├── nav.mts (导航)
      └── sidebar.mts (侧边栏)
```

## ✅ 配置验证

修改配置后，运行以下命令验证：

```bash
# 开发模式（热更新）
pnpm docs:dev

# 构建验证
pnpm docs:build
```
