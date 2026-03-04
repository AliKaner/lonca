# Seven Kingdoms Guild

A strategic browser-based multiplayer card game built with React, TypeScript, and Zustand.

## Core Features
- **Tavern Phase**: Recruit unique heroes with passive abilities.
- **Assignment Phase**: Strategically assign heroes to missions based on level and rank.
- **Mission Phase**: Face off against monsters in deterministic combat.
- **Multiplayer Ready**: Built with a server-authoritative model (mocked via `MockServer`).
- **Premium UI**: Modern aesthetic with glassmorphism, animations, and responsive layout.

## Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **RNG**: Custom seeded SFC32 generator

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start development server**:
    ```bash
    npm run dev
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## Project Structure
- `/src/core`: Game logic, combat resolution, and types.
- `/src/data`: JSON configuration for heroes, missions, and monsters.
- `/src/network`: Mock WebSocket server and client protocol.
- `/src/store`: Global game state management.
- `/src/ui`: Modular React components for the board and panels.
