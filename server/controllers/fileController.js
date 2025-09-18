const File = require('../models/file');
const Node = require('../models/Node');

// Utility function to fix srNo order
const reorderSrNo = async () => {
  const files = await File.find().sort({ srNo: 1 });
  
  // Update each file's srNo to be its position in the sorted array + 1
  const updates = files.map((file, index) => ({
    updateOne: {
      filter: { _id: file._id },
      update: { $set: { srNo: index + 1 } }
    }
  }));

  if (updates.length > 0) {
    await File.bulkWrite(updates);
  }

  return await File.find().sort({ srNo: 1 });
};

// Get all files with their nodes
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find()
      .sort({ srNo: 1 })
      .populate('nodes');
    res.json(files);
  } catch (err) {
    console.error('Error getting files:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get a single file with its nodes
exports.getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate('nodes');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (err) {
    console.error('Error getting file:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create a new file
exports.createFile = async (req, res) => {
  try {
    // Validate request body
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ message: 'File name is required and must be a string' });
    }

    const trimmedName = req.body.name.trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'File name cannot be empty' });
    }

    // Check for duplicate name
    const existingFile = await File.findOne({ name: trimmedName });
    if (existingFile) {
      return res.status(400).json({ message: 'A file with this name already exists' });
    }

    // Find the highest srNo and increment by 1
    const lastFile = await File.findOne().sort({ srNo: -1 });
    const nextSrNo = lastFile ? lastFile.srNo + 1 : 1;

    const file = new File({
      name: trimmedName,
      description: req.body.description || '',
      srNo: nextSrNo,
      nodes: [] // Initialize with empty nodes array
    });

    const newFile = await file.save();
    
    // Reorder to ensure consistency
    await reorderSrNo();
    
    console.log('File created successfully:', newFile);
    res.status(201).json(newFile);
  } catch (err) {
    console.error('Error creating file:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error creating file', error: err.message });
  }
};

// Update a file
exports.updateFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (req.body.name) {
      const trimmedName = req.body.name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'File name cannot be empty' });
      }

      // Check for duplicate name, excluding current file
      const existingFile = await File.findOne({ 
        name: trimmedName, 
        _id: { $ne: req.params.id } 
      });
      if (existingFile) {
        return res.status(400).json({ message: 'A file with this name already exists' });
      }

      file.name = trimmedName;
    }

    // Handle description update
    if (req.body.description !== undefined) {
      file.description = req.body.description.trim();
    }

    const updatedFile = await file.save();
    res.json(updatedFile);
  } catch (err) {
    console.error('Error updating file:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error updating file', error: err.message });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove all nodes associated with this file
    if (file.nodes && file.nodes.length > 0) {
      await Node.deleteMany({ _id: { $in: file.nodes } });
    }

    // Delete the file
    await File.deleteOne({ _id: req.params.id });

    // Reorder remaining files
    const remainingFiles = await reorderSrNo();
    console.log('Remaining files after reordering:', remainingFiles);
    
    res.json({ 
      message: 'File and associated nodes deleted',
      remainingFiles: remainingFiles 
    });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
};

// Add a node to a file
exports.addNode = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const node = await Node.findById(req.body.nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    if (!file.nodes.includes(node._id)) {
      file.nodes.push(node._id);
      await file.save();
    }

    res.json(await file.populate('nodes'));
  } catch (err) {
    console.error('Error adding node to file:', err);
    res.status(400).json({ message: 'Error adding node to file', error: err.message });
  }
};

// Remove a node from a file
exports.removeNode = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const nodeId = req.params.nodeId;
    file.nodes = file.nodes.filter(id => id.toString() !== nodeId);
    await file.save();

    res.json(await file.populate('nodes'));
  } catch (err) {
    console.error('Error removing node from file:', err);
    res.status(400).json({ message: 'Error removing node from file', error: err.message });
  }
}; 