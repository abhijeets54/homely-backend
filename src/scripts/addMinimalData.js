const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');

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
 * This script adds minimal data to test the cart functionality
 * after clearing the database.
 */
async function addMinimalData() {
  try {
    console.log('Adding minimal test data...');
    
    // Create a test seller
    const seller = new Seller({
      name: 'Test Kitchen',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      address: '123 Test Street, Test City',
      status: 'open',
      rating: 4.5
    });
    
    const savedSeller = await seller.save();
    console.log(`Created test seller: ${savedSeller.name} (${savedSeller._id})`);
    
    // Create a test category
    const category = new Category({
      name: 'Test Menu',
      restaurantId: savedSeller._id
    });
    
    const savedCategory = await category.save();
    console.log(`Created test category: ${savedCategory.name} (${savedCategory._id})`);
    
    // Create test food items
    const foodItems = [
      {
        name: 'Test Dish 1',
        description: 'A delicious test dish',
        price: 100,
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        isAvailable: true,
        categoryId: savedCategory._id,
        restaurantId: savedSeller._id,
        stock: 10,
        dietaryInfo: 'vegetarian'
      },
      {
        name: 'Test Dish 2',
        description: 'Another tasty test dish',
        price: 150,
        imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
        isAvailable: true,
        categoryId: savedCategory._id,
        restaurantId: savedSeller._id,
        stock: 15,
        dietaryInfo: 'non-vegetarian'
      }
    ];
    
    for (const item of foodItems) {
      const foodItem = new FoodItem(item);
      const savedItem = await foodItem.save();
      console.log(`Created test food item: ${savedItem.name} (${savedItem._id})`);
    }
    
    console.log('\nMinimal test data added successfully!');
    console.log('You can now test the cart functionality with this data.');
    console.log(`Visit: http://localhost:3000/sellers/${savedSeller._id} to view the test seller`);
    
  } catch (error) {
    console.error('Error adding minimal data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function
addMinimalData();
