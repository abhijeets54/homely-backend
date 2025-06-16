const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();


// Import routes
const authRoutes = require('./src/routes/auth');
const sellerRoutes = require('./src/routes/seller');
const customerRoutes = require('./src/routes/customer');
const foodRoutes = require('./src/routes/food');
const categoryRoutes = require('./src/routes/category');
const cartRoutes = require('./src/routes/cart');
const orderRoutes = require('./src/routes/order');
const reviewRoutes = require('./src/routes/review');
const deliveryRoutes = require('./src/routes/delivery');
const paymentRoutes = require('./src/routes/payment');
const uploadRoutes = require('./src/routes/upload');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://homely-frontend.vercel.app'], // Specify the allowed origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Homely API' });
});

// Health check route for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Homely API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homely');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
