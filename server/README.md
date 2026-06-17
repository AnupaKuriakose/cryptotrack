Request from Angular
      ↓
  routes/        ← "what URL handles what"
      ↓
  controllers/   ← "receive request, send response"
      ↓
  services/      ← "do the actual work" (call CoinGecko, query DB)
      ↓
  db/            ← "talk to Neon PostgreSQL"



CryptoTrack — Server Architecture Guide
=================================================

Node.js + Express backend. Read this before touching any server file.




How a request flows through the server
========================================
Angular (localhost:4200)
        │
        │  HTTP request
        ▼
Express Server (localhost:3000)
        │
        ▼
   [ middleware ]        ← runs on EVERY request (cors, json parser)
        │
        ▼
   [ routes/ ]           ← decides WHICH controller handles this URL
        │
        ▼
   [ controllers/ ]      ← receives req, calls service, sends res
        │
        ▼
   [ services/ ]         ← does the actual work (CoinGecko or DB)
        │
        ├──→ [ cache/ ]  ← check cache first before calling CoinGecko
        │
        └──→ [ db/ ]     ← query Neon PostgreSQL for CRUD data


Folder by folder
==========================================

📁 routes/
------------
What it is: The front door. Maps URLs to controller functions.

Think of it as: A receptionist — "GET /api/market/coins? I'll send you to the market controller."

Files:

market.routes.js      → all /api/market/* URLs
watchlist.routes.js   → all /api/watchlist/* URLs
portfolio.routes.js   → all /api/portfolio/* URLs
alerts.routes.js      → all /api/alerts/* URLs

Example:

js// market.routes.js
router.get('/coins', controller.getCoins);
// When Angular calls GET /api/market/coins
// → routes sends it to market.controller.getCoins()

Rule: Routes contain NO logic. Just URL → function mapping.


📁 controllers/
=================
What it is: Request handlers. Receives the HTTP request, calls the right service, sends the response back.

Think of it as: A manager — takes the order from routes, tells services what to do, hands result back to Angular.

Files:

market.controller.js      → handles market requests (read-only, CoinGecko)
watchlist.controller.js   → handles watchlist CRUD
portfolio.controller.js   → handles portfolio CRUD
alerts.controller.js      → handles alerts CRUD

Example:

js// market.controller.js
exports.getCoins = async (req, res, next) => {
  try {
    const data = await coingeckoService.getMarketCoins(); // calls service
    res.json(data);                                        // sends to Angular
  } catch (err) {
    next(err);                                             // passes to errorHandler
  }
};

Rule: Controllers contain NO business logic. Just: get request → call service → send response.


📁 services/
=====================

What it is: Where the actual work happens. Two types of services in this app:

Type 1 — coingecko.service.js (external API)


Calls CoinGecko free API
Checks cache first — if data is fresh, returns cached version
If cache miss, calls CoinGecko, stores result in cache, returns it
Protects the 30 requests/min free tier rate limit


Type 2 — watchlist/portfolio/alerts services (database)


Runs SQL queries against your Neon PostgreSQL database
All the INSERT, SELECT, UPDATE, DELETE logic lives here
Returns plain JS objects to the controller


Example:

js// coingecko.service.js
async function getMarketCoins() {
  const cached = cache.get('market_coins');       // check cache first
  if (cached) return cached;                       // return if fresh

  const { data } = await axios.get(COINGECKO_URL); // call CoinGecko
  cache.set('market_coins', data, 60);              // store 60s
  return data;
}

Rule: Services contain all business logic. Controllers never call axios or pg directly.


📁 db/
========================
What it is: Everything related to your Neon PostgreSQL database.

Files:

database.js — Creates the connection pool to Neon.
-------------
A "pool" means Express keeps a set of open connections ready so every request doesn't have to reconnect from scratch. You import { query } from this file anywhere you need to run SQL.

js// How you use it in a service:
const { query } = require('../db/database');
const result = await query('SELECT * FROM watchlist');

schema.sql — The SQL that creates your 3 tables (watchlist, portfolio, alerts). You only run this once via npm run db:migrate.

migrate.js — A script that reads schema.sql and runs it against Neon. Run once to set up tables:
--------------
bashnpm run db:migrate

Tables created:

watchlist   → stores coins you're watching
portfolio   → stores your holdings (coin + quantity + buy price)
alerts      → stores price alerts (coin + above/below + target price)


📁 middleware/
-----------------------
What it is: Functions that run on every request, before it reaches the controller. Like a checkpoint.

Files:

errorHandler.js — Global error catcher. If any controller does next(err), this catches it and sends a clean JSON error response to Angular instead of crashing the server.

js// Without errorHandler:
// Unhandled error → server crashes 💥

// With errorHandler:
// Unhandled error → { "error": "Something went wrong" } → Angular shows snackbar

Think of it as a safety net at the bottom of every request.


📁 cache/
--------------------
What it is: In-memory cache using node-cache. Stores CoinGecko API responses temporarily so you don't hammer the free tier.

cacheService.js — Thin wrapper around node-cache with get, set, del methods.

Why it matters:

Without cache:
  Angular polls every 60s
  → 10 components × 60s = 10 requests/min to CoinGecko
  → Hits 30 req/min limit fast → CoinGecko returns 429 error

With cache:
  First request → calls CoinGecko, stores for 60s
  Next 9 requests → returns cached data instantly
  → Only 1 real CoinGecko call per minute
  → Never hits rate limit


📄 server.js (root)

Entry point. Just starts the Express server on port 3000. Loads .env first so all environment variables are available.

📄 src/app.js

Express app setup. Wires together:


CORS (allows Angular on :4200 to call Express on :3000)
JSON body parser (reads JSON from Angular POST requests)
All 4 route files
Error handler (must be last)



Key rules to remember
-----------------------
Rule                                                                                Why
-------------------------------------------------------------------------------------------
Routes have no logic                                                Keep routing and logic separate
Controllers don't call axios or pg                                  That's services' job
Services don't touch req/res                                        That's controllers' job
All DB queries go through db/database.js                            Single connection pool
All CoinGecko calls go through cache                                Never exceed rate limit
.env is never committed to git                                      Contains your Neon password


How CRUD works in this app

OperationCoinGeckoPostgreSQL (Neon)Read market prices✅ GET❌ not storedRead watchlist❌✅ SELECTAdd to watchlist❌✅ INSERTRemove from watchlist❌✅ DELETEAdd portfolio holding❌✅ INSERTUpdate holding❌✅ UPDATEDelete holding❌✅ DELETECreate price alert❌✅ INSERTTrigger alert❌✅ UPDATE

CoinGecko = read-only live market data
Your Neon DB = everything the user owns/creates


Running the server

bash# Install dependencies (first time only)
npm install

# Create tables in Neon (first time only)
npm run db:migrate

# Start development server with auto-reload
npm run dev

# Test it's working
# Open browser: http://localhost:3000/api/health
# Should return: { "status": "ok" }