const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

// Function to download image from URL and save to local file system
async function downloadImage(url, imagePath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    // Create directory if it doesn't exist
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the image to file
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    throw error;
  }
}

// Seed food items data
async function seedFoodItems() {
  try {
    // Clear existing food items
    await FoodItem.deleteMany({});
    console.log('Existing food items cleared');

    // Get all sellers
    const sellers = await Seller.find();
    console.log(`Found ${sellers.length} sellers`);

    // Food items data with reliable image URLs
    const foodItemsData = {
      "Annapurna's Kitchen": {
        "Maharashtrian Specials": [
          {
            name: "Puran Poli",
            price: 120,
            image: "https://i.imgur.com/8PL6U9U.jpg",
            description: "Sweet flatbread stuffed with a lentil and jaggery mixture",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Vada Pav",
            price: 50,
            image: "https://i.imgur.com/kCEP6Py.jpg",
            description: "Spicy potato fritter in a bun with chutneys",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Misal Pav",
            price: 120,
            image: "https://i.imgur.com/Vyr0Uf5.jpg",
            description: "Spicy sprouted moth beans curry served with bread rolls",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Veg Curries": [
          {
            name: "Matki Usal",
            price: 150,
            image: "https://i.imgur.com/pYFHdD0.jpg",
            description: "Sprouted moth beans curry with traditional spices",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Bharli Vangi",
            price: 180,
            image: "https://i.imgur.com/1xhUjRc.jpg",
            description: "Stuffed eggplant curry with peanut and coconut masala",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Non-Veg Curries": [
          {
            name: "Kombdi Vade",
            price: 220,
            image: "https://i.imgur.com/2Yjwgc8.jpg",
            description: "Malvani chicken curry served with deep-fried bread",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Mutton Kolhapuri",
            price: 280,
            image: "https://i.imgur.com/JWYrIZJ.jpg",
            description: "Spicy mutton curry with Kolhapuri masala",
            isAvailable: true,
            quantity: 8
          }
        ]
      },
      "Punjab Da Dhaba": {
        "Punjabi Specials": [
          {
            name: "Sarson Da Saag",
            price: 180,
            image: "https://i.imgur.com/oRfQUg2.jpg",
            description: "Traditional Punjabi dish made with mustard greens",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Makki Di Roti",
            price: 40,
            image: "https://i.imgur.com/UB8xyQv.jpg",
            description: "Cornmeal flatbread, perfect with sarson da saag",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Tandoori Items": [
          {
            name: "Tandoori Chicken",
            price: 320,
            image: "https://i.imgur.com/rlZcEw7.jpg",
            description: "Chicken marinated in yogurt and spices, cooked in tandoor",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Paneer Tikka",
            price: 220,
            image: "https://i.imgur.com/8XA519P.jpg",
            description: "Marinated cottage cheese cubes grilled to perfection",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Curries": [
          {
            name: "Butter Chicken",
            price: 280,
            image: "https://i.imgur.com/HYppFWk.jpg",
            description: "Creamy tomato-based curry with tender chicken pieces",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Dal Makhani",
            price: 180,
            image: "https://i.imgur.com/Vdpd0Zx.jpg",
            description: "Creamy black lentil curry cooked with butter and cream",
            isAvailable: true,
            quantity: 15
          }
        ]
      },
      "Bengali Home Kitchen": {
        "Bengali Specials": [
          {
            name: "Kosha Mangsho",
            price: 280,
            image: "https://i.imgur.com/aNqwfoT.jpg",
            description: "Slow-cooked spicy mutton curry, a Bengali delicacy",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Shorshe Ilish",
            price: 320,
            image: "https://i.imgur.com/ZJh8Bj4.jpg",
            description: "Hilsa fish cooked in mustard sauce, a Bengali specialty",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Fish Curries": [
          {
            name: "Macher Jhol",
            price: 220,
            image: "https://i.imgur.com/sMFwdLQ.jpg",
            description: "Light fish curry with turmeric and cumin",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Chingri Malai Curry",
            price: 300,
            image: "https://i.imgur.com/Jk9a9lG.jpg",
            description: "Prawns cooked in coconut milk curry",
            isAvailable: true,
            quantity: 10
          }
        ],
        "Sweets": [
          {
            name: "Rasgulla",
            price: 20,
            image: "https://i.imgur.com/DZpWLM3.jpg",
            description: "Soft cottage cheese balls soaked in sugar syrup",
            isAvailable: true,
            quantity: 30
          },
          {
            name: "Mishti Doi",
            price: 60,
            image: "https://i.imgur.com/0eaFIXP.jpg",
            description: "Sweet yogurt dessert, a Bengali specialty",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Sandesh",
            price: 25,
            image: "https://i.imgur.com/JvEpuYS.jpg",
            description: "Traditional Bengali sweet made from cottage cheese",
            isAvailable: true,
            quantity: 25
          }
        ]
      },
      "Gujarati Thali House": {
        "Thali Specials": [
          {
            name: "Gujarati Thali",
            price: 250,
            image: "https://i.imgur.com/7DpqUtR.jpg",
            description: "Complete meal with variety of dishes, rotis, rice, and dessert",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Mini Thali",
            price: 180,
            image: "https://i.imgur.com/XvXXcYv.jpg",
            description: "Smaller version of Gujarati thali with essential dishes",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Farsan": [
          {
            name: "Dhokla",
            price: 80,
            image: "https://i.imgur.com/aBpQqVY.jpg",
            description: "Steamed savory cake made from fermented rice and chickpea flour",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Khandvi",
            price: 90,
            image: "https://i.imgur.com/QJvELAA.jpg",
            description: "Soft gram flour rolls tempered with mustard seeds and curry leaves",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Fafda",
            price: 70,
            image: "https://i.imgur.com/5NVfKqD.jpg",
            description: "Crispy gram flour snack served with chutney",
            isAvailable: true,
            quantity: 25
          }
        ],
        "Sabzis": [
          {
            name: "Undhiyu",
            price: 180,
            image: "https://i.imgur.com/Wd0qXgC.jpg",
            description: "Mixed vegetable curry, a Gujarati winter specialty",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Ringan nu Shaak",
            price: 150,
            image: "https://i.imgur.com/ztVIwbL.jpg",
            description: "Spicy eggplant curry cooked with traditional spices",
            isAvailable: true,
            quantity: 15
          }
        ]
      }
    };

    // Create food items for each seller and category
    for (const seller of sellers) {
      console.log(`Processing seller: ${seller.name}`);
      const sellerFoodItems = foodItemsData[seller.name];
      
      if (!sellerFoodItems) {
        console.log(`No food items defined for seller: ${seller.name}`);
        continue;
      }
      
      // Get categories for this seller
      const categories = await Category.find({ restaurantId: seller._id });
      console.log(`Found ${categories.length} categories for ${seller.name}`);
      
      for (const category of categories) {
        const categoryItems = sellerFoodItems[category.name];
        
        if (!categoryItems) {
          console.log(`No food items defined for category: ${category.name}`);
          continue;
        }
        
        console.log(`Adding ${categoryItems.length} food items to category: ${category.name}`);
        
        for (const itemData of categoryItems) {
          try {
            // Create uploads/food directory if it doesn't exist
            const uploadDir = path.join(__dirname, '../../uploads/food');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // Download food item image
            const imageName = `food-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const imagePath = path.join(__dirname, '../../uploads/food', imageName);
            const imageUrl = `/uploads/food/${imageName}`;
            
            await downloadImage(itemData.image, imagePath);
            console.log(`Downloaded food image to ${imagePath}`);
            
            // Create food item with downloaded image
            const foodItem = new FoodItem({
              name: itemData.name,
              categoryId: category._id,
              restaurantId: seller._id,
              price: itemData.price,
              imageUrl: imageUrl,
              isAvailable: itemData.isAvailable,
              quantity: itemData.quantity
            });
            
            await foodItem.save();
            console.log(`Created food item: ${itemData.name} for ${seller.name} in ${category.name}`);
          } catch (error) {
            console.error(`Error creating food item ${itemData.name}:`, error.message);
            // Continue with next food item if image download fails
            continue;
          }
        }
      }
    }

    console.log('Food items seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding food items:', error);
    process.exit(1);
  }
}

// Run the seed function
seedFoodItems();
