---
outline: false
---

# Repository Components & Layout

To keep the workspace structured and decoupled, logical components are
organized into subfolders within the Git repository.
The map below outlines the file structure and how components map to internal
Rust crates:

```text
mcg/ (Repository Root)
├─ docs/                   # Submodule directory targeting this documentation website
├─ crates/                 # Centralized directory for all logical crates
│  ├─ frontend/            # Web client / WASM target (egui UI, screens, ...)
│  ├─ native_mcg/          # Native Backend & connection supervisor
│  ├─ cardgame_dsl/        # Subdirectory for the Card Game DSL
│  │  ├─ cgdsl/            # VS Code extension source for the Card Game DSL
│  │  ├─ code_gen/         # Macro Definition for our Card Game Language
│  │  ├─ front_end/        # Compiler frontend and parser for the Card Game DSL
│  │  └─ lsp_server/       # Language Server Protocol (LSP) implementation for the Card Game DSL
│  ├─ engine/              # Game Engine for playing arbitrary Card Games
│  ├─ shared/              # Shared structs & enums to break cyclic dependencies
│  └─ qr_comm/             # Standalone library for QR fountain codes
├─ media/                  # Static media assets, card designs, and logos
├─ pkg/                    # Compiled WebAssembly artifacts (automatically generated)
├─ index.html              # Browser entrypoint loading the compiled WASM client
├─ justfile                # Task runner recipes (just build, just start, etc.)
├─ Cargo.toml              # Cargo workspace configuration declaring internal crates
├─ mcg.code-workspace      # Workspace file to open with VS Code
├─ sign_rust_binaries.ps1  # Helper script for Windows-specific binary signing
├─ AGENT.md                # Instructions for AI agents on how to behave
├─ README.md
└─ LICENSE
```

## Cargo Workspace Configuration

The root `Cargo.toml` defines the unified workspace for native crates
(`crates/native_mcg`, `crates/shared`, `crates/qr_comm`,
`crates/cardgame_dsl/*`, `crates/engine`, `crates/poker`).

### Frontend Exclusion (`wasm32` Target)

`crates/frontend` is **explicitly excluded** from `[workspace.members]`:

- **Compilation Target:**
  The frontend is built exclusively for `wasm32-unknown-unknown` with browser
  bindings (`web-sys`, `wasm-bindgen`).
- **Native Isolation:**
  The native backend and engine crates require host operating system capabilities
  (multi-threaded Tokio runtime, OS sockets, threads, file I/O) that do not
  compile under `wasm32-unknown-unknown`.
- **Cargo Constraint:**
  Cargo workspaces require member crates to compile against a unified default
  target.
  Isolating `crates/frontend` prevents `cargo test --workspace` or
  `cargo clippy --workspace` from breaking when run against the host target.
  Frontend compilation is instead driven by `wasm-pack` (`just build`).

## Directory Organization & Submodules

- **Centralized Crates (`crates/`):**
  All internal Rust crates are organized under `/crates/`, isolating compilation
  outputs and keeping the repository root clean.
- **Documentation Submodule (`docs/`):**
  The `/docs` directory is maintained as a Git submodule pointing to the
  documentation repository [`mentalcardgames.github.io`](https://github.com/mentalcardgames/mentalcardgames.github.io).
  For instructions on installing documentation dependencies and running the
  VitePress development server locally, see [`docs/README.md`](https://github.com/mentalcardgames/mentalcardgames.github.io/blob/main/README.md).
- **Card Game DSL Subdirectory (`crates/cardgame_dsl/`):**
  Tooling for the Card Game Description Language (`front_end/`, `code_gen/`,
  `lsp_server/`, `cgdsl/`) is grouped under `/crates/cardgame_dsl/`, separating
  language tooling from game and transport runtimes.
