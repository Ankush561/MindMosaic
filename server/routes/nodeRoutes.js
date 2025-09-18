const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');
const Node = require('../models/Node');
const Edge = require('../models/Edge'); // Import the Edge model

router.get('/', nodeController.getAllNodes);
router.post('/', nodeController.createNode);
router.patch('/:id', nodeController.updateNode);
router.patch('/:id/position', nodeController.updateNodePosition);
router.delete('/:id', nodeController.deleteNode); // Use controller for delete
module.exports = router;
