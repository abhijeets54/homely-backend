const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const FoodItem = require('../models/FoodItem');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

// Seed sellers with reliable online images
async function seedSellers() {
  try {
    // Clear existing sellers, categories, and food items
    await Seller.deleteMany({});
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    
    console.log('Existing data cleared');

    // Seller data with reliable online image URLs
    const sellers = [
      {
        name: "Annapurna's Kitchen",
        email: "annapurna@example.com",
        phone: "9876543210",
        password: "password123",
        address: "123 Gandhi Road, Mumbai",
        status: "open",
        image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
        description: "Authentic home-cooked Maharashtrian cuisine made with love and traditional recipes passed down through generations."
      },
      {
        name: "Punjab Da Dhaba",
        email: "punjabdadhaba@example.com",
        phone: "9876543211",
        password: "password123",
        address: "456 Tagore Street, Delhi",
        status: "open",
        image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
        description: "Homestyle Punjabi food with rich flavors and authentic taste. Our specialties include butter chicken and sarson da saag."
      },
      {
        name: "South Indian Delights",
        email: "southindian@example.com",
        phone: "9876543212",
        password: "password123",
        address: "789 Marina Beach Road, Chennai",
        status: "open",
        image: "https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg",
        description: "Traditional South Indian cuisine with a focus on dosas, idlis, and other authentic dishes from Tamil Nadu and Kerala."
      },
      {
        name: "Bengali Home Kitchen",
        email: "bengali@example.com",
        phone: "9876543213",
        password: "password123",
        address: "101 Rabindra Sarani, Kolkata",
        status: "open",
        image: "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg",
        description: "Authentic Bengali cuisine with a focus on fish curries, mishti doi, and traditional sweets."
      },
      {
        name: "Gujarati Thali House",
        email: "gujarati@example.com",
        phone: "9876543214",
        password: "password123",
        address: "202 Gandhi Nagar, Ahmedabad",
        status: "open",
        image: "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg",
        description: "Complete Gujarati thali experience with authentic home-cooked dishes, farsan, and traditional sweets."
      }
    ];

    // Create sellers with online images
    const createdSellers = [];
    for (const sellerData of sellers) {
      const seller = new Seller({
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        password: sellerData.password,
        address: sellerData.address,
        status: sellerData.status,
        image: sellerData.image
      });
      
      await seller.save();
      createdSellers.push(seller);
      console.log(`Created seller: ${seller.name} with image: ${seller.image}`);
    }

    return createdSellers;
  } catch (error) {
    console.error('Error seeding sellers:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSellers().then(sellers => {
  seedCategoriesAndItems(sellers).catch(err => {
    console.error('Error in main seeding process:', err);
    process.exit(1);
  });
});

// Seed categories and food items
async function seedCategoriesAndItems(sellers) {
  try {
    // Menu categories for each seller
    const categoryData = {
      "Annapurna's Kitchen": [
        "Maharashtrian Specials",
        "Veg Curries",
        "Non-Veg Curries",
        "Breads",
        "Rice Dishes",
        "Desserts"
      ],
      "Punjab Da Dhaba": [
        "Punjabi Specials",
        "Tandoori Items",
        "Curries",
        "Breads",
        "Rice Dishes",
        "Desserts"
      ],
      "South Indian Delights": [
        "Dosas",
        "Idli & Vada",
        "Rice Varieties",
        "Curries",
        "Snacks",
        "Desserts"
      ],
      "Bengali Home Kitchen": [
        "Bengali Specials",
        "Fish Curries",
        "Veg Dishes",
        "Rice Dishes",
        "Snacks",
        "Sweets"
      ],
      "Gujarati Thali House": [
        "Thali Specials",
        "Farsan",
        "Sabzis",
        "Rotis",
        "Rice Dishes",
        "Sweets"
      ]
    };

    // Create categories for each seller
    const createdCategories = {};
    for (const seller of sellers) {
      createdCategories[seller.name] = [];
      
      const categories = categoryData[seller.name] || [];
      for (const categoryName of categories) {
        const category = new Category({
          name: categoryName,
          restaurantId: seller._id
        });
        
        await category.save();
        createdCategories[seller.name].push(category);
        console.log(`Created category: ${categoryName} for ${seller.name}`);
      }
    }

    // Food items data with reliable online image URLs
    await seedFoodItems(sellers, createdCategories);

    console.log('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories and items:', error);
    process.exit(1);
  }
}

async function seedFoodItems(sellers, createdCategories) {
  // Food items with reliable online image URLs
  const foodItemsData = {
    "Annapurna's Kitchen": {
      "Maharashtrian Specials": [
        {
          name: "Puran Poli",
          price: 120,
          image: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg",
          description: "Sweet flatbread stuffed with a lentil and jaggery mixture",
          isAvailable: true,
          quantity: 10
        },
        {
          name: "Vada Pav",
          price: 50,
          image: "https://images.pexels.com/photos/8963961/pexels-photo-8963961.jpeg",
          description: "Spicy potato fritter in a bun with chutneys",
          isAvailable: true,
          quantity: 20
        },
        {
          name: "Misal Pav",
          price: 120,
          image: "https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg",
          description: "Spicy sprouted moth beans curry served with bread rolls",
          isAvailable: true,
          quantity: 15
        }
      ],
      "Veg Curries": [
        {
          name: "Matki Usal",
          price: 150,
          image: "https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg",
          description: "Sprouted moth beans curry with traditional spices",
          isAvailable: true,
          quantity: 10
        },
        {
          name: "Bharli Vangi",
          price: 180,
          image: "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg",
          description: "Stuffed eggplant curry with peanut and coconut masala",
          isAvailable: true,
          quantity: 8
        }
      ],
      "Non-Veg Curries": [
        {
          name: "Kombdi Vade",
          price: 220,
          image: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg",
          description: "Malvani chicken curry served with deep-fried bread",
          isAvailable: true,
          quantity: 10
        },
        {
          name: "Mutton Kolhapuri",
          price: 280,
          image: "https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg",
          description: "Spicy mutton curry with Kolhapuri masala",
          isAvailable: true,
          quantity: 8
        }
      ],
      "Breads": [
        {
          name: "Bhakri",
          price: 30,
          image: "https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg",
          description: "Traditional Maharashtrian flatbread made from jowar or bajra flour",
          isAvailable: true,
          quantity: 25
        },
        {
          name: "Thalipeeth",
          price: 60,
          image: "https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg",
          description: "Multi-grain savory pancake with spices",
          isAvailable: true,
          quantity: 15
        }
      ],
      "Rice Dishes": [
        {
          name: "Masale Bhat",
          price: 150,
          image: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg",
          description: "Spiced rice with vegetables and traditional Maharashtrian masala",
          isAvailable: true,
          quantity: 12
        },
        {
          name: "Varan Bhat",
          price: 120,
          image: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg",
          description: "Simple comfort food of steamed rice and dal",
          isAvailable: true,
          quantity: 15
        }
      ],
      "Desserts": [
        {
          name: "Shrikhand",
          price: 80,
          image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
          description: "Sweetened strained yogurt flavored with saffron and cardamom",
          isAvailable: true,
          quantity: 15
        },
        {
          name: "Modak",
          price: 25,
          image: "https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg",
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
          image: "https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg",
          description: "Traditional Punjabi dish made with mustard greens",
          isAvailable: true,
          quantity: 10
        },
        {
          name: "Makki Di Roti",
          price: 40,
          image: "https://images.pexels.com/photos/1117862/pexels-photo-1117862.jpeg",
          description: "Cornmeal flatbread, perfect with sarson da saag",
          isAvailable: true,
          quantity: 20
        }
      ],
      "Tandoori Items": [
        {
          name: "Tandoori Chicken",
          price: 320,
          image: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg",
          description: "Chicken marinated in yogurt and spices, cooked in tandoor",
          isAvailable: true,
          quantity: 10
        },
        {
          name: "Paneer Tikka",
          price: 220,
          image: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg",
          description: "Marinated cottage cheese cubes grilled to perfection",
          isAvailable: true,
          quantity: 15
        }
      ],
      "Curries": [
        {
          name: "Butter Chicken",
          price: 280,
          image: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg",
          description: "Creamy tomato-based curry with tender chicken pieces",
          isAvailable: true,
          quantity: 12
        },
        {
          name: "Dal Makhani",
          price: 180,
          image: "https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg",
          description: "Creamy black lentil curry cooked with butter and cream",
          isAvailable: true,
          quantity: 15
        }
      ]
    }
  };

  // Add food items for remaining sellers
  foodItemsData["South Indian Delights"] = {
    "Dosas": [
      {
        name: "Masala Dosa",
        price: 120,
        image: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg",
        description: "Crispy rice crepe filled with spiced potato filling",
        isAvailable: true,
        quantity: 20
      },
      {
        name: "Mysore Masala Dosa",
        price: 140,
        image: "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg",
        description: "Dosa with spicy red chutney and potato filling",
        isAvailable: true,
        quantity: 15
      }
    ],
    "Idli & Vada": [
      {
        name: "Idli Sambar",
        price: 90,
        image: "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg",
        description: "Steamed rice cakes served with lentil soup and chutney",
        isAvailable: true,
        quantity: 20
      },
      {
        name: "Medu Vada",
        price: 80,
        image: "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg",
        description: "Crispy fried lentil donuts served with sambar and chutney",
        isAvailable: true,
        quantity: 15
      }
    ]
  };

  foodItemsData["Bengali Home Kitchen"] = {
    "Bengali Specials": [
      {
        name: "Kosha Mangsho",
        price: 280,
        image: "https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg",
        description: "Slow-cooked spicy mutton curry, a Bengali delicacy",
        isAvailable: true,
        quantity: 10
      },
      {
        name: "Shorshe Ilish",
        price: 320,
        image: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg",
        description: "Hilsa fish cooked in mustard sauce, a Bengali specialty",
        isAvailable: true,
        quantity: 8
      }
    ],
    "Sweets": [
      {
        name: "Rasgulla",
        price: 20,
        image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
        description: "Soft cottage cheese balls soaked in sugar syrup",
        isAvailable: true,
        quantity: 30
      },
      {
        name: "Mishti Doi",
        price: 60,
        image: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
        description: "Sweet yogurt dessert, a Bengali specialty",
        isAvailable: true,
        quantity: 20
      }
    ]
  };

  foodItemsData["Gujarati Thali House"] = {
    "Thali Specials": [
      {
        name: "Gujarati Thali",
        price: 250,
        image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
        description: "Complete meal with variety of dishes, rotis, rice, and dessert",
        isAvailable: true,
        quantity: 15
      },
      {
        name: "Mini Thali",
        price: 180,
        image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
        description: "Smaller version of Gujarati thali with essential dishes",
        isAvailable: true,
        quantity: 20
      }
    ],
    "Farsan": [
      {
        name: "Dhokla",
        price: 80,
        image: "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg",
        description: "Steamed savory cake made from fermented rice and chickpea flour",
        isAvailable: true,
        quantity: 20
      },
      {
        name: "Khandvi",
        price: 90,
        image: "https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg",
        description: "Soft gram flour rolls tempered with mustard seeds and curry leaves",
        isAvailable: true,
        quantity: 15
      }
    ]
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
    const categories = createdCategories[seller.name] || [];
    
    for (const category of categories) {
      const categoryItems = sellerFoodItems[category.name];
      
      if (!categoryItems) {
        console.log(`No food items defined for category: ${category.name}`);
        continue;
      }
      
      console.log(`Adding ${categoryItems.length} food items to category: ${category.name}`);
      
      for (const itemData of categoryItems) {
        try {
          // Create food item with online image
          const foodItem = new FoodItem({
            name: itemData.name,
            categoryId: category._id,
            restaurantId: seller._id,
            price: itemData.price,
            imageUrl: itemData.image,
            isAvailable: itemData.isAvailable,
            quantity: itemData.quantity
          });
          
          await foodItem.save();
          console.log(`Created food item: ${itemData.name} for ${seller.name} in ${category.name} with image: ${itemData.image}`);
        } catch (error) {
          console.error(`Error creating food item ${itemData.name}:`, error.message);
          continue;
        }
      }
    }
  }
}
