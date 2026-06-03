const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const propRoutes = require('./routes/propRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const questionRoutes = require('./routes/questionRoutes');
const imageRoutes = require('./routes/imageRoutes');

const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // support standard react development ports
  credentials: true
}));

// Parsers for incoming request bodies (JSON format)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic routes registration
app.use('/api/auth', authRoutes);
app.use('/api/properties', propRoutes);
app.use('/api/bookings', bookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'Real Estate Property Management API is online.' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err.stack);
  res.status(500).json({ message: 'Internal Server Error.' });
});

// Initialize database and start Express Server
async function startServer() {
  console.log('Bootstrapping server environment...');
  
  // Connect and initialize database
  await initDB();

  // Bind server port
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` SERVER RUNNING SUCCESSFULLY AT http://localhost:${PORT} `);
    console.log(`====================================================`);
  });
}

startServer();
