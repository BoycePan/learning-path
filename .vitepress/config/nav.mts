import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.NavItem[] = [
  { text: "首页", link: "/" },
  { text: "学习路线", link: "/README" },
  {
    text: "🛠️ 开发环境",
    items: [
      { text: "开发环境搭建", link: "/00-开发环境与工具/开发环境搭建" },
      { text: "Maven构建工具", link: "/00-开发环境与工具/Maven构建工具" },
      { text: "Git版本控制", link: "/00-开发环境与工具/Git版本控制" },
      { text: "Docker容器化", link: "/00-开发环境与工具/Docker容器化" },
      { text: "Linux基础命令", link: "/00-开发环境与工具/Linux基础命令" },
    ],
  },
  {
    text: "☕ Java学习",
    items: [
      { text: "Java基础", link: "/01-Java基础/基础语法" },
      { text: "Java进阶", link: "/02-Java进阶/多线程并发" },
      { text: "设计模式", link: "/02-Java进阶/设计模式" },
      { text: "单元测试", link: "/02-Java进阶/单元测试" },
    ],
  },
  {
    text: "🌱 框架技术",
    items: [
      { text: "数据库技术", link: "/03-数据库/MySQL" },
      { text: "Spring核心", link: "/04-Spring生态/Spring核心" },
      { text: "Spring Boot", link: "/04-Spring生态/SpringBoot" },
      { text: "Spring Cloud", link: "/04-Spring生态/SpringCloud" },
      { text: "Spring Security", link: "/04-Spring生态/Spring Security" },
    ],
  },
  {
    text: "☁️ 微服务",
    items: [
      { text: "微服务架构", link: "/05-微服务与中间件/微服务架构" },
      { text: "消息队列", link: "/05-微服务与中间件/消息队列" },
      { text: "分布式技术", link: "/05-微服务与中间件/分布式技术" },
      { text: "Kubernetes", link: "/05-微服务与中间件/Kubernetes入门" },
      { text: "服务监控", link: "/05-微服务与中间件/服务监控与链路追踪" },
    ],
  },
  {
    text: "🎯 实战与面试",
    items: [
      { text: "项目实战", link: "/06-项目实战/项目实战" },
      { text: "面试题精选", link: "/07-面试与进阶/Java面试题精选" },
    ],
  },
];
