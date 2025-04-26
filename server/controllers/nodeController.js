const Node = require('../models/Node');

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
    tags: req.body.tags || []
  });

  try {
    const newNode = await node.save();
    res.status(201).json(newNode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add updateNode, deleteNode, getNodeById, etc.