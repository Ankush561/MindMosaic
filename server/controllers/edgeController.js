const Edge = require('../models/Edge');

exports.getAllEdges = async (req, res) => {
  try {
    const edges = await Edge.find().populate('source target');
    res.json(edges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEdge = async (req, res) => {
  const edge = new Edge({
    source: req.body.source,
    target: req.body.target,
    type: req.body.type || 'related',
    weight: req.body.weight || 1
  });

  try {
    const newEdge = await edge.save();
    res.status(201).json(newEdge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEdge = async (req, res) => {
  try {
    await Edge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Edge deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};