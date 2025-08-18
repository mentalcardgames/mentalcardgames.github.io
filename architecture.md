# Architecture

## Rust

This uses rust.
Heck yes.

## Monorepo

The project lives in a monorepo. This keeps it from diverging into a
dysfunctional state without anyone noticing. It also makes it easy to share code
between the frontend and backend

## Frontend

The frontend is targetting WASM, so it can run in a browser. It is wrapped in a
thin piece of HTML/JavaScript which gets served to the browser and makes the
browser request and start the RUST WASM library which contains the actual
frontend. The frontend is being rendered to a canvas element. 
It communicates with the backend over a websocket, meaning it can display the
game state in real time. Communication is obviously bidirectional, so the
Frontend can pass the player actions to the backend. 

NO GAME OR BUSINESS LOGIC IS ON THE FRONTEND

The frontend is a small and thin function which does $\text{Game State} \to \text{Pretty
Pictures}$. It also only uses Websocket to communicate with the backend. Nothing
else. The frontend **only** talks to its own backend, not other backends or
frontends. All the P2P decentralized communication happens between instances of
the backend. 

## Backend

This contains he actual game logic. It verifies and enforces the rules of the
game. Each player has their own instance of this. The instances of this
communicate with each other, but not with each other's frontends. The backend
also does cryptography and anything computationally expensive or multithreaded.
It is meant to allow for different Transport layers and mediums. Most of its
logic is transport agnostic. Right now it supports websocket, HTTP and iroh. It
supports all of these at the same time, meaning one player might be
communicating over websocket, another one over iroh. Communication with the CLI
and the frontend is already working very well. Communication with other
instances of the backend is a work in progress. The backend is transport
agnostic to allow for exotic kinds of communication, be that sound or QR codes
or gestures measured with a Gyroscope. This is a somewhat scientific project
after all. 



## CLI

The CLI is meant to test out the functionality of the backend without being a
full blown instance of MCG. The endpoints it contacts are meant to eventually
become the peer to peer implementation



