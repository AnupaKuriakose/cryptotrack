const express = require('express');
const router = express.Router();
const controller = require('../controllers/alerts.controller');

router.get('/', controller.getAll);
router.post('/', controller.createAlert);
router.patch('/:id/trigger', controller.triggerAlert);
router.delete('/:id', controller.deleteAlert);

module.exports = router;