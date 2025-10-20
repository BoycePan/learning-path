import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.NavItem[] = [
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
];
