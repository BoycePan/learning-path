import type { DefaultTheme } from "vitepress";
import { nav } from "./nav.mts";
import { sidebar } from "./sidebar.mts";

export const themeConfig: DefaultTheme.Config = {
  nav,
  sidebar,

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
};
