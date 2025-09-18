const Node = require('../models/Node');
const Edge = require('../models/Edge'); // Import Edge model

exports.getAllNodes = async (req, res) => {
  try {
    const nodes = await Node.find();
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNode = async (req, res) => {
  const node = new Node({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags || [],
    position: req.body.position || { x: null, y: null }
  });

  try {
    const newNode = await node.save();
    res.status(201).json(newNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update node with position data
exports.updateNode = async (req, res) => {
  try {
    const updatedNode = await Node.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags,
        position: req.body.position || { x: null, y: null },
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!updatedNode) {
      return res.status(404).json({ message: 'Node not found' });
    }
    res.json(updatedNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add method to update just the position
exports.updateNodePosition = async (req, res) => {
  try {
    const updatedNode = await Node.findByIdAndUpdate(
      req.params.id,
      {
        position: {
          x: req.body.x,
          y: req.body.y
        }
      },
      { new: true }
    );
    if (!updatedNode) {
      return res.status(404).json({ message: 'Node not found' });
    }
    res.json(updatedNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add updateNode, deleteNode, getNodeById, etc.
exports.deleteNode = async (req, res) => {
  try {
    const nodeId = req.params.id;

    // First delete any edges connected to this node
    await Edge.deleteMany({
      $or: [
        { source: nodeId },
        { target: nodeId }
      ]
    });

    // Then delete the node
    const node = await Node.findByIdAndDelete(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    res.json({ message: 'Node and related edges deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
