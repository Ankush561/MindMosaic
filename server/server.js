require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodeRoutes = require('./routes/nodeRoutes');
const edgeRoutes = require('./routes/edgeRoutes');  // This should now work
const fileRoutes = require('./routes/files');

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/graphdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Error handling for MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/edges', edgeRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
