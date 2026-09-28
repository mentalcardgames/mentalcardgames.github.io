---
outline: deep
---

# Poker Game Implementation

The Poker game in MCG is implemented as a real-time multiplayer Texas Hold'em
engine.
It is split cleanly between the game rule logic in the
[`mcg-poker`](https://github.com/mentalcardgames/mcg/tree/main/crates/poker)
crate, server orchestration and WebSocket broadcasting in
[`native_mcg`](https://github.com/mentalcardgames/mcg/tree/main/crates/native_mcg),
and the interactive graphical client in
[`frontend`](https://github.com/mentalcardgames/mcg/tree/main/crates/frontend).

This page details the game architecture, state synchronization, and provides a
step-by-step walkthrough on how to **locally test** the Poker implementation.

## Architecture

The poker subsystem consists of three major layers:

1. **`mcg-poker` crate:**
   - **Game Flow & Betting (`game/`):**
     Manages stages (`PreFlop`, `Flop`, `Turn`, `River`, `Showdown`), blind
     posting (Small Blind / Big Blind), pot calculation, and side pots.
   - **Hand Evaluator (`eval/`):**
     High-performance 7-card evaluator determining hand ranks.
   - **Bot Logic (`bot/` & `driver/`):**
     Implements automated player agents with configurable decision delays
     (`bot_delay` in milliseconds).

2. **`native_mcg` controller:**
   - Maintains the authoritative game state.
   - Validates incoming `Frontend2BackendMsg::Action` requests against the
     current `to_act` player.
   - Broadcasts the updated public game state
     (`Backend2FrontendMsg::UpdatePokerState`) to all connected WebSocket clients.

3. **`frontend` screen (`PokerOnlineScreen`):**
   - Renders player avatars, chips, active bets, community cards, and chip
     counts using `egui`.
   - Offers controls to join as a specific player ("Play as"), rename players,
     toggle bots, and submit player actions.

## Testing Poker Locally with Two Instances

Testing poker locally with two concurrent instances allows you to verify
real-time WebSocket state broadcasting, turn alternation, betting constraints,
and UI updates between distinct player seats.

### Step 1: Build the Frontend and Start the Backend

In the root repository directory, run:

```shell
just start dev
```

This recipe:

1. Compiles the frontend crate to WebAssembly.
2. Starts the `native_mcg` backend server.
3. Binds the HTTP and WebSocket listeners to the first available local port
   (default: `http://127.0.0.1:3000`).

Once the server outputs `starting server`, the application is ready.
You'll see an address printed to STDOUT which you can either copy & paste into
the browser or directly click to open it.

### Step 2: Open Two Independent Browser Instances

Open two browser windows with your backend address and navigate to **Poker Online**

> [!TIP]
> Opening Window 2 in a private/incognito window or a different browser profile
> prevents cached local state or identical browser sessions from interfering
> with client identity and makes visual side-by-side comparison easy.

### Step 3: Connect Both Clients to the Backend

In both windows:

1. Verify the **Server** address input displays your active backend port.
2. Click the **Connect** button at the top of the screen.
3. Both windows will establish a WebSocket connection and register for state updates.

### Step 4: Configure Player Seats ("Play as")

The lobby table in the setup view shows the list of configured player seats:

```text
+----+------------+-------+-------------------------+
| ID | Name       | Bot   | Actions                 |
+----+------------+-------+-------------------------+
| 0  | Alice      | [ ]   | ( ) Play as  [Edit]     |
| 1  | Bob        | [ ]   | ( ) Play as  [Edit]     |
+----+------------+-------+-------------------------+
```

To configure two human players:

1. **Ensure neither player is marked as a bot:**
   - Uncheck the **Bot** checkbox for both **Player 0** and **Player 1**.
2. **Assign Seat 1 in Window 1:**
   - In **Window 1**, click the **"Play as"** button next to **Player 0**.
3. **Assign Seat 2 in Window 2:**
   - In **Window 2**, click the **"Play as"** button next to **Player 1**.

### Step 5: Start the New Game

1. In **Window 1**, click the **Start New Game** button.
2. The backend generates a fresh game:
   - Evaluates player count and starting stacks (e.g., 1000 chips each).
   - Posts small blind and big blind.
   - Deals private hole cards to both players.
   - Sets the initial stage to `PreFlop`.
   - Sets `to_act` to the first active player.
   - Pushed the current state to the second window.
3. Both browser windows will immediately receive the new state broadcast and
   switch to the active poker table view.
