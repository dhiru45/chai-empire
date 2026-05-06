# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Backend API server (for Android integration)

This project now includes a Node.js backend API under `server/index.js` for:
- global leaderboard
- per-player stats
- cloud save state

### Run API server

```bash
npm run api:dev
```

or production style:

```bash
npm run api:start
```

Default port is `4000`. Override with `PORT`, for example:

```bash
PORT=5000 npm run api:start
```

PowerShell:

```powershell
$env:PORT=5000; npm run api:start
```

### Endpoints

- `GET /health`
- `GET /api/game/bootstrap`
- `GET /api/leaderboard?limit=20`
- `POST /api/leaderboard`
- `GET /api/players/:playerId/stats`
- `PUT /api/players/:playerId/stats`
- `GET /api/players/:playerId/save`
- `PUT /api/players/:playerId/save`

### Request examples

Submit leaderboard score:

```json
{
  "playerId": "player-123",
  "name": "ChaiMaster",
  "score": 90210,
  "level": 18,
  "date": "2026-05-06T12:00:00.000Z"
}
```

Save stats:

```json
{
  "level": 18,
  "xp": 2400,
  "money": 12050,
  "reputation": 87,
  "totalServed": 520,
  "totalEarned": 48900,
  "day": 33
}
```

Cloud save body can be the full game-state object your Android game wants to persist.
