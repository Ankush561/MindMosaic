const express = require('express');
const router = express.Router();
const nodeController = require('../controllers/nodeController');
const Node = require('../models/Node');
router.get('/', nodeController.getAllNodes);
router.post('/', nodeController.createNode);
// Add other routes: get/:id, patch/:id, delete/:id

module.exports = router;

// Create
router.post('/', async (req, res) => {
  try {
    const node = new Node(req.body);
    await node.save();
    res.status(201).send(node);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update
router.patch('/:id', async (req, res) => {
  try {
    const node = await Node.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!node) return res.status(404).send();
    res.send(node);
  } catch (err) {
    res.status(400).send(err);
  }
});