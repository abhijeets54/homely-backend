require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const path = require('path');

const app = express();

// Connect to the database
connectDB();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with specific options
app.use(express.json());

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/food', require('./src/routes/food'));
app.use('/api/order', require('./src/routes/orders'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/seller', require('./src/routes/seller'));
app.use('/api/customer', require('./src/routes/customer'));
app.use('/api/category', require('./src/routes/category'));
app.use('/api/review', require('./src/routes/review'));
app.use('/api/delivery', require('./src/routes/delivery'));
app.use('/api/payment', require('./src/routes/payment'));

// Default route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
});
