# Architecture

There is no unified tech-stack yet. This outlines some different ideas.
Except for Rust, none of this is set in stone yet.

## Rust

Rust is convenient, safe and fast, and fun to use. We're using it :)

## Monorepo

Rust has excellent support for monorepos. Multiple crates can be kept in the
same repo. This ensures projects can interact without regularly breaking each
other. I do not want to implement the entire card game just to implement
serialization of its data. I also do not want anyone to write a serializer for
data that my card game does not output or know how to process.

This will make the project quite big, but `sccache` can be used to ensure
compile times stay fast.



## Target Platform

- Web?
- Android?
- Linux?

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
