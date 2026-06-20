const express = require('express');
const router = express.Router();
const controller = require('./estimator.controller');

// Region rate management
router.post('/regions', controller.createRegion);
router.get('/regions', controller.listRegions);
router.put('/regions/:id', controller.updateRegion);
router.delete('/regions/:id', controller.deleteRegion);

// Breakdown node management
router.get('/nodes', controller.listNodes);
router.post('/nodes', controller.createNode);
router.put('/nodes/:id', controller.updateNode);
router.delete('/nodes/:id', controller.deleteNode);
router.patch('/nodes/:id/reorder', controller.reorderNode);
router.patch('/nodes/:id/activate', controller.activateNode);

// Publish-time tree validation
router.post('/nodes/validate', controller.validateTree);

router.get(
  "/popular-calculations",
  controller.listPopularCalculations
);

router.post(
  "/popular-calculations",
  controller.createPopularCalculation
);

router.put(
  "/popular-calculations/:id",
  controller.updatePopularCalculation
);

router.delete(
  "/popular-calculations/:id",
  controller.deletePopularCalculation
);

router.patch(
  "/popular-calculations/:id/toggle",
  controller.togglePopularCalculation
);

router.patch(
  "/popular-calculations/:id/reorder",
  controller.reorderPopularCalculation
);

module.exports = router;
