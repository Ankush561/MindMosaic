const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  srNo: {
    type: Number,
    required: true,
    unique: true
  },
  nodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add an index for faster queries by srNo
fileSchema.index({ srNo: 1 });

module.exports = mongoose.model('File', fileSchema); 