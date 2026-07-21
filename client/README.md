# Client

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

jul 1 - App shell (toolbar + sidenav) + Market page = live coin table with real CoinGecko prices

Sprint 1: 
-Node.js + Express server — routes, controllers, services, middleware, cache layer all wired up
-
Neon PostgreSQL connected — 3 tables created (watchlist, portfolio, alerts) on cloud DB
-
CoinGecko proxy + cache — Express caches responses 60s, protects free tier rate limit
-Angular 18 app shell — toolbar, sidenav, routing, dark/light theme toggle
-
NgRx store — actions, reducer, effects, selectors, facade pattern for market data
-📈
Live Market page — real CoinGecko prices, search, dark mode, abbreviated numbers, auto-refresh
Signals — toSignal() used throughout MarketComponent with OnPush change detection

Sprint 2 — Coin Detail Page
-------------------------
Click coin row → navigate to /coins/:id
Price chart (1D / 7D / 30D / 90D) using ng2-charts
Coin stats — ATH, ATL, supply, market cap cards
MatButtonToggle for chart range — signal-driven
"+ Watchlist" and "+ Portfolio" buttons (wired in Sprint 3+4)

Sprint 3 — Watchlist CRUD-
-----------------------
Express: GET / POST / DELETE /api/watchlist routes
NgRx watchlist store — actions, effects, facade
Watchlist page — table with live prices enriched from market store
Remove with MatSnackBar UNDO (5s window)
Express API (GET/POST/DELETE) → NgRx watchlist store → Watchlist page
+ Wire the ⭐ star button on market table and coin detail page

Sprint 4 — Portfolio CRUD + P&L
------------
Express: GET / POST / PUT / DELETE /api/portfolio
Add holding dialog — coin autocomplete, qty, buy price, date
Live P&L per holding — computed() from signals
Summary cards — invested / current value / total P&L
Portfolio donut chart with @defer

Sprint 5 — Price Alerts
----------------------
Express: GET / POST / PATCH / DELETE /api/alerts
Create alert dialog — coin, above/below, target price
Signal effect() checks alerts vs live prices every refresh
MatSnackBar fires when alert triggers

Express CRUD → NgRx alerts store → Alerts page
+ signal-driven effect() checks alerts vs live prices every 60s
+ MatSnackBar fires when alert triggers

Sprint 6 — Dashboard + Polish
--------------------------------
Dashboard home — summary cards, top movers, global stats
Portfolio donut chart on dashboard
HTTP interceptor — global error handling
Responsive layout — mobile sidenav
Deploy — Vercel (client) + Render (server)