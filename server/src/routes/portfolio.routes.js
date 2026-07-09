const express = require('express');
const router = express.Router();
const controller = require('../controllers/portfolio.controller');

router.get('/', controller.getAll);
router.post('/', controller.addHolding);
router.put('/:id', controller.updateHolding);
router.delete('/:id', controller.deleteHolding);

module.exports = router;