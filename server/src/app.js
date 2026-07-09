// Express setup

const express = require('express'); //use import if it is es modules
const cors = require('cors');
//Import Express and the CORS package. Express is the framework.
//  CORS (Cross-Origin Resource Sharing) is a browser security rule — by default browsers block JavaScript
//  on localhost:4200 from calling an API on localhost:3000 because they're different ports (different "origins").
//  The cors package tells Express to allow it.

const marketRoutes = require('./routes/market.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const alertRoutes = require('./routes/alerts.routes');
const errorHandler = require('./middleware/errorHandler');
//Import all 4 route files and the error handler. 
// We're just loading the definitions here — they don't do anything yet until we attach them to the app below.

const app = express();
//Creates the Express application. This is the object that everything else attaches to. Think of it as the server instance.
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' }));
//Registers CORS middleware. app.use() means "run this on every single request before anything else." 
// The origin option says "only allow requests from Angular's dev server at :4200." Any other origin gets blocked.
//  In production you'd change this to your deployed Angular URL.

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; connect-src 'self' http://localhost:* ws://localhost:*;"
  );
  next();
});

app.use(express.json());
//Tells Express to automatically parse JSON request bodies.
//  Without this, when Angular sends a POST request with { coinId: 'bitcoin' } in the body,
//  req.body would be undefined. With this, req.body.coinId works. 
// Must come before routes so the body is parsed before controllers try to read it.

app.use('/api/market', marketRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioRoutes);
// app.use('/api/alerts', alertRoutes);
// Mounts each route file at its prefix. This means:

// Any request starting with /api/market → handled by market.routes.js
// Any request starting with /api/watchlist → handled by watchlist.routes.js

// So when Angular calls GET /api/market/coins, Express sees /api/market → hands it to marketRoutes → which looks for /coins → finds the handler.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
//A simple health check endpoint directly in app.js — no route file needed since it's one line. You hit http://localhost:3000/api/health to confirm the server is alive. Useful for debugging and later for deployment health checks
app.use(errorHandler);
//Registers the error handler last — this is critical.
//  Express identifies error-handling middleware by the fact that it has 4 parameters (err, req, res, next).

//  It only runs when a controller calls next(err). If it were registered before the routes, it would never see errors from those routes.
module.exports = app;
//Exports the configured app so server.js can import it and call .listen(). 
// The app itself doesn't know what port it runs on — that's server.js's job.