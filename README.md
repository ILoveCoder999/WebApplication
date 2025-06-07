# Stuff Happens – Single‑Player Web Game (Skeleton)

> **Deadline**: 19 Jun 2025 – This repo gives you a ready‑to‑run baseline so you can focus on game logic & styling.

## Monorepo layout

```
stuff-happens/
│
├─ server/      # Node 22 + Express + SQLite
│   ├─ index.mjs
│   ├─ routes/
│   ├─ db/
│   └─ ...
│
└─ client/      # React 18 + Vite
    ├─ src/
    └─ ...
```

### Quick start

```bash
# 1. start API
cd server
npm i
npm run dev        # http://localhost:4000

# 2. start front‑end
cd ../client
npm i
npm run dev        # http://localhost:5173
```

The first backend run seeds one demo user (`demo/demo`) and 50 placeholder cards.

## Next TODOs

- Implement `/games/:id/guess` logic & victory conditions.
- Build `<GameBoard />`, `<HiddenCard />` and timer bar.
- Style with Tailwind or your favourite CSS framework.
- Replace picsum images with real “Stuff Happens” card art.
