---
outline: deep
---

# Repository Layout & Modules

This page describes the physical organization of files and folders within our repository, our planned directory refactoring, and the core responsibilities of our internal Rust workspace crates.

---

## 1. Monorepo Directory Layout (Target State)

To organize our monorepo cleanly, our goal is to migrate all primary development crates under a centralized `/crates/` directory. 

Below is our target directory map showing where logical components reside:

```text
mcg/ (Workspace Root)
├── crates/                    # Centralized directory for all workspace crates
│   ├── frontend/              # [MIGRATION TARGET] WASM Client UI (egui)
│   ├── native_mcg/            # [MIGRATION TARGET] Native Server & Actor connection supervisor
│   ├── shared/                # [MIGRATION TARGET] Shared message contracts and FSM types
│   └── qr_comm/               # Fountain codes for QR-based network transmission
├── media/                     # Static card skins, project logo, and media assets
├── pkg/                       # Automatically compiled WASM output (served by native_mcg)
├── justfile                   # Repository runner scripts (just build/start commands)
├── index.html                 # Browser entrypoint that loads compiled WASM frontend
└── Cargo.toml                 # Root cargo workspace configuration
```

### Important Layout Transitions
* **Crates Folder Migration:** We have scheduled a high-priority technical task to migrate our core root-level crates (`frontend/`, `native_mcg/`, `shared/`) into the `/crates/` directory to declutter the root workspace and align compilation boundaries.
* **Legacy Docs Directory:** The legacy `/docs` directory located in the `mcg` codebase repository is slated for deletion once this overhauled documentation site is accepted. It is being replaced entirely by this website's subrepository.

---

## 2. Crate Responsibilities & Architectural Boundaries

Our monorepo workspace is divided into decoupled crates with strict compilation boundaries to maintain code health.

```
                  ┌──────────────────────┐
                  │       frontend       │
                  └──────────┬───────────┘
                             │
                             ▼
  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐
  │   native_mcg   │─>│    shared    │<─│    qr_comm     │
  └────────────────┘  └──────────────┘  └────────────────┘
```

### A. Shared Crate (`shared/`)
* **Role:** The core "dependency root" of the entire workspace containing common protocol contracts and domain objects.
* **Responsibilities:**
  - **Message Serialization Contracts:** Defines the serializable enums `Frontend2BackendMsg`, `Backend2FrontendMsg`, and `Peer2PeerMsg` which define how clients and servers exchange data.
  - **Shared FSM Types:** Core card game data structures such as `Player`, `Card`, and `GameState` to guarantee compile-time alignment across native and WebAssembly code.
  - **Cryptography Traits:** Common interfaces for Zero-Knowledge Proof validation.
* **Boundary Guardrail:** The `shared` crate must never import any types from `frontend` or `native_mcg` to avoid circular compilation paths.

### B. WASM Frontend Crate (`frontend/`)
* **Role:** The user-facing visual client compiled directly into WebAssembly.
* **Responsibilities:**
  - **User Interface Layout:** Implemented in `egui` and `eframe`. Renders game zones, player action choices, and cards.
  - **Screen Navigation Routing:** Manages UI states (`/transmit`, `/receive`, `/game`, etc.) through a decoupled `ScreenDef` and `ScreenWidget` registry.
  - **Media Capture APIs:** Wraps browser camera feeds via `web-sys` to ingest video frames for scanning and decoding QR codes.
* **Boundary Guardrail:** It depends on `shared` for communication contracts, but contains zero native Rust code or direct server socket logic.

### C. Native Backend Crate (`native_mcg/`)
* **Role:** The native server running on the user's desktop acting as an authoritative game state supervisor.
* **Responsibilities:**
  - **HTTP & WebSocket Server:** Built on `axum` and `tokio`. Serves compiled WASM assets from `/pkg/` and opens WebSockets at `/ws`.
  - **Asynchronous Actor Connection Supervisor:** Lightweight actor loop managing WebSocket client queues and P2P remote nodes.
  - **Bot Simulation Manager:** Simulates peer participants for testing.
* **Boundary Guardrail:** It interacts with `frontend` strictly through WebSockets and serializes packets via the types defined in `shared`.

### D. QR Comm Crate (`crates/qr_comm/`)
* **Role:** A specialized standalone library for sending data via visual QR codes.
* **Responsibilities:**
  - **Galois Field Network Coding:** Splitting large files into code combinations.
  - **Fountain Codes:** Implements randomized packet distribution so that a scanning client can reconstruct the original payload from *any* random, incomplete subset of frames, rendering transmissions robust to camera frame drops.
