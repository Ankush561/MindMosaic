const Edge = require('../models/Edge');
const Node = require('../models/Node');

exports.getAllEdges = async (req, res) => {
  try {
    // Get all edges but don't populate them
    const edges = await Edge.find();

    // Log the edges for debugging
    console.log('Edges found:', edges);

    res.json(edges);
  } catch (err) {
    console.error('Error getting edges:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createEdge = async (req, res) => {
  try {
    console.log('Creating edge with data:', req.body);

    // Validate that source and target nodes exist
    const sourceNode = await Node.findById(req.body.source);
    const targetNode = await Node.findById(req.body.target);

    if (!sourceNode || !targetNode) {
      return res.status(400).json({
        message: 'Source or target node not found',
        sourceExists: !!sourceNode,
        targetExists: !!targetNode
      });
    }

    const edge = new Edge({
      source: req.body.source,
      target: req.body.target,
      type: req.body.type || 'related',
      weight: req.body.weight || 1
    });

    const newEdge = await edge.save();
    console.log('Edge created successfully:', newEdge);
    res.status(201).json(newEdge);
  } catch (err) {
    console.error('Error creating edge:', err);
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
