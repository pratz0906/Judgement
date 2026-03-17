# Kachufool — Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Type System](#type-system)
6. [State Management](#state-management)
   - [Game State](#game-state)
   - [Game Actions](#game-actions)
   - [Game Reducer](#game-reducer)
   - [Game Context Provider](#game-context-provider)
7. [Game Logic Modules](#game-logic-modules)
   - [Deck Operations](#deck-operations)
   - [Round Structure](#round-structure)
   - [Bidding Rules](#bidding-rules)
   - [Trick Resolution](#trick-resolution)
   - [Scoring](#scoring)
   - [AI Strategy](#ai-strategy)
   - [Player Statistics](#player-statistics)
8. [UI Components](#ui-components)
   - [App Entry Point](#app-entry-point)
   - [Setup Components](#setup-components)
   - [Game Phase Components](#game-phase-components)
   - [Shared Components](#shared-components)
   - [Stats & History Components](#stats--history-components)
9. [Utilities](#utilities)
   - [Seat Positioning](#seat-positioning)
   - [Storage](#storage)
10. [Constants](#constants)
11. [Game Flow & Phase Transitions](#game-flow--phase-transitions)
12. [Data Persistence](#data-persistence)
13. [Accessibility](#accessibility)
14. [Build & Development](#build--development)

---

## Overview

**Kachufool** is a browser-based implementation of the classic trick-taking card game **Judgement** (also known as Oh Hell, Kachufool, Nomination Whist, or Contract Whist). The application supports single-player vs AI bots (3–6 players) and hot-seat multiplayer on the same device. It is built as a client-side React SPA with no backend — all state is managed in-memory via `useReducer`, and game history is persisted to `localStorage`.

---

## Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Framework      | React 19.2                     |
| Language       | TypeScript 5.9                 |
| Build Tool     | Vite 7.3                       |
| Linting        | ESLint 9 + `typescript-eslint` |
| Package Manager| npm                            |
| Runtime        | Browser (client-side only)     |
| Persistence    | `localStorage`                 |

There are **no runtime dependencies** beyond `react` and `react-dom`. No router, no CSS framework, no state management library — the entire app is implemented with React primitives.

---

## Project Structure

```
├── index.html                    # HTML shell (Vite entry point)
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # Root TS config (project references)
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node/Vite TS config
├── eslint.config.js              # ESLint flat config
├── public/                       # Static assets
└── src/
    ├── main.tsx                  # React DOM render entry
    ├── App.tsx                   # Root component & view router
    ├── App.css                   # Global application styles
    ├── index.css                 # CSS reset & base styles
    ├── components/
    │   ├── game/                 # Game phase screens
    │   │   ├── GameScreen.tsx    # Phase router + header
    │   │   ├── PeekScreen.tsx    # Hot-seat card reveal
    │   │   ├── BiddingPhase.tsx  # Bid placement UI
    │   │   ├── PlayingPhase.tsx  # Card play UI
    │   │   ├── TrickResult.tsx   # Trick winner announcement
    │   │   ├── RoundResult.tsx   # Round scoring summary
    │   │   └── GameOver.tsx      # Final standings
    │   ├── setup/                # Pre-game configuration
    │   │   ├── SetupScreen.tsx   # Main setup container
    │   │   ├── PlayerConfig.tsx  # Player name/bot toggles
    │   │   └── RoundConfig.tsx   # Round mode selector
    │   ├── shared/               # Reusable display components
    │   │   ├── CardComponent.tsx # Single card rendering
    │   │   ├── HandDisplay.tsx   # Fan of cards in a hand
    │   │   ├── PlayerIndicator.tsx # Horizontal player status bar
    │   │   ├── Scoreboard.tsx    # Round-by-round score table
    │   │   └── TrumpIndicator.tsx # Trump suit & round display
    │   └── stats/                # Post-game analytics
    │       ├── StatsScreen.tsx   # Aggregate player metrics
    │       └── HistoryScreen.tsx # Recent game table
    ├── constants/
    │   └── deck.ts               # Suit symbols, colors, rank labels, deck factory
    ├── context/
    │   └── GameContext.tsx        # React Context + Provider + hooks
    ├── logic/
    │   ├── ai.ts                 # Bot bidding & card play strategy
    │   ├── bidding.ts            # Bid validation rules
    │   ├── deck.ts               # Shuffle, sort, deal functions
    │   ├── gameActions.ts        # Action type definitions
    │   ├── gameReducer.ts        # Core state machine
    │   ├── round.ts              # Round structure generation
    │   ├── scoring.ts            # Points calculation
    │   ├── stats.ts              # Aggregate statistics computation
    │   └── tricks.ts             # Playable card filtering & trick winner resolution
    ├── types/
    │   └── game.ts               # Core type/enum/interface definitions
    └── utils/
        ├── seatPosition.ts       # Circular table CSS positioning
        └── storage.ts            # localStorage read/write utilities
```

---

## Architecture

The application follows a **unidirectional data flow** pattern:

```
┌───────────────┐     dispatch(action)     ┌──────────────┐
│  UI Components│ ──────────────────────── │  gameReducer │
│   (React)     │                          │  (pure fn)   │
└───────┬───────┘                          └──────┬───────┘
        │                                         │
        │  reads state via useGame()               │ returns new state
        │                                         │
        ▼                                         ▼
┌───────────────────────────────────────────────────────┐
│              GameContext (React Context)              │
│   ┌─────────────────────────────────────────────┐     │
│   │  state: GameState                           │     │
│   │  dispatch: React.Dispatch<GameAction>       │     │
│   │  getPlayableCardsForCurrentPlayer(): Card[] │     │
│   │  getValidBidsForCurrentPlayer(): number[]   │     │
│   │  currentView: AppView                       │     │
│   │  navigateTo(view): void                     │     │
│   └─────────────────────────────────────────────┘     │
│                                                       │
│   Side Effects (useEffect):                           │
│     • Bot auto-play (bidding: 700ms, playing: 800ms)  │
│     • Auto-acknowledge trick results (1500ms)         │
│     • Auto-save game record on game over              │
└───────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No external state library**: `useReducer` + Context provides sufficient state management for this single-page game.
- **Pure reducer**: The `gameReducer` is a pure function with no side effects. All side effects (bot play, auto-save) live in `useEffect` hooks within the provider.
- **No routing library**: View switching between `game`, `stats`, and `history` is handled by a simple `currentView` state variable in the context.
- **Logic/UI separation**: All game rules (bidding, tricks, scoring, AI) are isolated in `src/logic/` as pure functions, making them testable independently of React.

---

## Type System

All core types are defined in `src/types/game.ts`.

### Enums

| Enum   | Values                                           | Purpose                    |
|--------|--------------------------------------------------|----------------------------|
| `Suit` | `Spades`, `Diamonds`, `Clubs`, `Hearts`          | Card suit with string keys |
| `Rank` | `Two(2)` through `Ace(14)`                       | Numeric rank for comparison|

### Constants

| Constant     | Type     | Value                                                | Purpose                    |
|--------------|----------|------------------------------------------------------|----------------------------|
| `SUIT_ORDER` | `Suit[]` | `[Spades, Diamonds, Clubs, Hearts]`                  | Trump rotation cycle       |

### Core Interfaces

#### `Card`
```typescript
{
  suit: Suit;
  rank: Rank;
  id: string;          // Format: "{Suit}-{Rank}" e.g. "Spades-14"
}
```

#### `Player`
```typescript
{
  id: number;          // Index-based (0, 1, 2, ...)
  name: string;
  isBot: boolean;
  hand: Card[];        // Current cards in hand
  bid: number | null;  // null until bid is placed
  tricksWon: number;   // Tricks won in current round
}
```

#### `PlayerConfig`
```typescript
{
  name: string;
  isBot: boolean;
}
```
Used during setup to configure players before the game starts.

#### `GamePhase`
A discriminated string union representing the current phase of the game:
```
'setup' | 'peeking' | 'bidding' | 'playing' | 'trickResult' | 'roundResult' | 'gameOver'
```

#### `TrickCard`
```typescript
{
  playerId: number;
  card: Card;
}
```

#### `TrickState`
```typescript
{
  cardsPlayed: TrickCard[];
  leadPlayerId: number;
  leadSuit: Suit | null;  // null until first card is played
}
```

#### `PlayerRoundScore`
```typescript
{
  playerId: number;
  bid: number;
  tricksWon: number;
  roundPoints: number;
}
```

#### `RoundScore`
```typescript
{
  roundNumber: number;
  cardsDealt: number;
  trump: Suit;
  playerScores: PlayerRoundScore[];
}
```

#### `GameState`
The complete game state managed by the reducer:
```typescript
{
  phase: GamePhase;
  players: Player[];
  roundStructure: number[];     // Array of card counts per round, e.g. [1,2,3,...,3,2,1]
  currentRoundIndex: number;
  trumpSuit: Suit;
  dealerIndex: number;
  currentPlayerIndex: number;
  trick: TrickState;
  trickNumber: number;
  trickWinner: number | null;
  scoreHistory: RoundScore[];
  peekQueue: number[];          // Player IDs waiting to peek (hot-seat)
}
```

#### `GameRecord`
Persisted to `localStorage` after each game:
```typescript
{
  id: string;                    // Timestamp-based unique ID
  date: string;                  // ISO 8601 date string
  playerName: string;
  playerCount: number;
  totalRounds: number;
  won: boolean;
  finalScore: number;
  otherPlayers: { name: string; score: number }[];
  rounds: { bid: number; tricksWon: number; cardsDealt: number; roundPoints: number }[];
}
```

---

## State Management

### Game State

The `GameState` interface (see [Type System](#type-system)) is the single source of truth. Initial state sets `phase: 'setup'` with all fields at their defaults.

### Game Actions

Defined as a discriminated union in `src/logic/gameActions.ts`:

| Action              | Payload                                    | Dispatched When                  |
|---------------------|--------------------------------------------|----------------------------------|
| `START_GAME`        | `players: PlayerConfig[], roundStructure: number[]` | User clicks "Start Game"  |
| `PLAYER_PEEKED`     | `playerId: number`                         | Human confirms card peek (hot-seat) |
| `PLACE_BID`         | `playerId: number, bid: number`            | Human or bot places a bid        |
| `PLAY_CARD`         | `playerId: number, card: Card`             | Human or bot plays a card        |
| `ACKNOWLEDGE_TRICK` | *(none)*                                   | Auto-acknowledged after 1.5s     |
| `NEXT_ROUND`        | *(none)*                                   | User clicks "Next Round"         |
| `RESTART`           | *(none)*                                   | User clicks "Play Again"         |

### Game Reducer

Located in `src/logic/gameReducer.ts`. The reducer is the core state machine:

#### `START_GAME`
1. Creates `Player[]` from `PlayerConfig[]` (assigns numeric IDs).
2. Calls `startDealing()` — deals cards, sets trump, determines peek queue.

#### `startDealing()` (internal helper)
1. Reads `cardsPerPlayer` from `roundStructure[currentRoundIndex]`.
2. Calls `getTrumpForRound()` to cycle trump suit.
3. Calls `deal()` to shuffle deck and distribute cards.
4. Resets all player bids and tricks won.
5. If multiple human players exist, sets `phase: 'peeking'` with a `peekQueue`.
6. Otherwise, sets `phase: 'bidding'`.
7. First bidder = player after the dealer (clockwise).

#### `PLAYER_PEEKED`
1. Removes player from `peekQueue`.
2. If queue is empty, transitions to `phase: 'bidding'`.

#### `PLACE_BID`
1. Sets bid on the player.
2. If all players have bid, transitions to `phase: 'playing'` with lead player = player after dealer.
3. Otherwise, advances `currentPlayerIndex`.

#### `PLAY_CARD`
1. Removes card from player's hand.
2. Sets `leadSuit` if first card in trick.
3. Adds card to `trick.cardsPlayed`.
4. If all players have played:
   - Calls `resolveTrickWinner()` to find winner.
   - Increments winner's `tricksWon`.
   - Sets `phase: 'trickResult'`.
5. Otherwise, advances `currentPlayerIndex`.

#### `ACKNOWLEDGE_TRICK`
1. If all tricks for the round are complete:
   - Calls `calculateRoundScores()`.
   - Appends to `scoreHistory`.
   - Sets `phase: 'roundResult'`.
2. Otherwise, starts next trick with winner as lead.

#### `NEXT_ROUND`
1. If no more rounds remain, sets `phase: 'gameOver'`.
2. Otherwise, advances dealer and calls `startDealing()`.

#### `RESTART`
Returns to `initialState` (phase: `'setup'`).

### Game Context Provider

Located in `src/context/GameContext.tsx`. Wraps the reducer and exposes:

| Export                              | Type                                 | Description                                |
|-------------------------------------|--------------------------------------|--------------------------------------------|
| `state`                            | `GameState`                          | Current game state                         |
| `dispatch`                         | `React.Dispatch<GameAction>`         | Wrapped dispatch (resets view on RESTART)  |
| `getPlayableCardsForCurrentPlayer` | `() => Card[]`                       | Cards the current player may legally play  |
| `getValidBidsForCurrentPlayer`     | `() => number[]`                     | Valid bid values for the current player    |
| `currentView`                      | `AppView` (`'game'|'stats'|'history'`) | Current navigation view                 |
| `navigateTo`                       | `(view: AppView) => void`           | View navigation                            |

#### Side Effects in Provider

1. **Bot auto-play**: When the current player is a bot and the phase is `bidding` (700ms delay) or `playing` (800ms delay), the AI module is invoked and an action is dispatched automatically.
2. **Trick auto-acknowledgement**: When `phase === 'trickResult'`, a 1500ms timer dispatches `ACKNOWLEDGE_TRICK` automatically.
3. **Game auto-save**: When `phase === 'gameOver'` (once per game), the provider builds a `GameRecord` from state and saves it to `localStorage`.

---

## Game Logic Modules

All located in `src/logic/`. Each module exports pure functions with no React dependency.

### Deck Operations

**File**: `src/logic/deck.ts`

| Function                                  | Description                                           |
|-------------------------------------------|-------------------------------------------------------|
| `shuffle(deck: Card[]): Card[]`           | Fisher-Yates shuffle (unbiased)                       |
| `sortHand(hand: Card[]): Card[]`          | Sort by suit (S/H/C/D) then ascending rank            |
| `deal(playerCount, cardsPerPlayer): Card[][]` | Shuffles full deck, distributes sorted hands     |

The `deal` function creates a fresh 52-card deck each time via `createFullDeck()` from `src/constants/deck.ts`, shuffles it, and slices `cardsPerPlayer` cards for each player. Hands are auto-sorted.

### Round Structure

**File**: `src/logic/round.ts`

| Function                                                    | Description                                |
|-------------------------------------------------------------|--------------------------------------------|
| `getMaxCardsPerPlayer(playerCount): number`                 | `Math.floor(52 / playerCount)`             |
| `generateRoundStructure(playerCount, mode, custom?): number[]` | Generates card-count sequence           |
| `getTrumpForRound(roundIndex): Suit`                        | Cycles through `SUIT_ORDER` (mod 4)        |

**Round Modes**:

| Mode       | Round Sequence Example (4 players, max=13) |
|------------|--------------------------------------------|
| `upDown`   | `[1, 2, 3, ..., 13, ..., 3, 2, 1]` (25 rounds) |
| `upOnly`   | `[1, 2, 3, ..., 13]` (13 rounds)          |
| `downOnly` | `[13, 12, 11, ..., 1]` (13 rounds)        |
| `custom`   | User-defined, filtered to `[1, max]` range |

**Trump Rotation**: Spades → Diamonds → Clubs → Hearts → Spades → ...

### Bidding Rules

**File**: `src/logic/bidding.ts`

| Function                                                              | Description                                        |
|-----------------------------------------------------------------------|----------------------------------------------------|
| `isLastBidder(playerIndex, dealerIndex): boolean`                     | Checks if player is the dealer (bids last)         |
| `getValidBids(totalTricks, players, currentPlayerIndex, dealerIndex): number[]` | Returns valid bid values for the player |

**Dealer Restriction**: The dealer (last bidder) cannot bid a value that makes the total bids equal the total tricks available. This ensures at least one player will fail their bid each round.

**Example**: 5-card round, other bids sum to 3 → dealer cannot bid 2.

### Trick Resolution

**File**: `src/logic/tricks.ts`

| Function                                                    | Description                                          |
|-------------------------------------------------------------|------------------------------------------------------|
| `getPlayableCards(hand, leadSuit): Card[]`                  | Must follow suit if able; otherwise play any card    |
| `resolveTrickWinner(trick, trumpSuit): number`              | Returns the player ID that won the trick             |

**Card Comparison Priority** (internal `beats()` function):
1. **Trump beats non-trump**: A trump card always beats a non-trump card.
2. **Higher trump beats lower trump**: Among trump cards, higher rank wins.
3. **Lead suit beats off-suit**: Among non-trump cards, lead suit beats off-suit.
4. **Higher rank in lead suit wins**: Among lead-suit cards, higher rank wins.
5. **Off-suit never wins**: A non-lead, non-trump card cannot win a trick.

### Scoring

**File**: `src/logic/scoring.ts`

| Function                                              | Description                                      |
|-------------------------------------------------------|--------------------------------------------------|
| `calculateRoundScores(players): PlayerRoundScore[]`   | Computes each player's score for the round       |
| `calculateTotalScores(scoreHistory): {playerId, total}[]` | Aggregates across rounds, sorted descending |

**Scoring Formula**:
- **Correct bid** (bid === tricksWon): `+10 + (10 × tricksWon)`
- **Incorrect bid**: `-(10 × bid)`

| Bid | Tricks Won | Points |
|-----|------------|--------|
|  0  |     0      |  +10   |
|  3  |     3      |  +40   |
|  3  |     2      |  -30   |
|  3  |     4      |  -30   |
|  0  |     1      |   0    |

### AI Strategy

**File**: `src/logic/ai.ts`

#### `aiBid(hand, trumpSuit, totalTricks, players, playerIndex, dealerIndex): number`

Uses a power-heuristic to estimate bid:

| Card Type        | Power Value |
|------------------|-------------|
| Trump Ace/King   | 1.0         |
| Trump Queen      | 0.5         |
| Off-suit Ace     | 0.7         |
| Off-suit King    | 0.3         |

The total power is rounded to the nearest integer and clamped to `[0, totalTricks]`. If the resulting bid is invalid (dealer restriction), the closest valid bid is selected.

#### `aiPlayCard(hand, trick, trumpSuit, player): Card`

Greedy strategy based on whether the bot needs more tricks (`bid > tricksWon`):

| Situation            | Needs More Tricks       | Has Enough Tricks      |
|----------------------|-------------------------|------------------------|
| **Leading**          | Play highest card       | Play lowest card       |
| **Following (can win)** | Play lowest winning card | Play lowest card    |
| **Following (can't win)** | Play lowest card    | Play lowest card       |

### Player Statistics

**File**: `src/logic/stats.ts`

Computes aggregate statistics from an array of `GameRecord` objects:

| Metric             | Calculation                                        |
|--------------------|----------------------------------------------------|
| Win Rate           | `gamesWon / gamesPlayed`                           |
| Loss Rate          | `gamesLost / gamesPlayed`                          |
| Won Hands Rate     | `handsWon / totalHands` (tricks won / tricks played)|
| Lost Hands Rate    | `handsLost / totalHands`                           |
| Average Score      | `totalScore / gamesPlayed`                         |
| Avg Other Score    | `otherScoreSum / otherPlayerCount`                 |
| Successful Bids    | Rounds where `bid === tricksWon`                   |
| Unsuccessful Bids  | Rounds where `bid !== tricksWon`                   |

---

## UI Components

### App Entry Point

**File**: `src/App.tsx`

```
<GameProvider>
  <AppContent />      // Routes based on currentView & game phase
</GameProvider>
```

`AppContent` reads `currentView` and `state.phase`:
- `currentView === 'stats'` → `<StatsScreen />`
- `currentView === 'history'` → `<HistoryScreen />`
- `state.phase === 'setup'` → `<SetupScreen />`
- Otherwise → `<GameScreen />`

### Setup Components

#### `SetupScreen` (`src/components/setup/SetupScreen.tsx`)
Main pre-game screen. Manages local state for player configurations and round mode. On "Start Game", generates the round structure and dispatches `START_GAME`. Navigation buttons allow viewing Stats and History.

#### `PlayerConfig` (`src/components/setup/PlayerConfig.tsx`)
Renders a list of player rows (name input + bot/human toggle). Supports 3–6 players. Players are added/removed from the end of the list.

#### `RoundConfig` (`src/components/setup/RoundConfig.tsx`)
Radio button group for selecting round mode (`upDown`, `upOnly`, `downOnly`, `custom`). Custom mode shows a text input for comma-separated card counts. Displays `maxCards` based on current player count.

### Game Phase Components

#### `GameScreen` (`src/components/game/GameScreen.tsx`)
Phase router — renders the appropriate component based on `state.phase`. Also renders the game header (trump indicator, card/trick counts) and player indicator bar for all phases except `gameOver`.

#### `PeekScreen` (`src/components/game/PeekScreen.tsx`)
Hot-seat multiplayer: when multiple humans play on one device, each player gets a private card reveal. Shows "Reveal Cards" → displays hand → "Done - Pass Device" transitions to next player. Only appears when `peekQueue` is non-empty.

#### `BiddingPhase` (`src/components/game/BiddingPhase.tsx`)
Displays a circular table layout showing each player's bid status. For human players, shows their hand and bid buttons (filtered to valid bids only). Bot turns show "thinking..." text.

#### `PlayingPhase` (`src/components/game/PlayingPhase.tsx`)
Displays the circular table with cards played in the current trick. Human players see their hand with playable cards highlighted; clicking a playable card dispatches `PLAY_CARD`. Shows player stats (tricks won, bid) at each seat.

#### `TrickResult` (`src/components/game/TrickResult.tsx`)
Brief display (1.5s auto-dismissal) showing all cards played in the trick and announcing the winner. Uses the same circular table layout.

#### `RoundResult` (`src/components/game/RoundResult.tsx`)
Table showing each player's bid, tricks won, round points, and running total. Highlights successful bids (green) vs misses (red). Includes a "Next Round" / "See Final Results" button and the full scoreboard.

#### `GameOver` (`src/components/game/GameOver.tsx`)
Winner banner with final standings table. Provides "Play Again" (dispatches `RESTART`), "Stats", and "History" navigation. Displays the complete round-by-round scoreboard.

### Shared Components

#### `CardComponent` (`src/components/shared/CardComponent.tsx`)
Renders a single playing card with:
- Rank and suit in top-left / bottom-right corners
- Large center suit symbol
- Red/black coloring based on suit
- Dimmed appearance for non-playable cards
- Interactive (button role, keyboard support) when `playable && onClick`
- `small` variant for table display

#### `HandDisplay` (`src/components/shared/HandDisplay.tsx`)
Renders a fan of `CardComponent` elements. Accepts optional `playableCards` to dim non-playable cards and `onCardClick` for interaction.

#### `PlayerIndicator` (`src/components/shared/PlayerIndicator.tsx`)
Horizontal bar showing all players with name, dealer badge (D), first leader badge (1), bid, and tricks won. Active player is highlighted.

#### `Scoreboard` (`src/components/shared/Scoreboard.tsx`)
Full round-by-round score table. Each cell shows round points with a small bid ratio (e.g., `+40 (3/3)`). Hit bids are green, misses are red. Total row at the bottom.

#### `TrumpIndicator` (`src/components/shared/TrumpIndicator.tsx`)
Displays current trump suit (with Unicode symbol and color) and round number (e.g., "Round 5/25").

### Stats & History Components

#### `StatsScreen` (`src/components/stats/StatsScreen.tsx`)
Displays 8 aggregate stat cards for the human player: win/loss rates, hand rates, average scores, and bid accuracy. Includes a "Clear Stats" button (with confirmation dialog) that wipes all `localStorage` records.

#### `HistoryScreen` (`src/components/stats/HistoryScreen.tsx`)
Table of the last 10 games showing date, player count, rounds, final score, win/loss result, and bid accuracy percentage.

---

## Utilities

### Seat Positioning

**File**: `src/utils/seatPosition.ts`

```typescript
seatPosition(index, total, humanIndex, radiusPercent = 42): { left: string, top: string }
```

Computes CSS absolute positioning for a player seat around a circular table. The human player is anchored at the bottom (6 o'clock position, angle = π/2). Other players are evenly distributed clockwise.

**Math**: 
- Start angle: $\theta_0 = \frac{\pi}{2} - \frac{2\pi}{n} \cdot h$ (where $h$ = human index, $n$ = player count)
- Seat angle: $\theta_i = \frac{2\pi}{n} \cdot i + \theta_0$
- Position: $x = 50 + r \cdot \cos(\theta_i)$, $y = 50 + r \cdot \sin(\theta_i)$; where $r = 42\%$ by default

### Storage

**File**: `src/utils/storage.ts`

Provides CRUD operations for `GameRecord` objects in `localStorage` under the key `judgement_game_history`:

| Function                                  | Description                                        |
|-------------------------------------------|----------------------------------------------------|
| `saveGameRecord(record)`                  | Appends a record to the stored array               |
| `getGameRecords(playerName?)`             | Returns all records, optionally filtered by name   |
| `getRecentGames(playerName, count = 10)`  | Returns the N most recent games, newest first      |
| `clearGameRecords()`                      | Removes all stored records                         |

All reads are wrapped in try/catch to handle malformed data gracefully.

---

## Constants

**File**: `src/constants/deck.ts`

| Constant         | Type                       | Description                                          |
|------------------|----------------------------|------------------------------------------------------|
| `SUIT_SYMBOLS`   | `Record<Suit, string>`     | Unicode symbols: ♠ ♦ ♣ ♥                             |
| `SUIT_COLORS`    | `Record<Suit, string>`     | `'black'` or `'red'` per suit                        |
| `RANK_DISPLAY`   | `Record<Rank, string>`     | Display labels: `'2'...'10'`, `'J'`, `'Q'`, `'K'`, `'A'` |
| `createFullDeck()` | `() => Card[]`           | Generates unshuffled 52-card deck (4 suits × 13 ranks) |

Card IDs are formatted as `"{Suit}-{Rank}"` (e.g., `"Spades-14"` for Ace of Spades).

---

## Game Flow & Phase Transitions

```
                    ┌─────────┐
                    │  setup  │
                    └────┬────┘
                         │ START_GAME
                         ▼
              ┌──── peekQueue? ────┐
              │ yes                │ no
              ▼                    ▼
        ┌──────────┐        ┌──────────┐
        │ peeking  │        │ bidding  │
        └────┬─────┘        └────┬─────┘
             │ PLAYER_PEEKED     │ PLACE_BID (all done)
             │ (queue empty)     │
             └──────┬────────────┘
                    ▼
              ┌──────────┐
              │ playing  │◄──────────────────────┐
              └────┬─────┘                       │
                   │ PLAY_CARD (all played)      │
                   ▼                             │
            ┌─────────────┐                      │
            │ trickResult │                      │
            └──────┬──────┘                      │
                   │ ACKNOWLEDGE_TRICK           │
                   ▼                             │
           ┌── more tricks? ──┐                  │
           │ yes              │ no               │
           └──────────────────┘                  │
                   │                             │
                   │ (more tricks)               │
                   └─────────────────────────────┘
                   │ (no more tricks)
                   ▼
            ┌─────────────┐
            │ roundResult │
            └──────┬──────┘
                   │ NEXT_ROUND
                   ▼
           ┌── more rounds? ──┐
           │ yes               │ no
           ▼                   ▼
     startDealing()      ┌──────────┐
     (→ peeking          │ gameOver │
      or bidding)        └────┬─────┘
                              │ RESTART
                              ▼
                        ┌─────────┐
                        │  setup  │
                        └─────────┘
```

### Turn Order

- **Dealer** rotates clockwise each round (index increments mod player count).
- **First bidder** and **first trick leader** = player after the dealer.
- **Subsequent trick leader** = winner of the previous trick.
- Players act in clockwise order (index increments mod player count).

---

## Data Persistence

Game history is persisted entirely in `localStorage` under the key `judgement_game_history`.

**When data is saved**: Automatically when `phase` transitions to `gameOver`, via a `useEffect` in `GameProvider`. A ref guard (`gameSavedRef`) prevents duplicate saves.

**What is saved**: A `GameRecord` containing the human player's name, final score, win/loss status, per-round bid/trick data, and all opponents' final scores.

**Filtering**: Stats and history screens filter records by the current human player's name (case-insensitive match).

**Clear**: The Stats screen provides a "Clear Stats" button that calls `clearGameRecords()` (removes the entire localStorage key).

---

## Accessibility

The application includes several accessibility features:

- **ARIA roles and labels**: Regions, buttons, tables, and live areas are properly annotated (`role="region"`, `aria-label`, `aria-live="polite"`, `aria-current`).
- **Keyboard interaction**: Cards are focusable (`tabIndex={0}`) and activated via Enter/Space keys.
- **Screen reader content**: `.sr-only` labels are used for inputs and fieldsets.
- **Live regions**: Phase transitions and status messages use `aria-live="polite"` for screen reader announcements.
- **Semantic HTML**: Tables use proper `<th scope="col|row">` headings.
- **Reduced motion**: Referenced as a supported feature (via CSS `prefers-reduced-motion`).
- **Color coding**: Score hits/misses use CSS classes (`score-hit`, `score-miss`) — colors should be supplemented by the point sign (+/-) for non-color-dependent readability.

---

## Build & Development

### Prerequisites

- Node.js (LTS recommended)
- npm

### Scripts

| Command          | Description                                 |
|------------------|---------------------------------------------|
| `npm run dev`    | Start Vite dev server with HMR              |
| `npm run build`  | TypeScript compile + Vite production build  |
| `npm run lint`   | Run ESLint on all files                     |
| `npm run preview`| Preview the production build locally        |

### Configuration Files

| File                | Purpose                                     |
|---------------------|---------------------------------------------|
| `vite.config.ts`    | Vite config — React plugin only             |
| `tsconfig.json`     | Root config with project references          |
| `tsconfig.app.json` | App TS config (src files)                   |
| `tsconfig.node.json`| Node/Vite TS config                         |
| `eslint.config.js`  | ESLint flat config with React hooks rules    |
