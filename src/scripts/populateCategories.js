const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config(); // Load environment variables

// Connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected successfully');
    return Category.insertMany([
      { name: 'Appetizers' },
      { name: 'Main Courses' },
      { name: 'Desserts' },
      { name: 'Beverages' }
    ]);
  })
  .then(() => {
    console.log('Categories populated successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error populating categories:', err);
    mongoose.connection.close();
  });