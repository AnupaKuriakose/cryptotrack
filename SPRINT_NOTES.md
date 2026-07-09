# CryptoTrack — Sprint Notes
> Dev journal — what was built, why each decision was made, interview talking points per sprint.
> Keep this updated after each sprint. Great for interview prep.

---

## Sprint 0 — Repo Setup & Project Scaffold
**Date completed:** Day 1  
**Time taken:** ~2 hours

### What we built
- Monorepo structure — single git repo with `client/` (Angular) and `server/` (Node.js) separated
- Root `package.json` with `concurrently` to run both apps with one command
- Express server scaffolded — `server.js`, `app.js`, all route/controller/service stubs
- Neon PostgreSQL connected — created `cryptotrack` project on neon.tech
- 3 database tables created via migration script: `watchlist`, `portfolio`, `alerts`
- `.env` setup with Neon connection string
- `.gitignore` configured — `.env` never committed

### Key files created
```
server/
├── server.js                 ← entry point, loads .env, starts Express
├── src/app.js                ← wires CORS, JSON parser, routes, error handler
├── src/db/database.js        ← pg.Pool connected to Neon with SSL
├── src/db/schema.sql         ← 3 CREATE TABLE statements
├── src/db/migrate.js         ← reads schema.sql, runs against Neon once
├── src/cache/cacheService.js ← node-cache wrapper (get/set/del)
├── src/middleware/errorHandler.js
├── src/services/coingecko.service.js ← all CoinGecko calls + cache-first pattern
├── src/routes/market.routes.js
└── src/controllers/market.controller.js
```

### Decisions made
| Decision | Why |
|----------|-----|
| Neon instead of local PostgreSQL | Cloud DB = no local install, shareable, resume value |
| node-cache over Redis | Simpler setup, sufficient for free tier rate limits |
| Monorepo | One git repo = one push, easier to manage for portfolio |
| dotenv in server.js first line | Must load before any other require() to ensure env vars available |
| .env in server/ not server/src/ | dotenv looks in current working directory = where npm run is executed from |

### Problems solved
- `.env` was accidentally placed in `server/src/` instead of `server/` — dotenv couldn't find it
- `server/.git` nested folder caused git add to fail — removed it so root `.git` controls everything
- Schema had syntax error near `quantity` — fixed by rewriting schema.sql cleanly

### Interview talking points
- *"I used Neon serverless PostgreSQL — it scales to zero on the free tier which keeps costs at zero, and the connection string drops straight into the pg Pool with SSL."*
- *"The migration script reads schema.sql and runs it against Neon once — same pattern as production database migrations."*
- *"node-cache with 60s TTL means all Angular components share one upstream CoinGecko call per minute regardless of how many are polling simultaneously."*

---

## Sprint 1 — App Shell + Market Page
**Date completed:** Day 1–2  
**Time taken:** ~3 hours

### What we built
- Angular 18 app with standalone components (no NgModules)
- App shell — MatToolbar, MatSidenav, RouterOutlet
- Dark/light theme toggle using Angular signal + CSS class on body
- NgRx market store — full actions/reducer/effects/selectors/facade
- Market page with live CoinGecko coin prices
- Search with signal-based filtering
- 60-second auto-polling via setInterval
- Abbreviated market cap ($1.2T instead of $1,208,365,948,529)
- Green/red price change pills with arrow icons
- OnPush change detection throughout

### Key files created
```
client/src/
├── app/app.ts                         ← shell: toolbar + sidenav + theme toggle
├── app/app.config.ts                  ← provideStore, provideEffects, provideRouter
├── app/app.routes.ts                  ← lazy-loaded routes
├── app/models/coin.model.ts           ← Coin interface
├── app/core/services/market-api.service.ts  ← HttpClient calls to Express
├── app/store/market/market.actions.ts ← createActionGroup
├── app/store/market/market.reducer.ts ← createFeature
├── app/store/market/market.effects.ts ← loadCoins$ with switchMap
├── app/store/market/market.selectors.ts ← selectFilteredCoins (computed selector)
├── app/store/market/market.facade.ts  ← only thing components touch
└── app/features/market/market.component.ts ← smart component, OnPush, signals
```

### Angular 18 features used
| Feature | Where used | Why |
|---------|-----------|-----|
| `toSignal()` | MarketComponent | Converts NgRx observable to signal at component boundary |
| `computed()` | market.selectors.ts | selectFilteredCoins derives from coins + search |
| `signal()` | AppComponent | isDark signal drives theme toggle |
| Standalone components | All components | No NgModules — modern Angular pattern |
| `inject()` | All services/components | Function-based DI instead of constructor |
| `@if` / `@for` | Templates | New Angular 17+ control flow syntax |
| OnPush | MarketComponent | Only rerenders when signal values change |
| Lazy routes | app.routes.ts | `loadComponent()` — market page is a separate JS chunk |

### NgRx patterns used
| Pattern | Where | Why |
|---------|-------|-----|
| `createActionGroup` | market.actions.ts | Groups related actions, reduces boilerplate |
| `createFeature` | market.reducer.ts | Auto-generates all selectors — no manual createSelector for basic fields |
| `switchMap` in effects | market.effects.ts | Cancels previous request if action fires again rapidly |
| Facade pattern | market.facade.ts | Components never import Store or actions directly |

### Problems solved
- `NG0908 Zone.js` error — Angular 18 standalone needs `zone.js` installed explicitly: `npm install zone.js`
- `polyfills` missing from `angular.json` — added `"zone.js"` to polyfills array
- Dark mode needed `DOCUMENT` injection to add class to `document.body`

### Interview talking points
- *"I used NgRx's createFeature which auto-generates all feature selectors — significantly reduces boilerplate compared to manually writing createSelector for every field."*
- *"The facade pattern means my market component has zero NgRx imports — it only knows about MarketFacade. If I refactor the store internals, no component code changes."*
- *"toSignal() at the component boundary converts my store observables to signals, which works perfectly with OnPush — Angular only checks the component when a signal value actually changes."*
- *"The market table auto-refreshes every 60 seconds. Combined with the Node.js cache layer, this results in exactly one CoinGecko API call per minute regardless of how many users are viewing."*
- *"I implemented dark/light theme toggle using an Angular signal — when the signal flips, an effect adds/removes a CSS class on document.body, which switches the entire Angular Material theme."*

market table firelds
---------------------
# Rank
market_cap_rank

The coin's position ranked by market cap — largest market cap = rank 1. Bitcoin is always #1, Ethereum #2. This rank changes daily as market caps fluctuate.
Bitcoin = #1 · Ethereum = #2 · Solana = #7
💼 "Rank is driven by market_cap, not price — a $1 coin with 1 trillion supply outranks a $60,000 coin with 19 million supply if its total market cap is larger."

# Coin
name · symbol · image
CoinGecko
Three fields combined into one cell — the coin's full name, ticker symbol, and logo image. The id field (e.g. "bitcoin") is what we use internally to fetch detail pages and store in PostgreSQL.
name: "Bitcoin" · symbol: "btc" · id: "bitcoin" · image: URL to logo PNG
💼 "We store coin_id (e.g. 'bitcoin') in PostgreSQL for watchlist and portfolio — not the name — because CoinGecko's API uses id as the primary identifier for all subsequent calls."


# Price
current_price
Live · 60s cache
Current market price in USD. This is the last traded price aggregated across major exchanges (Binance, Coinbase, Kraken etc). CoinGecko averages across exchanges weighted by volume. Refreshes every 60 seconds in our app.
Bitcoin: $60,271.00 · Ethereum: $1,615.83 · Shiba Inu: $0.00000821
💼 "current_price is cached for 60s in our Node.js layer. Without caching, 10 Angular components polling simultaneously would exhaust CoinGecko's 30 req/min free limit within seconds."

# 24h %
price_change_percentage_24h
Live · 60s cache
Percentage price change over the last 24 hours. Positive = price went up, negative = price went down. We show this as a green pill (+) or red pill (-). Calculated as: ((current - price_24h_ago) / price_24h_ago) × 100
+2.96% = price is 2.96% higher than it was exactly 24 hours ago · -2.47% = price dropped 2.47%
💼 "We use this field to drive the green/red pill styling — a computed selector in NgRx could also derive top gainers and losers lists from this same field without any extra API call."

# Market Cap
market_cap
Abbreviated
Total market value of all coins in circulation. Formula: current_price × circulating_supply. This is the most important number for ranking coins — not price. A coin worth $1 can have a higher market cap than Bitcoin if it has enough supply.
Bitcoin: $1.2T (price $60k × 19.7M coins) · A meme coin: $500M (price $0.001 × 500B coins)
💼 "We format market_cap with our formatLargeNumber() helper — $1,208,365,948,529 becomes $1.21T. Raw numbers would overflow the table cell and be unreadable."

# Volume 24h
total_volume
CoinGecko
Total USD value of all trades made in the last 24 hours across all exchanges. High volume = lots of trading activity = liquid market (easy to buy/sell). Low volume = illiquid = price can move wildly on small trades. Important signal for traders.
Bitcoin: $28B traded in last 24h · A small altcoin: $2M — much less liquid
💼 "Volume is a liquidity signal — not stored in our DB, always live from CoinGecko. In a real trading app, you'd alert users if a watched coin's volume spikes suddenly — that often precedes a price move."
---

## Sprint 2 — Coin Detail Page + Price Chart
**Date completed:** Day 2–3  
**Time taken:** ~2.5 hours

### What we built
- Coin detail page at `/coins/:id` — navigated to by clicking any market table row
- Price chart using ng2-charts (Chart.js) — line chart with fill
- Chart range toggle: 1D / 7D / 30D / 90D via MatButtonToggle
- 8 stat cards: market cap, volume, 24h high/low, ATH, ATL, supply
- Loading spinner while coin detail fetches
- Separate loading state for chart (historyLoading) vs coin data (detailLoading)
- `effect()` drives chart re-fetch when selectedDays signal changes
- `computed()` derives chart labels + dataset from priceHistory signal

### Key files created/updated
```
client/src/
├── app/app.routes.ts                   ← added /coins/:id lazy route
├── app/models/coin.model.ts            ← added CoinDetail, PricePoint interfaces
├── app/core/services/market-api.service.ts ← added getCoinDetail(), getPriceHistory()
├── app/store/market/market.actions.ts  ← added 6 new actions (detail + history)
├── app/store/market/market.reducer.ts  ← added selectedCoin, priceHistory, 2 loading flags
├── app/store/market/market.effects.ts  ← added 2 new effects
├── app/store/market/market.selectors.ts ← added 4 new selectors
├── app/store/market/market.facade.ts   ← added 4 observables + 2 dispatch methods
├── app/features/market/market.component.ts ← added row click → router.navigate
└── app/features/coin-detail/coin-detail.component.ts ← new page
```

### Angular Signals used in coin detail
| Signal | Type | Purpose |
|--------|------|---------|
| `coin` | `toSignal()` | Live coin data from store |
| `priceHistory` | `toSignal()` | Raw price points from store |
| `detailLoading` | `toSignal()` | Shows spinner while coin loads |
| `historyLoading` | `toSignal()` | Shows chart spinner independently |
| `selectedDays` | `signal(7)` | Local UI state — which chart range is selected |
| `chartData` | `computed()` | Derives Chart.js data from priceHistory signal — auto-updates |

### Key architectural decision — effect() for chart re-fetch
```typescript
// When user changes days toggle → effect fires → dispatches new history load
private daysEffect = effect(() => {
  const days = this.selectedDays();          // tracked signal
  const coinId = this.route.snapshot.paramMap.get('id');
  if (coinId) this.facade.loadPriceHistory(coinId, days);
});
```
This is a clean signal-driven side effect — no manual subscription, no ngOnChanges, no Subject.

### Key architectural decision — computed() for chart data
```typescript
// chartData automatically recalculates when priceHistory signal changes
chartData = computed(() => {
  const history = this.priceHistory();
  return {
    labels: history.map(p => new Date(p.timestamp).toLocaleDateString()),
    datasets: [{ data: history.map(p => p.price), ... }]
  };
});
```
Zero manual subscription. When NgRx effect completes and updates store → priceHistory signal updates → chartData recomputes → chart rerenders. Fully reactive, zero imperative code.

### Problems solved
- ng2-charts requires Chart.js controllers registered manually when not using defaults
- Separate `detailLoading` and `historyLoading` flags needed — without them, the whole page would show a spinner when just the chart range changes

### Interview talking points
- *"The coin detail page uses computed() to derive Chart.js dataset from the priceHistory signal. When the NgRx effect updates the store, the signal updates, computed() recalculates, and the chart rerenders — no manual subscription anywhere."*
- *"I used effect() to watch the selectedDays signal. When the user clicks a different chart range, the effect fires automatically and dispatches a new loadPriceHistory action. Clean reactive pattern with zero imperative subscription code."*
- *"I have separate loading flags for coin detail and price history — detailLoading and historyLoading. This means when the user changes chart range, only the chart shows a spinner, not the entire page."*
- *"switchMap in the loadPriceHistory$ effect means if a user clicks 1D → 7D → 30D quickly, the first two HTTP requests are cancelled. Only the last one completes. No race conditions."*
- *"The chart data transformation — mapping CoinGecko's raw [timestamp, price] array to PricePoint objects — happens in the service layer via RxJS map(), not in the component. Components stay clean."*

---

## Upcoming Sprints

### Sprint 3 — Watchlist CRUD
- Express: GET / POST / DELETE /api/watchlist
- NgRx watchlist store (separate feature slice)
- Watchlist page — live prices enriched from market store
- MatSnackBar with UNDO on remove
- First real PostgreSQL CRUD from Angular

Server (2 files):

watchlist.controller.js — 3 functions: getAll, addCoin, removeCoin using raw SQL with pg
watchlist.routes.js — GET / POST / DELETE wired up

Angular (10 files created, 5 updated):
Layer           What changed   
Model          WatchlistItem interface with optional enriched price fields
API Service     WatchlistApiService — 3 HTTP methods
NgRx Store    Full slice — actions, reducer, effects, selectors,facade
Feature page  WatchlistComponent — table + empty state
Market pageStar toggle + watchlistIds signalCoin detailStar button wired to same facadeApp shellWatchlist sidenav link + route added

### Sprint 4 — Portfolio CRUD + P&L
What we're building:
Express CRUD → NgRx portfolio store → Portfolio page
+ Add/Edit holding dialog → Live P&L calculations via computed()

- Express: full CRUD /api/portfolio
- Add holding dialog — MatDialog + Reactive Form + MatAutocomplete
- computed() signal for live P&L per holding
- Portfolio summary cards
- @defer for donut chart

### Sprint 5 — Price Alerts
- Express: GET / POST / PATCH / DELETE /api/alerts
- effect() in AlertsComponent checks alerts vs live coin prices
- MatSnackBar notification when alert triggers

### Sprint 6 — Dashboard + Polish + Deploy
- Dashboard home — summary cards from all stores
- HTTP error interceptor
- Responsive mobile layout
- Deploy: Vercel (client) + Render (server)
- Update README with live demo URL

---

*Last updated: Sprint 2 complete*