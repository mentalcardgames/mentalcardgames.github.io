import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    math: true,
  },
  title: "mental card games",
  description: "Mental Card Games Documentation",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/about" },
    ],

    sidebar: [
      {
        text: "Docs",
        items: [
          {
            text: "About",
            link: "/about",
          },
        ],
      },
      {
        text: "Organisational",
        items: [
          { text: "Platforms", link: "/organisational/platforms" },
          { text: "Contribute", link: "/organisational/contribute" },
          { text: "People", link: "/organisational/people" },
        ],
      },
      {
        text: "Examples",
        items: [{ text: "Markdown Examples", link: "/markdown-examples" }],
      },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/mentalcardgames" },
    ],
  },
});
