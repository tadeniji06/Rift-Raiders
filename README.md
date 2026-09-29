# Rift Raiders

A 2D top-down PvPvE extraction RPG.

## Setup and Architecture

### Prerequisites
- Node.js (v18+)
- npm
- Supabase CLI (optional, for local development)

### Project Structure
The repository is set up as an npm monorepo.
- `apps/web`: The React client (Vite + React + Phaser + Supabase)
- `apps/game-server`: The authoritative Node.js/Colyseus multiplayer server
- `packages/shared`: Shared types and constants
- `packages/game-core`: Core game logic reusable between client and server
- `packages/config`: ESLint/Prettier/TypeScript configs
- `supabase/`: Database migrations, seed data, and Edge Functions
- `docs/`: Additional documentation

### Setup Instructions
1. Install dependencies at the root:
   ```bash
   npm install
   ```
2. Set up environment variables:
   - In `apps/web`, create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Start the development servers:
   ```bash
   # From the root directory
   npm run dev
   ```

### Milestone 1 Progress
- [x] Initialized monorepo workspace.
- [x] Bootstrapped React frontend (Vite).
- [x] Scaffolded game-server package configuration.
- [ ] Implement initial Supabase migrations for auth/profiles/arenas.
- [ ] Build React UI for Authentication and Lobby.
- [ ] Arena configuration logic (NEAR Launchpad active).

The foundation is prepared. The next step in Milestone 1 is to create the initial database schema (migrations) and set up the authentication context in the React frontend.
