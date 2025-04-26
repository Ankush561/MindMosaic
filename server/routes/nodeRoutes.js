const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');

router.get('/', nodeController.getAllNodes);
router.post('/', nodeController.createNode);
// Add other routes: get/:id, patch/:id, delete/:id

module.exports = router;