const express = require('express');
const router = express.Router();
const controller = require('./estimator.controller');

// Public
router.get('/config/:region', controller.getConfig);
router.get('/breakdown', controller.getBreakdown); // query: region,type,mode
router.post('/calculate', controller.calculate);
router.get(
  "/popular-calculations",
  controller.listActivePopularCalculations
);

module.exports = router;
