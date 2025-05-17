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
    editLink: {
      pattern: 'https://github.com/mentalcardgames/mentalcardgames.github.io/edit/main/:path'
    },
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
        text: "Project",
        items: [
          {
            text: "Architecture",
            link: "/architecture",
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
