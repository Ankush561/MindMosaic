const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Get all files
router.get('/', fileController.getFiles);

// Get a single file
router.get('/:id', fileController.getFile);

// Create a new file
router.post('/', fileController.createFile);

// Update a file
router.patch('/:id', fileController.updateFile);

// Delete a file
router.delete('/:id', fileController.deleteFile);

// Add a node to a file
router.post('/:id/nodes', fileController.addNode);

// Remove a node from a file
router.delete('/:id/nodes/:nodeId', fileController.removeNode);

module.exports = router; 