import type { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Sidebar = [
  {
    text: "🎯 开始学习",
    items: [
      { text: "学习路线总览", link: "/README" },
      { text: "更新日志", link: "/更新日志" },
    ],
  },
  {
    text: "🛠️ 第零阶段：开发环境与工具",
    collapsed: false,
    items: [
      { text: "开发环境搭建", link: "/00-开发环境与工具/开发环境搭建" },
      { text: "Maven构建工具", link: "/00-开发环境与工具/Maven构建工具" },
      { text: "Git版本控制", link: "/00-开发环境与工具/Git版本控制" },
      { text: "Docker容器化", link: "/00-开发环境与工具/Docker容器化" },
      { text: "Linux基础命令", link: "/00-开发环境与工具/Linux基础命令" },
    ],
  },
  {
    text: "☕ 第一阶段：Java基础",
    collapsed: false,
    items: [
      { text: "基础语法", link: "/01-Java基础/基础语法" },
      { text: "面向对象", link: "/01-Java基础/面向对象" },
      { text: "集合框架", link: "/01-Java基础/集合框架" },
      { text: "异常处理", link: "/01-Java基础/异常处理" },
      { text: "泛型与注解", link: "/01-Java基础/泛型与注解" },
      { text: "反射与动态代理", link: "/01-Java基础/反射与动态代理" },
      { text: "日期时间API", link: "/01-Java基础/日期时间API" },
    ],
  },
  {
    text: "🚀 第二阶段：Java进阶",
    collapsed: false,
    items: [
      { text: "多线程并发", link: "/02-Java进阶/多线程并发" },
      { text: "IO与NIO", link: "/02-Java进阶/IO与NIO" },
      { text: "JVM原理", link: "/02-Java进阶/JVM原理" },
      { text: "函数式编程", link: "/02-Java进阶/函数式编程" },
      { text: "设计模式", link: "/02-Java进阶/设计模式" },
      { text: "单元测试", link: "/02-Java进阶/单元测试" },
      { text: "网络编程", link: "/02-Java进阶/网络编程" },
    ],
  },
  {
    text: "💾 第三阶段：数据库技术",
    collapsed: true,
    items: [
      { text: "MySQL", link: "/03-数据库/MySQL" },
      { text: "Redis", link: "/03-数据库/Redis" },
      { text: "MyBatis", link: "/03-数据库/MyBatis" },
    ],
  },
  {
    text: "🌱 第四阶段：Spring生态",
    collapsed: true,
    items: [
      { text: "Spring核心", link: "/04-Spring生态/Spring核心" },
      { text: "Spring Boot", link: "/04-Spring生态/SpringBoot" },
      { text: "Spring Cloud", link: "/04-Spring生态/SpringCloud" },
      { text: "Spring Security", link: "/04-Spring生态/Spring Security" },
      { text: "Spring Data JPA", link: "/04-Spring生态/Spring Data JPA" },
    ],
  },
  {
    text: "☁️ 第五阶段：微服务与中间件",
    collapsed: true,
    items: [
      { text: "微服务架构", link: "/05-微服务与中间件/微服务架构" },
      { text: "消息队列", link: "/05-微服务与中间件/消息队列" },
      { text: "分布式技术", link: "/05-微服务与中间件/分布式技术" },
      {
        text: "DDD领域驱动设计",
        link: "/05-微服务与中间件/DDD领域驱动设计",
      },
      {
        text: "Nginx与服务部署",
        link: "/05-微服务与中间件/Nginx与服务部署",
      },
      { text: "Kubernetes入门", link: "/05-微服务与中间件/Kubernetes入门" },
      {
        text: "服务监控与链路追踪",
        link: "/05-微服务与中间件/服务监控与链路追踪",
      },
    ],
  },
  {
    text: "💼 第六阶段：项目实战",
    collapsed: true,
    items: [{ text: "项目实战指南", link: "/06-项目实战/项目实战" }],
  },
  {
    text: "🎯 第七阶段：面试与进阶",
    collapsed: false,
    items: [{ text: "Java面试题精选", link: "/07-面试与进阶/Java面试题精选" }],
  },
];
