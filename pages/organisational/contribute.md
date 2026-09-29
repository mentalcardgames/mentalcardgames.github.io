---
outline: deep
---

# Developer Setup & Rules

This guide outlines how to set up your local development environment, build the
project, and contribute new features or documentation to our codebase.
Please follow these instructions carefully to ensure compatibility across our
multi-platform workspace.

## 1. Prerequisites & Toolchain Setup

To develop and build both the frontend and backend, you will need the following
tools installed on your local machine:

1. **Rust Toolchain:**

   Install Rust stable using [rustup](https://rustup.rs) and add the
   WebAssembly compilation target:

     ```shell
     rustup target add wasm32-unknown-unknown
     ```

   This target is mandatory to compile our browser frontend crate into
   WebAssembly.
2. **Just Runner:**

   We use `just` as a command runner for project actions.

   ```shell
   cargo install just
   ```

3. **WebAssembly Pack (`wasm-pack`):**

   Needed to compile our Rust frontend into WebAssembly and generate JavaScript
   glue code.

   ```shell
   cargo install wasm-pack
   ```

4. **Optional** for this Documentation Website:

   We use [Bun](https://bun.sh) as the JavaScript runtime to compile markdown
   into HTML and preview the documentation website locally.

   Installing Bun is only advised for contributing changes to this website.
   More information about website specific dependencies, installation steps,
   and remote repository URLs, see
   [`docs/README.md`](https://github.com/mentalcardgames/mentalcardgames.github.io/blob/main/README.md).

## 2. Compiling WebAssembly (WASM) & Frontend

Our frontend is a WebAssembly application built with Rust and `egui`/`eframe`.

### The Build Pipeline

1. **Compilation:**
   `wasm-pack` compiles our `crates/frontend` crate, producing WebAssembly
   binaries and JS bindings.
2. **Artifact Directory:**
   The compiled outputs are saved under the workspace root folder `/pkg/`.
3. **Asset Serving:**
   The native backend server (`native_mcg`) automatically serves the HTML wrapper
   (`index.html`) and all files inside `/pkg/` to the browser.

### Why `crates/frontend` is Excluded from the Cargo Workspace

In the repository root
[`Cargo.toml`](https://github.com/mentalcardgames/mcg/blob/main/Cargo.toml),
you will notice that the `crates/frontend` crate is explicitly excluded:

```toml
[workspace]
members = [
    "crates/native_mcg",
    "crates/shared",
    "crates/qr_comm",
    "crates/cardgame_dsl/front_end",
    "crates/cardgame_dsl/lsp_server",
    "crates/cardgame_dsl/code_gen",
    "crates/engine",
    "crates/poker",
]
exclude = ["crates/frontend"]
```

This separation is necessary due to fundamental differences in compilation
targets:

- **Target Incompatibility:**
  The frontend crate targets `wasm32-unknown-unknown` and relies on browser APIs
  via `web-sys`, `wasm-bindgen`, and `js-sys`.
  It cannot compile for native operating system targets.
- **Native Dependency Conflicts:**
  Conversely, the backend, engine, and networking crates rely on native OS
  capabilities (multi-threaded `tokio` runtime, network sockets, OS threads,
  filesystem I/O) that do not compile under `wasm32-unknown-unknown`.
- **Cargo Workspace Constraint:**
  By default, Cargo expects all members in a workspace to compile against the
  same default build target.
  If `crates/frontend` were an included workspace member, standard workspace
  commands such as `cargo check --workspace` or `cargo test --workspace` on a
  host system would fail when trying to build the browser client for the host OS.
  Passing `--target wasm32-unknown-unknown` would conversely break on the native
  backend crates.

**Independent Verification:**
Because `frontend` is managed separately, verify, format, and lint it using its
dedicated manifest:

```shell
# Format frontend code
cargo fmt --manifest-path crates/frontend/Cargo.toml

# Run clippy on the frontend for the wasm32 target
cargo clippy --manifest-path crates/frontend/Cargo.toml --target wasm32-unknown-unknown

# Build frontend WebAssembly artifacts
just build dev      # Development profile
just build release  # Optimized release profile
```

### Key Just Recipes

We use `just` recipes to automate build and execution loops.
Run these from your root workspace:

- **Build Frontend (Release):**

  ```shell
  just build release
  ```

- **Run Developer Server (Frontend + Native Backend):**

  ```shell
  just start dev
  ```

  This command builds the frontend in development mode and launches the native backend server (serving on port 3000+).

- **Full CI/CD Verification Gate:**

  ```shell
  just ci                 # Runs format check, clippy, and tests across all crates (including frontend)
  just ci [CRATE]         # Runs full gate on a specific crate (e.g. `just ci frontend` or `just ci poker`)
  ```

- **Clippy, Formatting & Testing:**

  ```shell
  just clippy [CRATE]     # Run Clippy (defaults to all crates + frontend; accepts crate aliases)
  just fmt-check [CRATE]  # Check formatting without modifying files (alias: check-fmt)
  just fmt [CRATE]        # Automatically format files (alias: format)
  just test [CRATE]       # Run workspace unit/integration tests and frontend browser tests
  ```

## 3. Running the Documentation Website Locally

The documentation website is powered by [VitePress](https://vitepress.dev/).
The documentation files reside in the `docs/` directory as a Git submodule.
A standalone guide and dependency overview is also maintained directly in
[`docs/README.md`](https://github.com/mentalcardgames/mentalcardgames.github.io/blob/main/README.md).

### Quick Start

To view your documentation edits with instant hot-reloading:

1. **Open a terminal in the `docs/` directory:**

   ```shell
   cd docs
   ```

2. **Install dependencies:**

   ```shell
   bun install
   ```

3. **Start the local development server:**

   ```shell
   bun run docs:dev
   ```

   VitePress starts a local server (by default at `http://localhost:5173/`).
   Any changes made to markdown files in `docs/pages/` are immediately
   reflected in your browser with live reload.

### Building & Previewing Static Pages

To verify that the documentation builds cleanly without broken links or syntax
errors:

```shell
# Build static HTML site
bun run docs:build 

# Preview production build locally
bun run docs:preview
```

## 4. Working with Git Submodules

The `docs/` directory is integrated as a Git submodule referencing the public
documentation repository:
`https://github.com/mentalcardgames/mentalcardgames.github.io.git`.

Because submodules track specific commit hashes rather than working trees,
follow these essential workflows:

### A. Cloning with Submodules vs. Cloning Separately

- **Cloning the main repository with submodules:**
  When cloning `mcg` for the first time, include `--recurse-submodules` so that
  Git immediately pulls the submodule contents:

  ```shell
  git clone --recurse-submodules https://github.com/mentalcardgames/mcg.git
  ```

  If you already cloned without this flag, initialize and fetch the submodule
  with:

  ```shell
  git submodule update --init --recursive
  ```

- **Cloning the submodule separately:**
  If you or a contributor only want to work on documentation, tutorials, or
  guides without setting up the full Rust toolchain or backend, you can clone
  the documentation repository completely independently:

  ```shell
  git clone https://github.com/mentalcardgames/mentalcardgames.github.io.git
  cd mentalcardgames.github.io
  bun install
  bun run docs:dev
  ```

### B. The Correct Commit Workflow ("Inside-Out")

In Git, a parent repository does not track the files of a submodule;
it only tracks a single **commit SHA pointer**.

To avoid broken references across the team, commits must always be made from
the **inside out**:

1. **Step 1: Commit and push INSIDE the submodule:**

   ```shell
   cd docs
   # Ensure you are on a branch, not in a detached HEAD state
   git checkout main
   git add .
   git commit -m "docs: improve local developer guides"
   git push origin main
   ```

2. **Step 2: Commit the updated pointer in the PARENT repository:**

   ```shell
   cd ..
   # Stage the submodule folder (which records the new commit pointer)
   git add docs
   git commit -m "chore: update docs submodule reference"
   git push
   ```

> [!CAUTION] Never commit parent references before pushing the submodule!
> If you commit and push the parent repository before the submodule's new
> commit is pushed, other developers and CI pipelines checking out your branch
> will fail with `fatal: reference is not a tree` because the referenced commit
> does not exist on the remote repository.

### C. Configuring Remote URLs for Submodules

The submodule declaration is located in `.gitmodules`:

```ini
[submodule "docs"]
	path = docs
	url = https://github.com/mentalcardgames/mentalcardgames.github.io.git
	branch = main
```

- **Switching between HTTPS and SSH:**
  To configure SSH (`git@github.com:...`) instead of HTTPS:

  ```shell
  # Configure via parent repo:
  git submodule set-url docs git@github.com:mentalcardgames/mentalcardgames.github.io.git
  git submodule sync

  # Or configure directly within the submodule:
  cd docs
  git remote set-url origin git@github.com:mentalcardgames/mentalcardgames.github.io.git
  ```

- **Verifying remote URLs:**

  ```shell
  cd docs
  git remote -v
  ```

## 5. Local Code Documentation (Cargo Docs)

We maintain extensive internal architecture documentation, API contracts, and
crate-level comments inside our Rust codebase.

To build and browse this documentation locally, run:

```shell
cargo doc --workspace --no-deps --open
```

This compiles module docstrings and opens a browser window displaying the fully
cross-linked rustdoc site.
Crate-level boundaries are documented using `//!` at the top of each crate's
main entry file (e.g., `crates/native_mcg/src/lib.rs`,
`crates/shared/src/lib.rs`, `crates/frontend/src/lib.rs`).

## 6. Coding & Contribution Rules

To maintain codebase health and ease peer code reviews, all Pull Requests
into main must respect the following rules:

- **Run Full CI Verification Gate:**
  Before pushing or opening a PR, ensure the entire gate passes:

  ```shell
  just ci                 # Format check, clippy, and tests across all crates + frontend
  just ci [CRATE]         # Full gate for a specific crate (e.g. `just ci frontend`)
  ```

- **Strict Code Formatting:**
  Check or apply rustfmt before staging changes:

  ```shell
  just fmt-check          # Check formatting across all crates (alias: check-fmt)
  just fmt                # Automatically format all crates (alias: format)

  # Manual cargo commands:
  cargo fmt --all -- --check
  cargo fmt --manifest-path crates/frontend/Cargo.toml -- --check
  ```

- **Compiler Warnings as Errors:**
  Your code must compile without clippy warnings (`-D warnings`):

  ```shell
  just clippy             # Lints all workspace crates + frontend (wasm32)
  just clippy frontend    # Lints frontend only

  # Manual cargo commands:
  cargo clippy --workspace --all-targets -- -D warnings
  cargo clippy --manifest-path crates/frontend/Cargo.toml --target wasm32-unknown-unknown --all-targets -- -D warnings
  ```

- **Verify Tests:**
  Ensure all unit, integration, and browser tests succeed:

  ```shell
  just test               # Runs workspace tests + frontend browser tests in headless Chrome
  just test frontend      # Runs frontend tests using wasm-pack test

  # Manual cargo & wasm-pack commands:
  cargo test --workspace
  wasm-pack test --headless --chrome crates/frontend
  ```

- **Branch-Based Workflow:**
  Direct commits to `main` are strictly forbidden.
  Changes can only be integrated into `main` via a pull request (PR) which has to
  be reviewed and approved by a supervisor.
  Students should create a dedicated branch for their project named with their
  abbreviation (e.g., `dev/jancc`) and feature branches under it (e.g.,
  `dev/jancc/feature/my-addition`).
- **Documentation Commitment:**
  Updates to module docs and website pages are required when creating new
  components or changing interfaces.

## 7. Windows Specific Setup & Gotchas

Developing systems-level Rust applications on Windows can occasionally lead to
toolchain path or security blocks.

### A. MSVC Toolchain Setup & PATH Adjustments

1. **Visual Studio Build Tools:**
   You must install MSVC C++ build tools.
   Download the Visual Studio Installer and select
   **"Desktop Development with C++"** during setup.
2. **PATH Variable Adjustment:**
   Some crates (like `cc`) require compilers such as `cl.exe` in `PATH`:
    - Locating `cl.exe`:
      `C:\Program Files\Microsoft Visual Studio\<Year>\Community\VC\Tools\MSVC\<Version>\bin\Hostx64\x64`
    - Add this path to your user environment variables if you get
      `cl.exe could not be found`.

### B. Smart App Control Code Signing Workaround

Windows Smart App Control may block `cargo.exe`, `rustup.exe`, or locally
compiled binaries.
In order to circumvent this issue use the provided PowerShell script at
repository root: `sign_rust_binaries.ps1`.

Open PowerShell as Administrator and run `.\sign_rust_binaries.ps1`.
This creates a trusted local self-signed certificate and signs the Rust
binaries in your `.cargo/bin` folder.

To sign a newly compiled game binary run:

   ```powershell
   .\sign_rust_binaries.ps1 .\target\debug\native_mcg.exe
   ```
