const express = require('express');
const router = express.Router();
const edgeController = require('../controllers/edgeController');

router.get('/', edgeController.getAllEdges);
router.post('/', edgeController.createEdge);
router.delete('/:id', edgeController.deleteEdge);

module.exports = router;