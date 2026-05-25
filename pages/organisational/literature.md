---
outline: deep
---

# Literature & References

All research and system development in this project is grounded in established scientific literature spanning cryptography, zero-knowledge proofs, distributed networks and compiler design. This page describes how you can access scientific materials and lists the key foundational papers for each domain.

## Accessing Scientific Literature

Academic search engines, university resources and our internal NextCloud provide comprehensive access to relevant literature

* **Internal Channels:** Key research papers, thesis templates, and reference materials are directly compiled and shared on the chair's internal channels. Your supervisor will guide you to these files on onboarding.
* **Academic Databases:** For general search, use:
  - [Google Scholar](https://scholar.google.com)
  - [Freiburg University Library (FreiDok)](https://freidok.uni-freiburg.de) (for past completed theses from our chair)

## Foundational Literature by Topic

When starting a project, it is highly recommended to read the primary papers in your technical domain.

### 1. Mental Card Games & Card Cryptography

Mental Poker describes playing card games fairly over physical or digital networks without a trusted third party.

* **Schindelhauer's P2P Card Game Protocol:**
  - *Title:* "Peer-to-Peer communication for Mental Card Games"
  - *Context:* The core theoretical framework inspiring our P2P architecture. Shows how to shuffle and distribute cards securely.
* **SRA Protocol (Shamir, Rivest, Adleman):**
  - *Title:* "Mental Poker" (1979)
  - *Context:* The historical foundation of all mental card game research, introducing commutative encryption schemes to allow two-player shuffling without leakage.
* **Crépeau's Commutative Shuffling:**
  - *Title:* "A Zero-Knowledge Poker Protocol that achieves Perfect Secrecy"
  - *Context:* Formulated zero-knowledge arguments demonstrating that a player shuffled a deck honestly without disclosing the card ordering.

### 2. Zero-Knowledge Proofs (ZKP)

ZKPs are required to prove that game rules are obeyed (e.g., proving a card was drawn from the deck fairly) without revealing secret cards.

* **Bulletproofs:**
  - *Title:* "Bulletproofs: Short Proofs for Confidential Transactions and More"
  - *Context:* Highly efficient, short non-interactive zero-knowledge proofs. Excellent reading for range proofs and inner-product arguments.
* **Pedersen Commitments:**
  - *Title:* "Non-Interactive and Information-Theoretic Private Verifiable Secret Sharing"
  - *Context:* The mathematical basis for hiding values (e.g., card values) while retaining the ability to prove their properties later.
* **Arkworks Ecosystem:**
  - *Link:* [arkworks.rs](https://arkworks.rs)
  - *Context:* The primary Rust library stack for programming zero-knowledge proof applications and cryptographic equations.

### 3. P2P Mesh Networks & Consensus

Since each player runs a local node, players must coordinate game transitions and maintain absolute synchronization without a central authority.

* **Gossip Protocols:**
  - *Context:* Mechanisms for broadcasting state transitions rapidly across multiple peers. Useful background for QR-code based mesh networking and local socket sync.
* **Distributed Hash Tables (DHT):**
  - *Context:* Underpins decentralized peer discovery. Look up DHT specifications for Iroh and libp2p.
* **Iroh Networking:**
  - *Link:* [iroh.computer](https://iroh.computer)
  - *Context:* The primary P2P networking stack utilized by our backend to handle NAT hole-punching and direct QUIC streams.
