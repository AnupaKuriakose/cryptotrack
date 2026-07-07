const express = require('express');
const router = express.Router();
const controller = require('../controllers/watchlist.controller');

router.get('/',controller.getAll);
router.post('/',controller.addCoin);
router.delete('/:coinId',controller.removeCoin);

module.exports =  router;