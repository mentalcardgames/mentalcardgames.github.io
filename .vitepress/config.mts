import { defineConfig } from "vitepress";
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid(
  defineConfig({
    srcDir: './pages',
    lastUpdated: true,
    markdown: {
      math: true,
      lineNumbers: true,
    },
    title: "Mental Card Games",
    description: "Mental Card Games Documentation",
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      editLink: {
        pattern: 'https://github.com/mentalcardgames/mentalcardgames.github.io/edit/main/:path'
      },
      nav: [
        { text: "Home", link: "/" },
        { text: "Docs", link: "/docs/about" },
      ],

      sidebar: [
        {
          text: "Docs",
          link: "/docs/",
          items: [
            { text: "About", link: "/docs/about" },
            { text: "Get Started", link: "/docs/get-started" },
            { text: "Local Documentation", link: "/docs/cargo" },
          ],
        },
        {
          text: "Project",
          link: "/project/",
          items: [
            { text: "Architecture", link: "/project/architecture" },
            { text: "Backend", link: "/project/backend" },
            { text: "TUI", link: "/project/tui" },
            { text: "Game Engine", link: "/project/engine" },
            { text: "Frontend", link: "/project/frontend" },
            { text: "QR-Code Protocol", link: "/project/qr-comm" },
            { text: "CGDL", link: "/project/cgdl" },
            { text: "Poker", link: "/project/poker" },
          ],
        },
        {
          text: "Organisational",
          items: [
            { text: "Contribute", link: "/organisational/contribute" },
            { text: "Information Sources", link: "/organisational/information" },
            { text: "People", link: "/organisational/people" },
          ],
        },
        {
          text: "Examples",
          items: [
            { text: "Markdown Examples", link: "/examples/markdown-examples" }
          ],
        },
        {
          text: "Archive",
          items: [
            { text: "Platform considerations", link: "/archive/platforms" },
            { text: "Architecture old", link: "/archive/architecture" },
          ],
        },
      ],
      search: {
        provider: "local",
      },
      socialLinks: [
        { icon: "github", link: "https://github.com/mentalcardgames" },
      ],
    },
  })
);
