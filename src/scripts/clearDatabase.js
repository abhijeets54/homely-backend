const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Backendhomely')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * This script removes all static data from the database
 * while preserving the database structure.
 */
async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Get counts before deletion
    const sellerCount = await Seller.countDocuments();
    const categoryCount = await Category.countDocuments();
    const foodItemCount = await FoodItem.countDocuments();
    const cartCount = await Cart.countDocuments();
    const cartItemCount = await CartItem.countDocuments();
    
    console.log('Current database state:');
    console.log(`- Sellers: ${sellerCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Food Items: ${foodItemCount}`);
    console.log(`- Carts: ${cartCount}`);
    console.log(`- Cart Items: ${cartItemCount}`);
    
    // Confirm with user
    console.log('\nWARNING: This will delete all data from the database.');
    console.log('The cart functionality will still work on the frontend because we implemented local storage.');
    console.log('Press Ctrl+C now to cancel if you want to keep your data.\n');
    
    // Wait for 5 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete all data
    console.log('Deleting all data...');
    
    // Delete in proper order to respect references
    const cartItemResult = await CartItem.deleteMany({});
    console.log(`Deleted ${cartItemResult.deletedCount} cart items`);
    
    const cartResult = await Cart.deleteMany({});
    console.log(`Deleted ${cartResult.deletedCount} carts`);
    
    const foodItemResult = await FoodItem.deleteMany({});
    console.log(`Deleted ${foodItemResult.deletedCount} food items`);
    
    const categoryResult = await Category.deleteMany({});
    console.log(`Deleted ${categoryResult.deletedCount} categories`);
    
    const sellerResult = await Seller.deleteMany({});
    console.log(`Deleted ${sellerResult.deletedCount} sellers`);
    
    // Note: User model is not included in this cleanup
    // as it doesn't exist in the current backend structure
    
    console.log('\nDatabase cleanup completed successfully!');
    console.log('The cart functionality will continue to work on the frontend because we implemented local storage.');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the clear function
clearDatabase();
