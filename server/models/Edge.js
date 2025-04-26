const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  type: {
    type: String,
    default: 'related'
  },
  weight: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Edge', EdgeSchema);