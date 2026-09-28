---
outline: deep
---

# Student Milestones

This lists the active milestones and software engineering packages available
for student projects.
Each milestone represents a core challenge within our architecture.
Rather than being tied to rigid academic ECTS levels, tasks are dynamically
scaled and adjusted based on a student's expected workload.

## Miscellaneous

This section addresses foundational architecture improvements that streamline
the internal structure and boundaries of the client application.
To align the frontend client with the project's Model-View-Controller (MVC)
paradigm and thin-client goals, client-side responsibilities must be strictly
encapsulated.
The milestones below focus on decoupling UI screens from raw networking
lifecycle concerns and restricting direct, mutable access to global state.
By transitioning to event-driven networking abstractions and structured state
accessors, screens become modular, self-contained views that interact with the
local backend controller through well-defined application operations.

### Frontend Encapsulated & Event-Driven Networking

**The Problem:**

Connection lifecycle decisions are distributed across screens.
Screens can initiate or close the shared connection through
`FrontendInterface`.
Connection errors and close reasons are only logged and are not represented as
application-visible state.

`FrontendInterface` also exposes the general-purpose `send_msg` method.
Although it accepts a typed `Frontend2BackendMsg`, screens remain coupled to
the complete wire-protocol enum instead of using purpose-specific frontend
operations.

**Motivation:**

A clean interface boundary should hide transport details and connection
lifecycle policy behind high-level, typed application operations.
This keeps screens independent of the underlying WebSocket implementation and
provides a single place for reconnect behavior, connection feedback, and
reactive UI updates.

**Deliverables:**

- Move connection startup, reconnect, and shutdown policy into `FrontendApp` so
  screens request application operations rather than managing lifecycle timing.
- Replace general-purpose protocol access with purpose-specific methods where a
  stable frontend operation exists; retain a narrow sender abstraction only where
  generic message forwarding is intentional.
- Represent connection status, errors, and close reasons as application-visible
  state and request a repaint for error/close callbacks.

### Frontend State Decoupling

**The Problem:**

`FrontendInterface::state()` and `state_mut()` expose the complete
`FrontendState`, whose fields are public.
Any screen can therefore modify application-owned settings and the screen
registry directly.
The lifetime policy for screen instances and their local state during
navigation is also not formally defined or tested.

**Motivation:**

Narrow application capabilities make ownership explicit and keep screens
modular.
Screens should request navigation or configuration changes through
purpose-specific operations without receiving unrestricted mutable access to
global state.
A defined screen-lifetime policy also makes local state behavior predictable
when users navigate away and return.

**Deliverables:**

- Make `FrontendState` fields private and remove unrestricted `state_mut()`
  access from screens.
- Add purpose-specific getters and commands for player identity, server
  configuration, and any other legitimate global capability.
- Keep registry mutation entirely under `FrontendApp` ownership.
- Document and test the lifetime policy for screen instances and their local
  state when navigating away and returning.

## UI Rendering

Card games vary wildly in their rules, spatial layouts, hidden information, and
card interactions.
To support arbitrary games, the rendering layer must dynamically adapt to
different game states rather than relying on hardcoded heuristics or assumptions
about a single game's structure.

### Text-based User Interface (TUI) Frontend

**The Problem:**

Directly implementing an interface capable of rendering any arbitrary card game
is extremely difficult, as they vary wildly in rules, spatial layouts,
hidden information, and card interactions.
Additionally, our current graphical frontend is hardcoded specifically for the
static Poker game, making it impossible to render other games.
Furthermore, the existing command-line interface (`mcg-cli`) historically
relied on HTTP request-response endpoints, which have been removed from the
backend, and lacked persistent streaming required for reactive terminal
experiences.

**Motivation:**

A Text-based User Interface (TUI) bypasses layout and visual styling
complexities by rendering structured text or ASCII grids.
Following our **split-node thin-client** model, the TUI operates as a
standalone View client that connects to the native backend's Controller via
WebSocket (`/ws`), receiving pushed state projections and sending user actions
as standard message packets in real time.
Migrating the CLI and TUI tooling to WebSocket provides a unified, persistent
duplex connection matching the web frontend, eliminating polling and enabling
instant reactivity for game events.
This serves as a first stepping stone to test and verify the CGDL engine's
capabilities before building a full GUI.

**Deliverables:**

- Implement a terminal-based frontend View binary either as part of the
  `mcg-cli` binary or as a standalone crate.
- Migrate `mcg-cli`'s default transport from legacy HTTP to WebSocket
  (`ws://localhost:3000/ws`), establishing persistent duplex communication with
  the `/ws` endpoint and adopting the `mcg.frontend` subprotocol.
- Connect to the native backend controller using the WebSocket messaging
  protocol (`Frontend2BackendMsg` / `Backend2FrontendMsg`), listening for pushed
  state updates reactively instead of polling.
- Determine all components from CGDL that need representation.
- Provide implementations of
  [`std::fmt::Display`](https://doc.rust-lang.org/std/fmt/trait.Display.html)
  or a custom trait for all representable components.
- Provide an interactive prompt allowing the user to select which parts of the
  received state projection to print or track in real time.
- Support shortcuts or commands to quickly display specific zones, variables,
  or parts of the game state.
- Implement a "watchlist" mechanism to pin chosen components, keeping them
  permanently visible and auto-updating them on the screen when the state changes.

### Providing more widgets

**The Problem:**

The frontend crate currently implements only basic card and field rendering
primitives (e.g., `SimpleField`).
They are insufficient for rendering all components found in card games, such as
grids, multiplayer tables, and additional player attributes.
Furthermore, they lack generic interfaces for advanced interactions like
multi-selection and drag-and-drop between arbitrary fields.

**Motivation:**

Developing a library of reusable, rule-agnostic UI widgets ensures they can be
composed to represent diverse game zones and layouts independently of any
concrete game rules.
Developing these widgets independently ensures they are thoroughly tested,
modularized, and interactive, setting up a solid foundation for the renderer to
easily translate CGDL files into interactive interfaces.

**Deliverables:**

- Expand the widget library in the `frontend` crate to support components from
  CGDL.
- Make parameters configurable (e.g., spacing, overlap offset, rotation,
  card size, margins).
- Standardize interaction states (e.g., drag-and-drop source/destination tags,
  single/multi-selection modes, hover preview/zoom).
- Decouple widgets from concrete game state types so they only rely on generic
  traits.
- Provide a widget catalog or demonstration screen in the game client
  showcasing all layout widgets and their configurations.

### Extending CGDL with Markup

**The Problem:**

There is an immense variety of card games, and almost every game layout is
unique.
When comparing two different card games, it is nearly guaranteed that they
place, arrange, and move cards across the table in distinct ways
(e.g., community cards in the center, hands held privately, discard piles,
or separate trick-taking zones).
Trying to support infinitely many game layouts without an explicit
markup language would force the rendering system to rely on complex layout
heuristics, which is fragile and difficult to scale.

**Motivation:**

In the physical world, card game rulebooks not only explain the rules but also
specify where the deck, discard piles, and players' hands are physically located
on the table.
We can apply this exact analogy to mental card games.
Since we already have a Card Game Description Language (CGDL) to describe the
rules, we can extend it with markup capabilities that describe the layout and
placement of elements.

**Deliverables:**

- Design the syntax and semantics of the CGDL language extension for spatial
  markup definitions.
- Implement parser support for the new layout markup within the existing
  CGDL parser.
- Ensure the layout extension integrates seamlessly with the existing CGDL and
  game engine.

## Tooling & Developer Experience

Developing custom game descriptions and debugging distributed peer-to-peer state
mutations is difficult and slow without visibility.
High-quality tooling and editor integrations are required to inspect runtime
behaviors and validate rules during development.

### State Mutation & Network Control

**The Problem:**

There are currently no developer tools to observe or control the project's
behavior at runtime.
Debugging peer-to-peer state mutations and component interactions is tedious and
slow, as developers must write custom manual tests to simulate edge cases and
cannot inspect or alter state dynamically.

**Motivation:**

We need a flexible developer playground to debug the native node.
By exposing dedicated debugging endpoints on the backend **Controller**,
developers can query and manipulate game state, craft custom protocol messages,
and control peer connections at runtime to test algorithms and verify execution
flows on the fly.

**Deliverables:**

- Extend the TUI console to act as a debug View client connecting to the
  Controller's administrative interface.
- Expose debug endpoints on the Controller to allow safe inspection and mutation
  of the underlying Model (game state) at runtime.
- Support crafting and injecting test protocol messages directly into the
  Controller's P2P network processing pipeline.
- Expose connection management commands (initiate, disconnect, block) to
  simulate network disruptions and P2P topologies.

### CGDL Language Server Protocol (LSP)

**The Problem:**

Developers writing card game descriptions currently lack the full extent of
modern tooling provided by an LSP.
This makes writing CGDL error-prone and frustrating.

**Motivation:**

The goal is to establish a rich developer experience for writing CGDL.
Implementing a Language Server Protocol (LSP) server provides real-time
diagnostics, autocompletion, and tooltips directly inside the developer's
editor, making CGDL self-documenting and safe to write.

**Deliverables:**

- Research and document all standard capabilities specified in the
  Language Server Protocol (LSP) specification.
- Formulate a design strategy explaining how those capabilities will be utilized
  in the context of CGDL.
- Audit and document existing features in the LSP codebase.
- Establish a prioritized implementation roadmap, ranking features
  (e.g., autocomplete, hover tooltips) based on their importance to CGDL
  usage scenarios.
- Implement the prioritized LSP capabilities in the language server backend
  (`lsp_server` crate) using the CGDL parser.
- Build and package a VS Code extension that bundles and launches the Rust LSP
  executable.

## Cryptography & Zero-Knowledge Proofs (ZKP)

To enable trustless card gameplay in a decentralized peer-to-peer network
without a central authority, the project relies on robust cryptographic
foundations and Zero-Knowledge Proofs (ZKPs).
These mechanisms solve two distinct security challenges: securing network
communication and preserving game fairness.
First, **Connection & Message Authentication** establishes cryptographic
identity verification and packet signing to prevent impersonation, tampering,
and replay attacks across untrusted transport routes.
Second, mental card game primitives—implemented through a modular
**Cryptographic Toolbox** and unified **Cryptographic Interface**—allow players
to perform verifiable operations such as card masking, secret deals, and fair
shuffles without exposing private hand information.
Finally, **Protocol Integration** embeds these capabilities into an
asynchronous Crypto Actor orchestrated by the Controller, ensuring that all game
actions are mathematically verified before advancing the shared state machine.

### Connection & Message Authentication

**The Problem:**

In a decentralized P2P network, game messages are broadcasted and
relayed across multiple untrusted nodes.
Without payload signing, any malicious node in the routing path can tamper with
packets, replay old messages, or impersonate other players.

Furthermore, while message signatures prove that a packet was authored by a
specific cryptographic key, they do not verify *who* owns that key.
A malicious peer can generate a new key pair, connect to the network, and claim
to be a different player.
Without a mechanism to bind cryptographic identities to physical peers, players
remain vulnerable to impersonation and Sybil attacks.

**Motivation:**

To establish a trustless yet secure gaming session, we need a two-tier
authentication stack:

**Message-level Authentication:**
Each node signs its outgoing message payloads using a private key
(e.g., Ed25519).
Relayed messages can then be independently verified by every peer in the
network, ensuring non-repudiation and integrity even if the transport layer is
compromised or messages are relayed through malicious actors.

**Identity & Connection Verification:**
To prevent key-spoofing and MITM attacks, players must be able to verify that
the cryptographic keys used for message signing actually belong to their
intended peers.
By mapping a public key hash or connection fingerprint into a human-readable
representation (such as an Emoji Hash, Identicon, or mnemonic phrase), players
can verify the session's authenticity out-of-band.
This verification does not have to block the connection setup;
it can be performed at any point during the session to confirm the integrity of
the player identities.

**Deliverables:**

- Implement local generation and secure storage of peer key pairs, linking them
  to player identities.
- Design and integrate a packet signing protocol.
  Every outgoing backend P2P message payload must be signed, and all incoming
  messages must be verified against the sender's public key before being processed
  by the game engine.
- Incorporate replay prevention mechanisms (e.g., monotonic sequence numbers, timestamps, or nonce challenges) within the signed payload.
- Implement a connection fingerprinting system
  (e.g., hashing peer public keys into a deterministic set of emojis, a structured
  Identicon, or a mnemonic string).
- Expose the connection fingerprints on both the backend and frontend.
  Provide a UI component allowing players to inspect and compare connection
  fingerprints at any time.

### Implementing the Toolbox

**The Problem:**

To play card games over a decentralized network without a trusted third party,
players must be able to perform card operations
(such as shuffling, dealing, drawing, and verification) securely.
Currently, our application lacks the core cryptographic primitives needed to
hide card values from players while keeping the game state verifiable and
preventing cheating or collusion.

**Motivation:**

We want to build a general-purpose application capable of playing arbitrary
card games.
To achieve this, we need a toolbox of primitives as defined in
Christian Schindelhauer's paper *A Toolbox for Mental Card Games* (1998)
(referenced in [Literature & References](../organisational/literature.md#foundational-literature)).
Implementing these primitives allows players to hide card information while
maintaining a shared, secure game state.
This can be done either by writing them from scratch in Rust, or by wrapping an
already implemented C/C++ version
(such as the [libtmcg library](https://savannah.nongnu.org/projects/libtmcg/))
inside a Rust crate.
Alternatively, it's possible to implement the improved primitives described by
Heiko Stamer in
[Efficient Electronic Gambling: An Extended Implementation of the Toolbox for Mental Card Games](../organisational/literature.md#foundational-literature).

**Deliverables:**

- Research the foundational primitives described in
  *A Toolbox for Mental Card Games* (1998)
  and the improved implementations in
  *Efficient Electronic Gambling* (2005).
- Provide the implementation either as a native Rust crate written from scratch,
  or as a Rust FFI/wrapper around an existing C/C++ implementation like `libtmcg`.
- Expose a clean, idiomatic Rust API that allows for verifiable deck and
  card operations.

### Interface for Cryptography

**The Problem:**

Different cryptographic protocols (e.g., ElGamal vs. Lattice Codes) and
implementations offer varying trade-offs in performance, security, and
proof sizes.
Without a unified interface, integrating a specific cryptographic implementation
directly into the project couples the specific logic with that
cryptography library.
This makes studying, benchmarking, or swapping implementations tedious and
error-prone, as it requires modifying the entire integration layer of the
application.

**Motivation:**

By introducing an abstract interface (a set of Rust traits), we decouple the
cryptographic implementation from the engine and networking layers.
Placing this interface in a shared core library allows both the WebAssembly View
(frontend) and the native Controller (backend) to use, serialize, and
deserialize cryptographic objects cleanly.

**Deliverables:**

- Define a set of Rust traits (e.g., in a `mcg-crypto` crate) representing core
  mental card game primitives, including key setup, card masking/unmasking,
  verifiable shuffles, and ZKP generation/verification.
- Adapt existing implementations to conform to this new unified interface.
- Provide a mock implementation of the traits, which is insecure, to simplify
  integration testing and speed up development of other components.

### Protocol Integration

**The Problem:**

In a peer-to-peer system, players broadcast their actions along with
cryptographic proofs to verify that game rules are followed without revealing
private card details.
However, our application currently lacks any protocol integration between the
game engine and the cryptography layer.
Hardcoding cryptographic verification directly inside the game engine's
state machine violates separation of concerns.
We need a modular architecture that separates pure card game logic from the
network-level cryptographic verification and proof-generation.

**Motivation:**

To maintain a clean MVC (Model-View-Controller) structure, the cryptography
layer is implemented as an independent component within our actor model.
The Controller acts as the central orchestrator:
incoming network messages are first intercepted and forwarded to the Crypto
Actor for validation.
The message is only applied to the game engine (the Model) if its ZKP is valid.
Conversely, when a local player mutates their state, the Controller prompts the
Crypto Actor to generate a corresponding ZKP, which is then broadcasted to other
peers.
This prevents code duplication, simplifies testing, and keeps the game engine
decoupled from cryptographic protocol details.

**Deliverables:**

- Implement a dedicated **Crypto Actor** responsible for key management,
  card encryption/masking state, and ZKP generation/verification.
- Integrate the verification flow into the MVC Controller:
  intercept incoming network messages, request validation from the Crypto Actor,
  and forward the message to the game engine only upon successful verification.
- Implement the local action flow:
  mutate the local engine state, instruct the Crypto Actor to generate the
  necessary ZKP for the mutation, and broadcast the action and proof to the peer
  network.

## Network & Communication Infrastructure

Since each player runs a local node, the network layer must manage
peer connections, node discovery, and state synchronization.
A clean, asynchronous message pipeline is required to handle high-frequency
communication between the frontend client, the local backend, and remote nodes.

### Reliable Broadcast & Consensus (Forum System)

**The Problem:**

How to ensure that when one node broadcasts a state change, the entire mesh network either collectively accepts or vetoes the action?

- **State Propagation:** How to reliably broadcast state transitions across all mesh nodes.
- **Agreement/Veto:** How to coordinate collective acceptance or vetoing of proposed actions.
- **Disconnection:** How to recover and sync consensus state when a node temporarily disconnects.
- **Ordering:** How to handle packet drops and enforce deterministic ordering of concurrent player inputs.

**Motivation:**

In a decentralized peer-to-peer card game, no single server acts as the authoritative source of truth.
When network latency fluctuates, packets drop, or players submit concurrent moves, nodes can easily fall out of synchronization or disagree on game history.
A reliable broadcast and consensus protocol (the Forum System) guarantees that all connected peers observe actions in a deterministic order, validate or veto proposed state mutations consistently, and allow disconnected nodes to re-synchronize state upon reconnecting.

**Deliverables:**

- Research and design reliable broadcast and agreement strategies.
- Implement robust retry and confirmation pipelines for direct P2P connections.
- Implement vector clocks or Lamport timestamps for ordering input sequences.
- Specify and implement consensus state recovery plans.

### Decentralized Node Discovery

**The Problem:**

Players must be able to find and connect to each other globally without relying on a static, centralized discovery server.

**Motivation:**

To create a truly decentralized network that cannot be shut down or censored, players must discover each other dynamically without depending on static IP addresses or centralized discovery servers.
Leveraging Iroh's peer-to-peer networking stack and Distributed Hash Table (DHT) enables nodes to advertise their presence, discover other participants using cryptographic node IDs, and establish direct peer connections through automatic NAT traversal and hole-punching.

**Deliverables:**

- Integrate Iroh's Distributed Hash Table (DHT) for peer-to-peer node discovery.
- Handle automatic NAT traversal and hole-punching for global P2P connectivity.

## Project Deployment

Moving Mental Card Games from a development and research prototype to a widely
accessible platform requires straightforward, turnkey packaging solutions.
Currently, running the game requires a developer environment, CLI commands, and
manual orchestration across multiple terminal windows.
To deliver a frictionless user experience across diverse form factors, the
milestones below focus on packaging the complete node (backend and frontend)
into single-click desktop applications, wrapping the system into installable
mobile apps for Android and iOS, streamlining local network backend deployment
for seamless cross-device play, and hosting public WebAssembly demonstrators.

### Desktop Application

**The Problem:**

Currently, playing MCG on a desktop computer requires manual orchestration.
Users must compile or serve the WebAssembly frontend, start the native backend
service (`native_mcg`) from a command-line interface, and manually open a web
browser pointing to `http://localhost:3000`.
This multi-step workflow prevents non-technical players from launching the game
and lacks standard desktop integration (such as an application launcher icon,
dedicated window lifecycle, or native file handling).

**Motivation:**

Players expect a conventional desktop application experience: a standalone
program that launches with a simple double-click.
In this milestone, students develop a native desktop frontend that runs natively
on a computer instead of within a web browser.
The desktop application packages both the backend node and the frontend GUI
into a single self-contained executable.
When launched, it automatically initializes and manages the backend service
internally and connects the native GUI to it, requiring no additional setup or
terminal commands for the user.

**Deliverables:**

- Implement a native desktop frontend capable of rendering locally on the host
  operating system outside of a web browser.
- Bundle both the backend node runtime and the frontend GUI into a single
  standalone executable.
- Ensure the application launches in a fully playable state via a simple
  mouse double-click without requiring external commands or manual steps.
- Automate the internal connection lifecycle so the desktop frontend spawns,
  connects to, and gracefully shuts down the embedded backend service.
- Provide build configurations and packaging scripts to produce native binaries
  and installers for standard desktop platforms (Linux, Windows, macOS).

### Mobile Application

**The Problem:**

Card games are inherently social and portable, making mobile devices (smartphones
and tablets) an ideal platform.
However, MCG currently lacks mobile packaging.
Running the game on mobile operating systems presents unique hurdles: users
cannot run developer terminal environments, mobile operating systems impose
strict process lifecycles and background restrictions, and mobile web browsers
offer a sub-optimal experience compared to dedicated apps.

**Motivation:**

Like the desktop application, the goal is to provide a single, installable app
bundle for Android and/or iOS that contains both the frontend and the backend.
Users should be able to tap an icon on their home screen and immediately play
without launching secondary services.
A recommended, pragmatic implementation strategy is to wrap the frontend in a
dedicated webview or specialized kiosk browser that displays the WASM frontend
while automatically launching the Rust backend locally in the background.
Packaging this architecture requires minimal boilerplate around the browser
view.
Alternatively, cross-platform Rust GUI frameworks with native mobile support
(such as [Dioxus](https://dioxuslabs.com/)) can be explored as alternative
frontends to simplify mobile rendering and packaging.

**Deliverables:**

- Package MCG as a native mobile application for Android and/or iOS.
- Bundle both the Rust backend and the mobile frontend into a single installable
  package that requires no additional user intervention to start.
- Implement the client interface either as an embedded browser shell wrapping the
  existing WASM frontend or via a mobile-friendly GUI framework like Dioxus.
- Automatically start and manage the local backend service during the mobile
  application lifecycle.
- Handle mobile lifecycle events (app pausing, backgrounding, sleeping, and
  resuming) without disrupting active P2P connections or corrupting game state.
- Provide build and packaging scripts to generate deployable mobile artifacts
  (e.g., APKs or iOS application bundles).

### Deployment Ready Backend

**The Problem:**

Connecting a secondary device (such as a smartphone or another computer on the
local network) to a backend running on a host PC is currently fraught with
difficulties.
By default, the backend may bind only to localhost (`127.0.0.1`), rendering it
inaccessible to other devices.
Even when configured to listen on all interfaces (`0.0.0.0`), operating system
firewalls (such as Windows Defender Firewall or Linux `ufw`) routinely block
inbound network traffic unless an explicit rule is configured, and identifying
the PC's local LAN IP address requires technical command-line utilities.

**Motivation:**

Players should be able to launch the backend on their PC and effortlessly
connect to it from their mobile phone or secondary device on the local network.
The backend must handle all network configuration automatically in code wherever
feasible—such as binding to all interfaces and detecting and printing the local
LAN IP address.
For system requirements that cannot be automated via code, clear, step-by-step
instructions must be provided so that players can complete the setup without
confusion.

**Deliverables:**

- Adapt the backend configuration and network initialization to bind across all
  network interfaces (`0.0.0.0`) by default or via a dedicated deployment flag.
- Automatically detect the host's active local LAN IP address and display ready-to-use
  connection URLs (or render a scannable QR code in the terminal or GUI) for instant
  mobile pairing.
- Implement automated system configuration where technically feasible (e.g.,
  firewall rule scripts or UPnP configuration helpers).
- Write a step-by-step user guide detailing manual operating system adjustments
  that cannot be automated in code.
- Test and verify cross-device connectivity between mobile clients and the PC
  backend across local Wi-Fi networks.

### Serving a Demo Website

**The Problem:**

Prospective players, reviewers, and contributors currently have no way to
explore or test MCG without cloning the repository, installing the Rust toolchain,
and compiling both the frontend and backend locally.
This steep barrier to entry limits user engagement and prevents quick public
demonstrations.

**Motivation:**

Hosting the compiled WebAssembly frontend on a public static host—such as
GitHub Pages or directly within the official documentation site
(`mentalcardgames.github.io`)—enables instant accessibility for anyone with a web
browser.
On this demo page, players simply enter the public IP address or hostname of
an accessible backend node (whether self-hosted at home, on a VPS, or running in
a cloud environment).
The browser-based frontend then connects directly to that backend over a
WebSocket, allowing players to join and participate in an active game session
immediately.

**Deliverables:**

- Set up an automated build and deployment pipeline (e.g., GitHub Actions) to
  compile the WASM frontend and host it statically on GitHub Pages or as a subpage
  of `mentalcardgames.github.io`.
- Implement a connection configuration screen on the web frontend where players
  can input an external backend IP address or domain name and port.
- Establish WebSocket communication from the statically hosted frontend to the
  remote backend, accounting for browser security policies (such as `ws://` vs
  `wss://` mixed-content rules and providing guidelines for reverse proxies with
  TLS termination).
- Document backend deployment prerequisites for public internet exposure,
  including router port forwarding, dynamic DNS, and TLS certificates.
