---
outline: deep
---

# Repository Components & Layout

This page describes the physical organization of files and folders within our Git repository, our planned directory refactoring, and how our logical components map to internal Rust workspace crates.

---

## 1. Monorepo Directory Layout & Git Physical Paths

To keep our workspace highly structured and decoupled, we organize our logical components into physical subfolders in our Git repository.

Below is the directory map showing where each abstract architectural component lives on disk:

```text
mcg/ (Git Repository Root)
├── crates/                    # Centralized directory for all logical workspace crates
│   ├── frontend/              # [MIGRATION TARGET] WASM Browser Client (egui UI, screens)
│   ├── native_mcg/            # [MIGRATION TARGET] Native Desktop Backend & connection supervisor
│   ├── shared/                # [MIGRATION TARGET] Shared network message enums & FSM types
│   └── qr_comm/               # Standalone library for QR fountain codes
├── media/                     # Static media assets, card designs, and logos
├── pkg/                       # Compiled WebAssembly artifacts (automatically generated)
├── justfile                   # Task runner recipes (just build, just start, etc.)
├── index.html                 # Browser entrypoint loading the compiled WASM client
└── Cargo.toml                 # Cargo workspace configuration declaring internal crates
```

### Planned Directory Refactoring
* **Crates Folder Migration:** We have scheduled a high-priority structural refactoring to migrate our core root-level crates (`frontend/`, `native_mcg/`, `shared/`) into the centralized `/crates/` directory. This isolates compiler outputs, simplifies workspace setup, and removes root-level pollution.
* **Documentation Relocation:** The legacy `/docs` directory inside the core gameplay repository is slated for deletion. All comprehensive documentation is now managed in this dedicated Git repository and served via VitePress.

---

## 2. Logical Crate Responsibilities & Dependency Graph

Our Rust workspace is split into distinct crates with strict compilation boundaries to enforce modularity and prevent circular compilation paths.

```
                      ┌──────────────────────┐
                      │    crates/frontend   │
                      │   (Browser WASM)     │
                      └──────────┬───────────┘
                                 │
                                 ▼
   ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐
   │crates/native_mcg│─>│crates/shared │<─│crates/qr_comm  │
   │  (Native Peer)  │  │(Common Types)│  │(Fountain Codes)│
   └─────────────────┘  └──────────────┘  └────────────────┘
```

### A. Shared Crate (`crates/shared/`)
* **Physical Directory:** `/shared/` (Target: `/crates/shared/`)
* **Role:** The foundational "dependency root" of the entire workspace containing common protocol contracts and domain objects.
* **Responsibilities:**
  - **Message Serialization Contracts:** Defines the enums `Frontend2BackendMsg`, `Backend2FrontendMsg`, and `Peer2PeerMsg` which define the exact byte payload contracts for WebSocket and Iroh connections.
  - **Shared FSM Types:** Domain models like `Player`, `Card`, and `GameState` to guarantee absolute alignment between the browser WASM runtime and native native desktop backend.
  - **Cryptography Trait Interfaces:** Shared abstractions for zero-knowledge card shuffling, verifying shuffles, and proof checks.
* **Guardrail:** The `shared` crate is completely isolated. It must never depend on `frontend` or `native_mcg`, breaking all cyclic compilation paths.

### B. WASM Frontend Crate (`crates/frontend/`)
* **Physical Directory:** `/frontend/` (Target: `/crates/frontend/`)
* **Role:** The immediate-mode browser client running within the user's browser.
* **Responsibilities:**
  - **UI Layout & Rendering:** Renders game tables, player dashboards, action prompts, and menus in immediate-mode using `egui` and `eframe`.
  - **Visual Navigation:** Manages screen states (e.g. `/transmit`, `/receive`, `/game`) using a decoupled, registerable `ScreenDef` and `ScreenWidget` hierarchy.
  - **Camera Feed Ingestion:** Interacts with the browser's camera API via `web-sys` to capture frames for scanning visual QR codes.
* **Guardrail:** Depends strictly on `shared` for models and communication interfaces, containing zero native network sockets or raw disk IO.

### C. Native Backend Crate (`crates/native_mcg/`)
* **Physical Directory:** `/native_mcg/` (Target: `/crates/native_mcg/`)
* **Role:** The native desktop runner managing authoritative local state and P2P communication.
* **Responsibilities:**
  - **HTTP & WebSocket Server:** Runs an Axum server on Tokio, serving WASM artifacts from `/pkg/` and opening a WebSocket endpoint at `/ws` for the local frontend.
  - **Actor Connection Supervisor:** Executes the async supervisor actor loop, queuing and executing actions from local WebSockets and remote peer-to-peer streams.
  - **Bot Driver:** Simulates local computer players for solo play or testing.
* **Guardrail:** Relies strictly on WebSocket/QUIC enums from `shared` for external interaction, keeping it fully decoupled from the UI.

### D. QR Comm Crate (`crates/qr_comm/`)
* **Physical Directory:** `/crates/qr_comm/`
* **Role:** A specialized, standalone coding library used for visual frame-based transmissions.
* **Responsibilities:**
  - **Fountain Codes & Galois Fields:** Splitting data payloads into random combinations.
  - **Camera-Drop Resilience:** Enables the scanner client to fully decode and reconstruct a complete file or payload from *any* random, incomplete subset of captured QR frames, rendering the transfer completely robust to frame drops.
