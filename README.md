# Kachufool — The Judgement Card Game

A browser-based implementation of the classic trick-taking card game **Judgement** (also known as **Kachufool**, **Oh Hell**, **Nomination Whist**, or **Contract Whist**), built with React and TypeScript.

## About the Game

### History

Judgement originated as a parlour card game in the early 20th century, with roots in the Whist family of trick-taking games. Known by many names across different regions — **Oh Hell** in the US and UK, **Kachufool** in South Asia, **Nomination Whist** in Australia, and simply **Judgement** in India — the game gained popularity for its unique bidding mechanic that prevents every player from meeting their bid. The restriction on the dealer's final bid guarantees that at least one player will miss their target each round, creating tension and strategic depth. Its simple rules but deep strategy have made it a beloved game at card tables and gatherings worldwide.

### Rules

**Objective:** Score the most points over a series of rounds by accurately predicting (bidding) how many tricks you will win.

**Setup:**
- 3–6 players using a standard 52-card deck
- The game consists of multiple rounds, with each round dealing a different number of cards (configurable: Up & Down, Up Only, Down Only, or Custom)

**Trump Suit:** Cycles through Spades, Diamonds, Clubs, Hearts across rounds.

**Gameplay:**
1. **Dealing** — Cards are dealt evenly each round. The number of cards per round follows the chosen round structure.
2. **Bidding** — Starting with the player left of the dealer, each player bids how many tricks they expect to win. The **dealer bids last** and is restricted: the total of all bids **cannot** equal the number of tricks available (ensuring at least one player will miss).
3. **Playing** — The player left of the dealer leads the first trick. Players must follow the lead suit if able; otherwise, they may play any card (including trump). The highest trump wins the trick, or the highest card of the lead suit if no trump is played.
4. **Scoring:**
   - **Bid met:** `+10 + (10 x tricks won)` points
   - **Bid missed:** `-(10 x bid)` points

**Example:** If you bid 3 and win exactly 3 tricks, you score `10 + 30 = 40` points. If you bid 3 but win 2 (or 4), you lose `30` points.

### Card Hierarchy

Within a suit, cards rank from highest to lowest: **A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2**. The trump suit beats all other suits.

## Features

- Single-player vs AI bots (3–6 players)
- Hot-seat multiplayer (multiple humans on same device)
- Configurable round structures (Up & Down, Up Only, Down Only, Custom)
- Circular table layout with player positions
- Real-time scoreboard with round-by-round history
- Responsive design for desktop and mobile
- Keyboard-accessible card interactions
- Reduced-motion support for accessibility

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type-safe application logic
- **Vite** — Development server and build tool

## Dependencies

### Runtime
| Package | Purpose |
|---------|---------|
| `react` | UI component library |
| `react-dom` | React DOM renderer |

### Development
| Package | Purpose |
|---------|---------|
| `vite` | Dev server, HMR, and production bundler |
| `@vitejs/plugin-react` | React support for Vite (JSX transform, Fast Refresh) |
| `typescript` | Static type checking |
| `eslint` | Code linting |
| `typescript-eslint` | TypeScript-aware ESLint rules |
| `eslint-plugin-react-hooks` | Enforces React Hooks best practices |
| `eslint-plugin-react-refresh` | Validates React Fast Refresh compatibility |
| `globals` | Browser global type definitions for ESLint |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
  main.tsx                  # App entry point
  App.tsx                   # Root component (setup vs game routing)
  App.css                   # All application styles
  index.css                 # CSS reset and base styles
  types/
    game.ts                 # TypeScript types and enums
  constants/
    deck.ts                 # Card display constants and deck creation
  utils/
    seatPosition.ts         # Circular table seat positioning
  context/
    GameContext.tsx          # Game state provider, bot AI scheduling
  logic/
    ai.ts                   # Bot bidding and card-play strategy
    bidding.ts              # Bid validation and dealer restriction
    deck.ts                 # Shuffle, sort, and deal functions
    gameActions.ts          # Action type definitions
    gameReducer.ts          # Core game state machine
    round.ts                # Round structure generation
    scoring.ts              # Point calculation
    tricks.ts               # Trick resolution and playable card logic
  components/
    setup/
      SetupScreen.tsx       # Game setup (players, rounds)
      PlayerConfig.tsx      # Player name and human/bot toggle
      RoundConfig.tsx       # Round mode selection
    game/
      GameScreen.tsx        # Phase router and game header
      BiddingPhase.tsx      # Bidding UI with circular table
      PlayingPhase.tsx      # Card play UI with circular table
      TrickResult.tsx       # Trick winner display
      RoundResult.tsx       # Round scores and scoreboard
      GameOver.tsx          # Final standings and replay
      PeekScreen.tsx        # Hot-seat card reveal
    shared/
      CardComponent.tsx     # Single card rendering
      HandDisplay.tsx       # Hand of cards display
      PlayerIndicator.tsx   # Player status badges
      Scoreboard.tsx        # Historical score table
      TrumpIndicator.tsx    # Trump suit and round display
```
