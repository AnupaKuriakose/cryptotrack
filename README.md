CryptoTrack 📈

Full-stack cryptocurrency portfolio and market dashboard
Angular 18 · NgRx · Signals · Angular Material · Node.js · Express · PostgreSQL · CoinGecko Free API


🚦 Build Progress
Sprint 0     Repo setup, project scaffold, PostgreSQL✅ Done
Sprint 1     Shell layout + Market page (live CoinGecko data)🔄 In progress
Sprint 2    Coin detail page + price chart⏳ Pending
Sprint 3    Watchlist CRUD (Angular + Express + PostgreSQL)⏳ Pending
Sprint 4    Portfolio CRUD + P&L calculations⏳ Pending
Sprint 5    Price alerts + signal-driven alert checker⏳ Pending
Sprint 6    Dashboard + charts + polish⏳ Pending

What is CryptoTrack?

A senior-level Angular portfolio project. Browse live crypto market data, manage a personal watchlist, track a mock portfolio with P&L calculations, and set price alerts — all with Angular Material UI, NgRx state management, Angular Signals, and a Node.js/Express backend backed by PostgreSQL.
Zero running cost — uses CoinGecko's free public API (no key needed).

Tech Stack
-------------------------

Layer                                      Technology
----------------------------------------------------------------
Frontend           Angular 18 (standalone components)State              NgRx 18 — Store, Effects, Selectors,Facade pattern
Reactive UI        Angular Signals·computed() · effect()· toSignal()
UI library         Angular Material 18
Charts              ng2-charts (Chart.js)
Forms               Reactive Forms with custom validators
HTTP                Angular HttpClient + interceptors
Backend          Node.js 20 + Express 4
Database            PostgreSQL 16 via pg (node-postgres)
Caching             node-cache (60s TTL — CoinGecko rate limit protection)
External API        CoinGecko Public API v3 — free, no key required

Repository Structure
------------------------------
cryptotrack/                    ← monorepo root
├── client/                     ← Angular 18 SPA
│   └── src/app/
│       ├── core/               ← interceptors, guards, singleton services
│       ├── shared/             ← reusable dumb components, pipes
│       ├── features/           ← dashboard, market, watchlist, portfolio, alerts
│       └── store/              ← NgRx actions, reducers, effects, selectors, facades
├── server/                     ← Node.js + Express
│   └── src/
│       ├── routes/             ← Express route definitions
│       ├── controllers/        ← Request handlers
│       ├── services/           ← CoinGecko proxy + node-cache
│       ├── db/                 ← PostgreSQL pool + schema
│       └── middleware/         ← Error handler, validators
├── package.json                ← Root scripts (concurrently)
└── README.md

PostgreSQL-> use neon(Neon is fully managed serverless PostgreSQL — same SQL you already know, just hosted in the cloud. No connection pooling config, no SSL certificates, no pg_hba.conf — it handles everything)

Features
Feature                       Description
Market overview               Live top 50 coins, sort/filter/paginate,auto-refresh 60s
Coin detail                   Price chart (1D/7D/30D/90D), stats, ATH/ATL
Watchlist                      Add/remove coins, live prices, undo snackbar⏳
Portfolio                   Holdings with live P&L, donut chart⏳
Price alerts            Above/below alerts, snackbar when triggered⏳
Dashboard               Summary cards, top movers, global stats

API Endpoints
----------------
Base: http://localhost:3000/api

Market (CoinGecko proxy + cached)
GET  /market/coins              Top 50 coins (60s cache)
GET  /market/coins/:id          Coin detail (120s cache)
GET  /market/coins/:id/history  Price history for chart
GET  /market/trending           Trending coins (5m cache)
GET  /market/global             Global stats (5m cache)

Watchlist (PostgreSQL CRUD)
GET    /watchlist               Get all watched coins
POST   /watchlist               Add coin to watchlist
DELETE /watchlist/:coinId       Remove from watchlist

Portfolio (PostgreSQL CRUD)
GET    /portfolio               Get all holdings
POST   /portfolio               Add holding
PUT    /portfolio/:id           Update holding
DELETE /portfolio/:id           Delete holding

Alerts (PostgreSQL CRUD)
GET    /alerts                  Get all alerts
POST   /alerts                  Create alert
PATCH  /alerts/:id/trigger      Mark as triggered
DELETE /alerts/:id              Delete alert

Architecture Highlights
------------------------
NgRx facade pattern — components never touch the store directly
Signals for UI state — toSignal() at component boundary, computed() for derived state, effect() for polling lifecycle
Smart/dumb component split — feature components dispatch; presentational components receive @Input() only
OnPush change detection throughout
Node.js caching layer — 60s TTL protects CoinGecko rate limits (30 req/min free tier)
Standalone components — no NgModules, inject() DI, @defer for charts
