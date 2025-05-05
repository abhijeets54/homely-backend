const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

// Seed food items data with local placeholder images
async function seedFoodItems() {
  try {
    // Clear existing food items
    await FoodItem.deleteMany({});
    console.log('Existing food items cleared');

    // Get all sellers
    const sellers = await Seller.find();
    console.log(`Found ${sellers.length} sellers`);

    // Create uploads/food directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/food');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create a placeholder image file if it doesn't exist
    const placeholderPath = path.join(uploadDir, 'placeholder.jpg');
    if (!fs.existsSync(placeholderPath)) {
      // Create a simple colored rectangle as placeholder
      // This is a base64-encoded minimal JPG image (1x1 pixel)
      const base64Image = '/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAZABkAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+t6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//2Q==';
      const imageBuffer = Buffer.from(base64Image, 'base64');
      fs.writeFileSync(placeholderPath, imageBuffer);
      console.log(`Created placeholder image at ${placeholderPath}`);
    }

    // Food items data
    const foodItemsData = {
      "Annapurna's Kitchen": {
        "Maharashtrian Specials": [
          {
            name: "Puran Poli",
            price: 120,
            description: "Sweet flatbread stuffed with a lentil and jaggery mixture",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Vada Pav",
            price: 50,
            description: "Spicy potato fritter in a bun with chutneys",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Misal Pav",
            price: 120,
            description: "Spicy sprouted moth beans curry served with bread rolls",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Veg Curries": [
          {
            name: "Matki Usal",
            price: 150,
            description: "Sprouted moth beans curry with traditional spices",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Bharli Vangi",
            price: 180,
            description: "Stuffed eggplant curry with peanut and coconut masala",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Non-Veg Curries": [
          {
            name: "Kombdi Vade",
            price: 220,
            description: "Malvani chicken curry served with deep-fried bread",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Mutton Kolhapuri",
            price: 280,
            description: "Spicy mutton curry with Kolhapuri masala",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Breads": [
          {
            name: "Bhakri",
            price: 30,
            description: "Traditional Maharashtrian flatbread made from jowar or bajra flour",
            isAvailable: true,
            quantity: 25
          },
          {
            name: "Thalipeeth",
            price: 60,
            description: "Multi-grain savory pancake with spices",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Rice Dishes": [
          {
            name: "Masale Bhat",
            price: 150,
            description: "Spiced rice with vegetables and traditional Maharashtrian masala",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Varan Bhat",
            price: 120,
            description: "Simple comfort food of steamed rice and dal",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Desserts": [
          {
            name: "Shrikhand",
            price: 80,
            description: "Sweetened strained yogurt flavored with saffron and cardamom",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Modak",
            price: 25,
            description: "Sweet dumplings filled with coconut and jaggery",
            isAvailable: true,
            quantity: 30
          }
        ]
      },
      "Punjab Da Dhaba": {
        "Punjabi Specials": [
          {
            name: "Sarson Da Saag",
            price: 180,
            description: "Traditional Punjabi dish made with mustard greens",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Makki Di Roti",
            price: 40,
            description: "Cornmeal flatbread, perfect with sarson da saag",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Tandoori Items": [
          {
            name: "Tandoori Chicken",
            price: 320,
            description: "Chicken marinated in yogurt and spices, cooked in tandoor",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Paneer Tikka",
            price: 220,
            description: "Marinated cottage cheese cubes grilled to perfection",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Curries": [
          {
            name: "Butter Chicken",
            price: 280,
            description: "Creamy tomato-based curry with tender chicken pieces",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Dal Makhani",
            price: 180,
            description: "Creamy black lentil curry cooked with butter and cream",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Breads": [
          {
            name: "Butter Naan",
            price: 40,
            description: "Soft leavened bread brushed with butter",
            isAvailable: true,
            quantity: 25
          },
          {
            name: "Laccha Paratha",
            price: 50,
            description: "Layered flatbread with a flaky texture",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Rice Dishes": [
          {
            name: "Jeera Rice",
            price: 120,
            description: "Basmati rice tempered with cumin seeds",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Veg Pulao",
            price: 150,
            description: "Fragrant rice cooked with mixed vegetables and spices",
            isAvailable: true,
            quantity: 12
          }
        ],
        "Desserts": [
          {
            name: "Gulab Jamun",
            price: 60,
            description: "Deep-fried milk solids soaked in sugar syrup",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Phirni",
            price: 70,
            description: "Rice pudding flavored with cardamom and nuts",
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
            description: "Slow-cooked spicy mutton curry, a Bengali delicacy",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Shorshe Ilish",
            price: 320,
            description: "Hilsa fish cooked in mustard sauce, a Bengali specialty",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Fish Curries": [
          {
            name: "Macher Jhol",
            price: 220,
            description: "Light fish curry with turmeric and cumin",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Chingri Malai Curry",
            price: 300,
            description: "Prawns cooked in coconut milk curry",
            isAvailable: true,
            quantity: 10
          }
        ],
        "Veg Dishes": [
          {
            name: "Aloo Posto",
            price: 150,
            description: "Potatoes cooked with poppy seed paste",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Shukto",
            price: 160,
            description: "Mixed vegetable stew with bitter gourd",
            isAvailable: true,
            quantity: 12
          }
        ],
        "Rice Dishes": [
          {
            name: "Ghee Bhat",
            price: 100,
            description: "Steamed rice with clarified butter",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Basanti Pulao",
            price: 180,
            description: "Sweet yellow rice with dry fruits and saffron",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Snacks": [
          {
            name: "Beguni",
            price: 60,
            description: "Eggplant fritters in gram flour batter",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Phuchka",
            price: 80,
            description: "Hollow crispy balls filled with spicy tamarind water",
            isAvailable: true,
            quantity: 25
          }
        ],
        "Sweets": [
          {
            name: "Rasgulla",
            price: 20,
            description: "Soft cottage cheese balls soaked in sugar syrup",
            isAvailable: true,
            quantity: 30
          },
          {
            name: "Mishti Doi",
            price: 60,
            description: "Sweet yogurt dessert, a Bengali specialty",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Sandesh",
            price: 25,
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
            description: "Complete meal with variety of dishes, rotis, rice, and dessert",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Mini Thali",
            price: 180,
            description: "Smaller version of Gujarati thali with essential dishes",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Farsan": [
          {
            name: "Dhokla",
            price: 80,
            description: "Steamed savory cake made from fermented rice and chickpea flour",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Khandvi",
            price: 90,
            description: "Soft gram flour rolls tempered with mustard seeds and curry leaves",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Fafda",
            price: 70,
            description: "Crispy gram flour snack served with chutney",
            isAvailable: true,
            quantity: 25
          }
        ],
        "Sabzis": [
          {
            name: "Undhiyu",
            price: 180,
            description: "Mixed vegetable curry, a Gujarati winter specialty",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Ringan nu Shaak",
            price: 150,
            description: "Spicy eggplant curry cooked with traditional spices",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Rotis": [
          {
            name: "Bajra Rotla",
            price: 30,
            description: "Traditional thick flatbread made from pearl millet flour",
            isAvailable: true,
            quantity: 25
          },
          {
            name: "Thepla",
            price: 40,
            description: "Spiced flatbread made with fenugreek leaves",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Rice Dishes": [
          {
            name: "Vagharelo Bhaat",
            price: 120,
            description: "Tempered rice with spices and peanuts",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Khichdi",
            price: 130,
            description: "One-pot meal of rice and lentils, served with ghee",
            isAvailable: true,
            quantity: 12
          }
        ],
        "Sweets": [
          {
            name: "Basundi",
            price: 70,
            description: "Thickened sweetened milk with nuts and saffron",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Mohanthal",
            price: 25,
            description: "Traditional Gujarati fudge made from gram flour",
            isAvailable: true,
            quantity: 25
          },
          {
            name: "Shrikhand",
            price: 60,
            description: "Sweetened strained yogurt with saffron and cardamom",
            isAvailable: true,
            quantity: 20
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
            // Generate a unique image name for each food item
            const imageName = `food-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const imagePath = path.join(uploadDir, imageName);
            
            // Copy the placeholder image for each food item
            fs.copyFileSync(placeholderPath, imagePath);
            console.log(`Created food image at ${imagePath}`);
            
            // Create food item with local image
            const foodItem = new FoodItem({
              name: itemData.name,
              categoryId: category._id,
              restaurantId: seller._id,
              price: itemData.price,
              imageUrl: `/uploads/food/${imageName}`,
              isAvailable: itemData.isAvailable,
              quantity: itemData.quantity
            });
            
            await foodItem.save();
            console.log(`Created food item: ${itemData.name} for ${seller.name} in ${category.name}`);
          } catch (error) {
            console.error(`Error creating food item ${itemData.name}:`, error.message);
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
