const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  position: {
    x: {
      type: Number,
      default: null
    },
    y: {
      type: Number,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Node', NodeSchema);