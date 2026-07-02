const express = require('express');
const router = express.Router();
const controller = require('../controllers/market.controller'); 
//express.Router() creates a mini Express app — a self-contained set of routes. This router gets mounted at /api/market in app.js, so all paths here are relative to that prefix.
router.get('/coins', controller.getCoins);
router.get('/coins/:id/history', controller.getPriceHistory);
router.get('/coins/:id', controller.getCoinDetail);
//Order matters here. /coins/:id/history must come before /coins/:id. If it were the other way around,
//  a request to /coins/bitcoin/history would match /coins/:id first with id = 'bitcoin/history' — wrong. 
// More specific routes always go before general ones.
router.get('/trending', controller.getTrending);
router.get('/global', controller.getGlobal);

module.exports = router;