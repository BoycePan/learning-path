import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/learning-path/",
  title: "Java学习路线 2025",
  description: "详细的Java学习路线，从基础到微服务",
  lang: "zh-CN",
  head: [
    // 添加图标
    ["link", { rel: "icon", href: "/icon/favicon.ico" }],
  ],

  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "学习路线", link: "/README" },
      {
        text: "阶段学习",
        items: [
          { text: "Java基础", link: "/01-Java基础/基础语法" },
          { text: "Java进阶", link: "/02-Java进阶/多线程并发" },
          { text: "数据库", link: "/03-数据库/MySQL" },
          { text: "Spring生态", link: "/04-Spring生态/Spring核心" },
          { text: "微服务", link: "/05-微服务与中间件/微服务架构" },
          { text: "项目实战", link: "/06-项目实战/项目实战" },
        ],
      },
    ],

    sidebar: [
      {
        text: "🎯 开始学习",
        items: [{ text: "学习路线总览", link: "/README" }],
      },
      {
        text: "📚 Java基础",
        collapsed: false,
        items: [
          { text: "基础语法", link: "/01-Java基础/基础语法" },
          { text: "面向对象", link: "/01-Java基础/面向对象" },
          { text: "集合框架", link: "/01-Java基础/集合框架" },
          { text: "异常处理", link: "/01-Java基础/异常处理" },
        ],
      },
      {
        text: "🚀 Java进阶",
        collapsed: false,
        items: [
          { text: "多线程并发", link: "/02-Java进阶/多线程并发" },
          { text: "IO与NIO", link: "/02-Java进阶/IO与NIO" },
          { text: "JVM原理", link: "/02-Java进阶/JVM原理" },
          { text: "函数式编程", link: "/02-Java进阶/函数式编程" },
        ],
      },
      {
        text: "💾 数据库",
        collapsed: true,
        items: [
          { text: "MySQL", link: "/03-数据库/MySQL" },
          { text: "Redis", link: "/03-数据库/Redis" },
          { text: "MyBatis", link: "/03-数据库/MyBatis" },
        ],
      },
      {
        text: "🌱 Spring生态",
        collapsed: true,
        items: [
          { text: "Spring核心", link: "/04-Spring生态/Spring核心" },
          { text: "Spring Boot", link: "/04-Spring生态/SpringBoot" },
          { text: "Spring Cloud", link: "/04-Spring生态/SpringCloud" },
        ],
      },
      {
        text: "☁️ 微服务与中间件",
        collapsed: true,
        items: [
          { text: "微服务架构", link: "/05-微服务与中间件/微服务架构" },
          { text: "消息队列", link: "/05-微服务与中间件/消息队列" },
          { text: "分布式技术", link: "/05-微服务与中间件/分布式技术" },
          {
            text: "DDD领域驱动设计",
            link: "/05-微服务与中间件/DDD领域驱动设计",
          },
        ],
      },
      {
        text: "💼 项目实战",
        collapsed: true,
        items: [{ text: "项目实战指南", link: "/06-项目实战/项目实战" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/BoycePan/learning-path" },
    ],

    search: {
      provider: "local",
    },

    outline: {
      level: [2, 3],
      label: "目录",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    footer: {
      message: "© 2025 BoycePan. All rights reserved.",
      copyright: "MIT License",
    },
  },

  markdown: {
    lineNumbers: true,
  },

  // 忽略死链接检查（开发时建议设为 'warn'，生产环境可设为 true）
  ignoreDeadLinks: true,
});
