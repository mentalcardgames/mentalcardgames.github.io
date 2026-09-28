# Mental Card Games – Documentation Website

This directory contains the source code for the official Mental Card Games
documentation website, published at:  
👉 **[https://mentalcardgames.github.io/](https://mentalcardgames.github.io/)**

The site is built with [VitePress](https://vitepress.dev/) with Mermaid diagram
and LaTeX math support, compiling markdown files from `pages/` into static HTML.

## 1. Prerequisites & Dependencies

To transform the markdown files into HTML and run the local preview server, you
need a JavaScript runtime and package manager installed:

- **[Bun](https://bun.sh/)**
- Dependencies declared in [`package.json`](package.json):
    - `vitepress`: Static site generator powering the documentation.
    - `vitepress-plugin-mermaid` & `mermaid`:
      Rendering architecture and sequence diagrams.
    - `markdown-it-mathjax3`: MathJax / LaTeX equation rendering.

## 2. Installation

Navigate to this `docs/` directory and install the project dependencies:

```shell
bun install
```

## 3. Running the Server for Local Viewing

### Development Server (Hot-Reload)

To start the local development server with instant live preview:

```shell
bun run docs:dev
```

This starts the VitePress server (usually at `http://localhost:5173/`).
Any edits made to markdown files in `pages/` are immediately reloaded in your
browser via hot module replacement.
There won't be any need to restart the server or regenerate any files.

### Building & Previewing Static HTML

To test the final static HTML output (as published on GitHub Pages):

```shell
# Compile markdown to static HTML (outputs to .vitepress/dist):
bun run docs:build

# Preview the built HTML output locally:
bun run docs:preview
```

## 4. Git Remote URL & Commit Workflow

This repository is embedded as a Git submodule in the parent `mcg` repository:

- **Repository:**
  `https://github.com/mentalcardgames/mentalcardgames.github.io.git`
- **Submodule Path:**
  `docs/`

In order to properly commit & push changes to the website you'll want to change
the remote url.
The default utilizes HTTPS instead of ssh.

```shell
cd docs/

# Check current remote:
git remote -v

# Set SSH remote for write access:
git remote set-url origin git@github.com:mentalcardgames/mentalcardgames.github.io.git
```

### The Correct Commit Workflow ("Inside-Out")

Because `docs` is tracked as a Git submodule inside the main `mcg` workspace,
commits must always be executed from the **inside out**:

1. **Step 1: Commit and push INSIDE the `docs` submodule:**

   ```shell
   cd docs
   # Ensure you are on a branch, not in a detached HEAD state
   git checkout main
   git add .
   git commit -m "docs: update documentation content"
   git push origin main
   ```

2. **Step 2: Commit the updated submodule reference in the PARENT repository:**

   ```shell
   cd ..
   # Stage the submodule pointer update
   git add docs
   git commit -m "chore: update docs submodule reference"
   git push
   ```

> [!CAUTION] Never commit parent references before pushing the submodule!
> If you commit and push the parent repository before the submodule's new
> commit is pushed, other developers and CI pipelines checking out your branch
> will fail with `fatal: reference is not a tree` because the referenced commit
> does not exist on the remote repository.

## 5. Further Documentation

For full contribution guidelines, project architecture, and rules, please see:

- Online Guide:
  [https://mentalcardgames.github.io/organisational/contribute.html](https://mentalcardgames.github.io/organisational/contribute.html)
- Source File:
  [`pages/organisational/contribute.md`](pages/organisational/contribute.md)
- Main Project Repository:
  [https://github.com/mentalcardgames/mcg](https://github.com/mentalcardgames/mcg)
