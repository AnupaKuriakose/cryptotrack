# CryptoTrack 📈

> Full-stack cryptocurrency portfolio and market dashboard  
> **Angular 18 · NgRx · Signals · Angular Material · Node.js · Express · Neon PostgreSQL · CoinGecko API**

![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)
![NgRx](https://img.shields.io/badge/NgRx-18-purple?logo=redux)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 🚦 Build Progress

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 0 | Repo setup · monorepo · Neon PostgreSQL · server scaffold | ✅ Done |
| Sprint 1 | App shell · Market page with live CoinGecko data · dark mode | ✅ Done |
| Sprint 2 | Coin detail page · Chart.js price chart · 1D/7D/30D/90D toggle | ✅ Done |
| Sprint 3 | Watchlist CRUD · star buttons · live price enrichment | ✅ Done |
| Sprint 4 | Portfolio CRUD · live P&L calculations · add/edit dialog | ✅ Done |
| Sprint 5 | Price alerts · signal-driven alert checker | 	✅ Done |
| Sprint 6 | Dashboard · global stats · deploy | ⏳ Pending |

---

## What is CryptoTrack?

CryptoTrack is a full-stack cryptocurrency dashboard that lets users browse live market data, manage a personal watchlist, track a mock investment portfolio with real-time P&L calculations, and set price alerts — all powered by the CoinGecko free API with zero running cost.

Built as a senior-level Angular 21 portfolio project, it applies the same enterprise patterns used in large-scale fintech applications — NgRx with facade pattern, Angular Signals throughout (toSignal(), computed(), effect()), OnPush change detection, lazy-loaded routes, and a Node.js Express backend that acts as a caching proxy to protect free API rate limits. The backend is backed by Neon serverless PostgreSQL for all user CRUD operations — watchlist, portfolio holdings, and price alerts.

This project is directly inspired by real-world ETF order management and trading platform work (BlackRock LEO), reframed as an open-source portfolio showcase. Every architectural decision — from the NgRx facade to the cross-feature selectors to the 60-second cache TTL — has a real reason behind it that holds up in a technical interview.

## What the app does:


📊 Live market overview — top 50 coins by market cap, sortable columns, real-time search, auto-refresh every 60s
📈 Coin detail pages — Chart.js price history with 1D / 7D / 30D / 90D range toggle driven by Angular Signals
⭐ Watchlist — add/remove coins from any page, live prices enriched from NgRx market store without extra API calls
💼 Portfolio tracker — add holdings with buy price and date, live P&L per holding and overall summary
🔔 Price alerts — set above/below target alerts, signal-driven checker fires snackbar notification (Sprint 5)
🌙 Dark / light theme toggle across the full Angular Material UI


## What it demonstrates technically:


NgRx facade pattern — components never import from the store directly
Angular Signals — toSignal(), computed(), effect() replacing manual RxJS subscriptions throughout
Cross-feature NgRx selectors — portfolio P&L and watchlist prices enriched from market store, zero extra API calls
Node.js caching proxy — 60s TTL protects CoinGecko 30 req/min free tier across all polling components
Neon serverless PostgreSQL — cloud database, schema migrations, parameterised queries, SSL connection pooling
Reactive Forms with MatAutocomplete — coin search dialog with live filtering and buy price pre-fill
Optimistic UI — watchlist remove and portfolio delete update the UI instantly, API confirms in background
Chart.js direct integration — ViewChild canvas, chart.update() on signal change, chart.destroy() on teardown


Zero running cost — CoinGecko free public API (no key needed) + Neon free tier PostgreSQL.

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Angular 21 — standalone components, no NgModules |
| State management | NgRx 18 — Store, Effects, Selectors, Facade pattern |
| Reactive UI | Angular Signals · `toSignal()` · `computed()` · `effect()` |
| UI library | Angular Material 18 |
| Charts | Chart.js (direct — ViewChild canvas) |
| Forms | Reactive Forms with custom validators + MatAutocomplete |
| HTTP | Angular HttpClient |
| Routing | Lazy-loaded feature routes with `loadComponent()` |

### Backend
| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 |
| Database | Neon PostgreSQL (serverless) via `pg` connection pool |
| Caching | `node-cache` — 60s TTL, protects CoinGecko rate limits |
| External API | CoinGecko Public API v3 — free, no key required |

---

## Project Structure

cryptotrack/                         ← monorepo root
├── client/                          ← Angular 21 SPA
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   └── services/        ← market-api, watchlist-api, portfolio-api
│       │   ├── features/
│       │   │   ├── market/          ← live coin table, search, sort, star buttons
│       │   │   ├── coin-detail/     ← price chart, stats, ATH/ATL
│       │   │   ├── watchlist/       ← watchlist table with live prices
│       │   │   └── portfolio/       ← holdings table, P&L, add/edit dialog
│       │   ├── models/              ← Coin, CoinDetail, WatchlistItem, Holding
│       │   └── store/
│       │       ├── market/          ← actions, reducer, effects, selectors, facade
│       │       ├── watchlist/       ← actions, reducer, effects, selectors, facade
│       │       └── portfolio/       ← actions, reducer, effects, selectors, facade
│       └── styles/
│           └── styles.scss          ← Angular Material theme + dark mode
│
├── server/                          ← Node.js + Express
│   └── src/
│       ├── routes/                  ← market, watchlist, portfolio, alerts
│       ├── controllers/             ← request handlers
│       ├── services/
│       │   └── coingecko.service.js ← CoinGecko proxy + cache-first pattern
│       ├── db/
│       │   ├── database.js          ← Neon pg.Pool with SSL
│       │   ├── schema.sql           ← 3 tables: watchlist, portfolio, alerts
│       │   └── migrate.js           ← run once to create tables in Neon
│       ├── cache/
│       │   └── cacheService.js      ← node-cache wrapper (60s TTL)
│       └── middleware/
│           └── errorHandler.js      ← global Express error handler
│
├── SPRINT_NOTES.md                  ← Dev journal — decisions + interview prep
├── STORIES.md                       ← Task tracker
└── README.md
---

## Getting Started

### Prerequisites
- Node.js 20+
- Angular CLI 18+
- Neon account — [neon.tech](https://neon.tech) (free)

```bash
npm install -g @angular/cli
```

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cryptotrack.git
cd cryptotrack

# Install client deps
cd client && npm install && cd ..

# Install server deps
cd server && npm install && cd ..
```

### 2. Set up Neon PostgreSQL

```
1. Go to neon.tech → create free account
2. New Project → name: cryptotrack
3. Dashboard → Connect → copy the connection string
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
CACHE_DEFAULT_TTL=60
CORS_ORIGIN=http://localhost:4200
```

### 4. Create database tables

```bash
cd server
npm run db:migrate
# ✅ Tables created: watchlist, portfolio, alerts
```

### 5. Run both apps

```bash
# Terminal 1 — backend
cd server && npm run dev
# → http://localhost:3000

# Terminal 2 — frontend
cd client && ng serve
# → http://localhost:4200
```

---

## API Reference

**Base URL:** `http://localhost:3000/api`

### Market — CoinGecko proxy with caching

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/market/coins` | Top 50 coins by market cap | 60s |
| GET | `/market/coins/:id` | Full coin detail | 120s |
| GET | `/market/coins/:id/history` | Price history for chart | 5–30min |
| GET | `/market/trending` | Trending coins | 5min |
| GET | `/market/global` | Global market stats | 5min |

### Watchlist — Neon PostgreSQL CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/watchlist` | Get all watched coins |
| POST | `/watchlist` | Add coin `{ coin_id, coin_name, coin_symbol, coin_image }` |
| DELETE | `/watchlist/:coinId` | Remove coin from watchlist |

### Portfolio — Neon PostgreSQL CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolio` | Get all holdings |
| POST | `/portfolio` | Add holding `{ coin_id, quantity, buy_price, buy_date, ... }` |
| PUT | `/portfolio/:id` | Update holding `{ quantity, buy_price, buy_date }` |
| DELETE | `/portfolio/:id` | Delete holding |

### Alerts — Neon PostgreSQL CRUD *(Sprint 5)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alerts` | Get all price alerts |
| POST | `/alerts` | Create alert `{ coin_id, condition, target_price }` |
| PATCH | `/alerts/:id/trigger` | Mark alert as triggered |
| DELETE | `/alerts/:id` | Delete alert |

---

## Angular Architecture Highlights

### NgRx Facade Pattern
Components never import from the NgRx store directly. All state access goes through a typed facade service:

```typescript
// ✅ Component only knows about the facade
export class MarketComponent {
  private facade = inject(MarketFacade);
  coins = toSignal(this.facade.coins$, { initialValue: [] });
}

// ✅ Facade owns all store interactions
export class MarketFacade {
  coins$ = this.store.select(selectFilteredCoins);
  loadCoins() { this.store.dispatch(MarketActions.loadCoins()); }
}
```

### Signals at the Component Boundary
```typescript
coins = toSignal(this.facade.coins$, { initialValue: [] });
search = signal('');

// Derived state — auto-updates, no subscription
filteredCoins = computed(() => {
  const q = this.search().toLowerCase();
  return this.coins().filter(c => c.name.toLowerCase().includes(q));
});

// Side effect tied to signal — re-fetches when days changes
private chartEffect = effect(() => {
  const days = this.selectedDays(); // tracked signal
  this.facade.loadPriceHistory(this.coinId, days);
});
```

### Cross-Feature Selectors
Portfolio and Watchlist pages show live prices without extra API calls:

```typescript
export const selectEnrichedHoldings = createSelector(
  selectHoldings,  // portfolio slice
  selectCoins,     // market slice
  (holdings, coins) => holdings.map(h => {
    const live = coins.find(c => c.id === h.coin_id);
    const pnl = (h.quantity * live?.current_price) - (h.quantity * h.buy_price);
    return { ...h, pnl };
  })
);
```

### Node.js Cache Layer
```
Without cache: 10 components × 60s polling = 10 req/min → hits CoinGecko limit
With cache:    10 components × 60s polling = 1 req/min  → always within limit
```

---

## Database Schema

```sql
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL UNIQUE,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  coin_image TEXT,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portfolio (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  coin_image TEXT,
  quantity DECIMAL(20,8) NOT NULL,
  buy_price DECIMAL(20,8) NOT NULL,
  buy_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  coin_id VARCHAR(100) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('above', 'below')),
  target_price DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  triggered_at TIMESTAMP
);
```

---

## Key Talking Points

| Topic | Talking Point |
|-------|--------------|
| NgRx facade | Components never import from the store — if I refactor NgRx internals, zero component code changes |
| Signals | `toSignal()` at component boundary, `computed()` for derived state, `effect()` for side effects — no manual subscriptions |
| Cross-feature selectors | Portfolio shows live prices by joining portfolio + market store slices in one memoized selector — no extra API call |
| Performance | `Set<string>` for watchlist IDs gives O(1) star lookup vs O(n) array.find() across 50 table rows |
| Caching | 60s TTL in Node.js means all Angular components share one upstream CoinGecko call per minute |
| Chart.js | Direct Chart.js via ViewChild — `chart.update()` on signal change, `chart.destroy()` in ngOnDestroy prevents memory leaks |
| Optimistic UI | Watchlist remove and portfolio delete are optimistic — UI updates instantly, API fires in background |
| PostgreSQL | `ON CONFLICT DO NOTHING` prevents duplicate watchlist entries at the DB level — defense in depth |

---

## Scripts

| Command | Location | What it does |
|---------|----------|-------------|
| `npm run dev` | root | Runs client + server concurrently |
| `npm run dev` | server/ | Express + nodemon on :3000 |
| `ng serve` | client/ | Angular dev server on :4200 |
| `npm run db:migrate` | server/ | Creates 3 tables in Neon |
| `ng build` | client/ | Production build to dist/ |

---
💡 Project Goal
This project demonstrates:

Full-stack development (React + Node.js)
API integration
CRUD operations
AI integration in real-world applications
📌 Status
🚧 Live Demo - coming soon

📸 Screenshots

## License

Home page - Market overview - light mode
![alt text](image-1.png)

Home page - dark mode
![alt text](image-2.png)


Market  detail - clickk on each row
![alt text](image-3.png)

Starred Coins in watchlist
![alt text](image-4.png)

Add holding
![alt text](image-5.png)

![alt text](image-6.png)

![alt text](image-7.png)

MIT © Anupa Kuriakose