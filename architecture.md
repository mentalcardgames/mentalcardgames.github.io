# Architecture

## Rust

The project is written in Rust.

## Monorepo

Rust has excellent support for monorepos. Multiple crates can be kept in the
same repo. This ensures projects can interact without regularly breaking each
other. I do not want to implement the entire card game just to implement
serialization of its data. I also do not want anyone to write a serializer for
data that my card game does not output or know how to process.

## WASM

The target platform is WebAssembly.
WebAssembly is a binary instruction format that can be executed by modern web browsers.

## Egui

Egui is implemented entirely in Rust and has very few outside dependencies.
Even though it can run in a browser, it does not utilize the DOM and instead draws the entire UI by itself. That means it is very portable and the app could be ported to Desktop, native mobile platforms or basically any other Rust target which has basic IO and a canvas like element.


## Why

This outlines a comparison of different platforms and their pros and cons.

### Linux

#### Pro

- Very convenient, maximum compatibility with the Rust ecosystem.
- No extra hardware required for testing.

#### Con

- Low adoption on Desktops

### Web

#### Pro

- Compatibility with Android/Windows/Linux/Mac
- Easy to distribute/deploy/test
- Native REST Backend and React/Vue/

#### Cons

- WASM is restrictive
- All well supported Frontend Libraries are TypeScript

### Android

#### Pro

- High adoption rate
- Camera/Bluetooth available

#### Con

- Android is very restrictive
- Testing could be difficult

### MacOS

- No
