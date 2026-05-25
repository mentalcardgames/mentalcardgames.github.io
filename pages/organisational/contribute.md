---
outline: deep
---

# Developer Setup & Rules

This guide outlines how to set up your local development environment, build the project, and contribute new features or documentation to our codebase. Please follow these instructions carefully to ensure compatibility across our multi-platform workspace.

---

## 1. Prerequisites & Toolchain Setup

To develop and build both the frontend and backend, you will need the following tools installed on your local machine:

1. **Rust Toolchain:** Install Rust stable using [rustup](https://rustup.rs).
2. **Just Runner:** We use `just` as a command runner for project actions.
   - macOS: `brew install just`
   - Linux: `apt install just` or `cargo install just`
   - Windows: `winget install casey.just` or `cargo install just`
3. **WebAssembly Pack (`wasm-pack`):** Needed to compile our Rust frontend into WebAssembly.
   - Download and run the installer from the [wasm-pack website](https://rustwasm.github.io/wasm-pack/installer/).
4. **NodeJS / Package Manager (for the website):**
   - Install [NodeJS](https://nodejs.org). We recommend using `bun` or `npm` to run and compile this VitePress website.

---

## 2. Windows Specific Setup & Gotchas

Developing systems-level Rust applications on Windows can occasionally lead to toolchain path or security blocks. Follow these two workarounds if you encounter compiler errors:

### A. MSVC Toolchain Setup & PATH Adjustments
1. **Visual Studio Build Tools:** You must install the MSVC C++ build tools. Download the Visual Studio Installer and select **"Desktop Development with C++"** during setup. 
   > [!NOTE]
   > Ensure you install the standalone *Visual Studio Build Tools* (or *Visual Studio Community*), which are distinct desktop applications and separate from the VS Code editor.
2. **PATH Variable Adjustment:** Some crates (like `cc`) require compilers such as `cl.exe` to be directly present in your system's `PATH` variables.
   - Locating `cl.exe`: This binary typically resides in:
     `C:\Program Files\Microsoft Visual Studio\<Year>\Community\VC\Tools\MSVC\<Version>\bin\Hostx64\x64`
   - Add this path to your user environment variables if you get compilation failures stating `cl.exe could not be found`.

### B. Smart App Control Code Signing Workaround
Windows Smart App Control may block `cargo.exe`, `rustup.exe`, or locally compiled binaries because they are untrusted and unsigned. To fix this without lowering your system security:
1. We have provided a PowerShell script at the root of the `mcg` repository: `sign_rust_binaries.ps1`.
2. This script creates a trusted local self-signed code-signing certificate, adds it securely to your local certificate stores, and signs the Rust toolchain binaries in your `.cargo/bin` folder.
3. Open PowerShell as an Administrator and execute:
   ```powershell
   .\sign_rust_binaries.ps1
   ```
4. To sign a newly compiled game binary that gets blocked:
   ```powershell
   .\sign_rust_binaries.ps1 .\target\debug\native_mcg.exe
   ```

---

## 3. Compiling WebAssembly (WASM)

Our frontend is a WebAssembly application built with Rust and `egui`/`eframe`. 

### The Build Pipeline
1. **Compilation:** `wasm-pack` compiles our `frontend` crate, creating highly optimized WebAssembly files and JS bindings.
2. **Artifact Directory:** The compiled outputs are saved under the workspace root folder `/pkg/`.
3. **Asset Serving:** The native backend server (`native_mcg`) automatically serves the HTML wrapper and all files inside `/pkg/` to the browser.

### Key Just Recipes
We use `just` recipes to automate compile loops. Run these from your root workspace:
- **Build Frontend (Release):**
  ```shell
  just build release
  ```
- **Run Developer Server (Frontend + Native Backend):**
  ```shell
  just start dev
  ```
  This command automatically builds the frontend in development mode and launches the native backend server (serving on port 3000+).

---

## 4. Local Code Documentation (Cargo Docs)

We maintain extensive internal architecture documentation, API contracts, and crate-level comments inside our Rust codebase. 

To build and browse this documentation locally:
1. Open a terminal in the root `mcg` workspace directory.
2. Run the following command:
   ```shell
   cargo doc --workspace --no-deps --open
   ```
3. This will compile all module-level docstrings and open a browser window displaying the workspace's fully cross-linked rustdoc site.
4. **Crate Description Locations:**
   - Crate-level responsibilities and system boundaries are documented using module-level comments `//!` at the top of each crate's main entry file (e.g., `frontend/src/lib.rs`, `native_mcg/src/lib.rs`, `shared/src/lib.rs`).

---

## 5. Coding & Contribution Rules

To maintain codebase health and ease peer code reviews, all contributions must respect the following rules:

* **Strict Code Formatting:** Run `cargo fmt --all` before staging changes. Unformatted code will trigger a failure in the CI pipeline.
* **Compiler Warnings as Errors:** Your code must compile without clippy warnings. Run:
  ```shell
  cargo clippy --workspace --all-targets -- -D warnings
  ```
* **Verify Tests:** Ensure all unit and integration tests succeed:
  ```shell
  cargo test --workspace
  ```
* **Branch-Based Workflow:** All development must occur on separate feature branches (e.g. `feature/my-addition`). Direct commits to `main` are restricted.
* **Documentation Commitment:** When creating new components or changing interfaces, update relevant modules docs and keep the VitePress files in sync.
