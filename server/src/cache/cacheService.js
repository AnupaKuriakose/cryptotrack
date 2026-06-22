const NodeCache = require('node-cache');
//node-cache is a simple in-memory key-value store. Think of it like a JavaScript object that automatically deletes keys after a time limit. Lives in server memory — resets when you restart the server.

const cache = new NodeCache({
  stdTTL: process.env.CACHE_DEFAULT_TTL || 60,
  checkperiod: 120,
});
//stdTTL = standard Time To Live in seconds. Every cached item expires after 60 seconds by default. checkperiod: 120 = every 120 seconds, node-cache sweeps through and deletes expired items to free memory.

module.exports = {
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  del: (key) => cache.del(key),
  stats: () => cache.getStats(),
};
//Thin wrapper — exposes only 4 methods. Services import this and call cache.get('market_coins') instead of the raw node-cache API. If you ever swap node-cache for Redis later, you only change this one file — nothing else needs updating.

// Request 1 (0s):    cache.get('market_coins') → undefined (miss)
//                    → calls CoinGecko API
//                    → cache.set('market_coins', data, 60)
//                    → returns data

// Requests 2–60 (within 60s): cache.get('market_coins') → data (hit)
//                    → returns instantly, no CoinGecko call

// Request at 61s:    cache.get('market_coins') → undefined (expired)
//                    → calls CoinGecko again, cycle repeats