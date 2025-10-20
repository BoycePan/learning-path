import { defineConfig } from "vitepress";
import { themeConfig } from "./config/themeConfig.mts";

export default defineConfig({
  base: "/learning-path/",
  title: "Java学习路线 2025",
  description: "详细的Java学习路线，从基础到微服务",
  lang: "zh-CN",
  head: [
    // 添加图标
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],

  themeConfig,

  markdown: {
    lineNumbers: true,
  },

  // 忽略死链接检查
  ignoreDeadLinks: true,
});
