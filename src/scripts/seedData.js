const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Seed data
async function seedData() {
  try {
    // Clear existing data
    await Seller.deleteMany({});
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    
    console.log('Existing data cleared');

    // Seller data with authentic Indian home-cooked food profiles
    const sellers = [
      {
        name: "Annapurna's Kitchen",
        email: "annapurna@example.com",
        phone: "9876543210",
        password: "password123",
        address: "123 Gandhi Road, Mumbai",
        status: "open",
        image: "https://images.unsplash.com/photo-1588675646184-f5b0b0b0b2de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Authentic home-cooked Maharashtrian cuisine made with love and traditional recipes passed down through generations."
      },
      {
        name: "Punjab Da Dhaba",
        email: "punjabdadhaba@example.com",
        phone: "9876543211",
        password: "password123",
        address: "456 Tagore Street, Delhi",
        status: "open",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Homestyle Punjabi food with rich flavors and authentic taste. Our specialties include butter chicken and sarson da saag."
      },
      {
        name: "South Indian Delights",
        email: "southindian@example.com",
        phone: "9876543212",
        password: "password123",
        address: "789 Marina Beach Road, Chennai",
        status: "open",
        image: "https://images.unsplash.com/photo-1610192244261-3f33de3f72e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Traditional South Indian cuisine with a focus on dosas, idlis, and other authentic dishes from Tamil Nadu and Kerala."
      },
      {
        name: "Bengali Home Kitchen",
        email: "bengali@example.com",
        phone: "9876543213",
        password: "password123",
        address: "101 Rabindra Sarani, Kolkata",
        status: "open",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Authentic Bengali cuisine with a focus on fish curries, mishti doi, and traditional sweets."
      },
      {
        name: "Gujarati Thali House",
        email: "gujarati@example.com",
        phone: "9876543214",
        password: "password123",
        address: "202 Gandhi Nagar, Ahmedabad",
        status: "open",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Complete Gujarati thali experience with authentic home-cooked dishes, farsan, and traditional sweets."
      }
    ];

    // Create sellers and download their profile images
    const createdSellers = [];
    for (const sellerData of sellers) {
      // Download seller profile image
      const imageName = `seller-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
      const imagePath = path.join(__dirname, '../../uploads', imageName);
      const imageUrl = `/uploads/${imageName}`;
      
      try {
        await downloadImage(sellerData.image, imagePath);
        console.log(`Downloaded seller image to ${imagePath}`);
        
        // Create seller with downloaded image
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sellerData.password, salt);
        
        const seller = new Seller({
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone,
          password: hashedPassword,
          address: sellerData.address,
          status: sellerData.status,
          image: imageUrl
        });
        
        await seller.save();
        createdSellers.push(seller);
        console.log(`Created seller: ${seller.name}`);
      } catch (error) {
        console.error(`Error creating seller ${sellerData.name}:`, error.message);
        // Continue with next seller if image download fails
        continue;
      }
    }

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
    for (const seller of createdSellers) {
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

    // Food items data
    const foodItemsData = {
      "Annapurna's Kitchen": {
        "Maharashtrian Specials": [
          {
            name: "Puran Poli",
            price: 120,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/03/puran-poli-1.jpg",
            description: "Sweet flatbread stuffed with a lentil and jaggery mixture",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Vada Pav",
            price: 50,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2012/05/vada-pav-recipe-1.jpg",
            description: "Spicy potato fritter in a bun with chutneys",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Misal Pav",
            price: 120,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/08/misal-pav-recipe-1.jpg",
            description: "Spicy sprouted moth beans curry served with bread rolls",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Veg Curries": [
          {
            name: "Matki Usal",
            price: 150,
            image: "https://www.archanaskitchen.com/images/archanaskitchen/0-Archanas-Kitchen-Recipes/2018/Maharastrian_Matki_Chi_Usal_Recipe_Sprouted_Moth_Beans_Curry-1.jpg",
            description: "Sprouted moth beans curry with traditional spices",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Bharli Vangi",
            price: 180,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2016/06/bharli-vangi-recipe.jpg",
            description: "Stuffed eggplant curry with peanut and coconut masala",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Non-Veg Curries": [
          {
            name: "Kombdi Vade",
            price: 220,
            image: "https://img-global.cpcdn.com/recipes/b5fc4282cf49c1e8/1200x630cq70/photo.jpg",
            description: "Malvani chicken curry served with deep-fried bread",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Mutton Kolhapuri",
            price: 280,
            image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Mutton-Kolhapuri.jpg",
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
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/12/sarson-ka-saag-recipe-1.jpg",
            description: "Traditional Punjabi dish made with mustard greens",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Makki Di Roti",
            price: 40,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2020/12/makki-di-roti-1.jpg",
            description: "Cornmeal flatbread, perfect with sarson da saag",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Tandoori Items": [
          {
            name: "Tandoori Chicken",
            price: 320,
            image: "https://www.licious.in/blog/wp-content/uploads/2020/12/Tandoori-Chicken-750x750.jpg",
            description: "Chicken marinated in yogurt and spices, cooked in tandoor",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Paneer Tikka",
            price: 220,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2020/11/paneer-tikka-recipe-1.jpg",
            description: "Marinated cottage cheese cubes grilled to perfection",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Curries": [
          {
            name: "Butter Chicken",
            price: 280,
            image: "https://cafedelites.com/wp-content/uploads/2019/01/Butter-Chicken-IMAGE-64.jpg",
            description: "Creamy tomato-based curry with tender chicken pieces",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Dal Makhani",
            price: 180,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2020/08/dal-makhani-1.jpg",
            description: "Creamy black lentil curry cooked with butter and cream",
            isAvailable: true,
            quantity: 15
          }
        ]
      },
      "South Indian Delights": {
        "Dosas": [
          {
            name: "Masala Dosa",
            price: 120,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/11/masala-dosa-recipe-1.jpg",
            description: "Crispy rice crepe filled with spiced potato filling",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Mysore Masala Dosa",
            price: 140,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2017/01/mysore-masala-dosa-recipe.jpg",
            description: "Dosa with spicy red chutney and potato filling",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Rava Dosa",
            price: 110,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2009/08/rava-dosa-recipe.jpg",
            description: "Crispy semolina crepe with onions and spices",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Idli & Vada": [
          {
            name: "Idli Sambar",
            price: 90,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/06/idli-sambar-1.jpg",
            description: "Steamed rice cakes served with lentil soup and chutney",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Medu Vada",
            price: 80,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2020/10/medu-vada-recipe-1.jpg",
            description: "Crispy fried lentil donuts served with sambar and chutney",
            isAvailable: true,
            quantity: 15
          }
        ],
        "Rice Varieties": [
          {
            name: "Curd Rice",
            price: 100,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/08/curd-rice-recipe-1.jpg",
            description: "Cooling rice dish with yogurt, tempered with spices",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Lemon Rice",
            price: 110,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2022/06/lemon-rice-recipe.jpg",
            description: "Tangy rice dish with lemon juice and tempered spices",
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
            image: "https://www.whiskaffair.com/wp-content/uploads/2020/08/Kosha-Mangsho-2-3.jpg",
            description: "Slow-cooked spicy mutton curry, a Bengali delicacy",
            isAvailable: true,
            quantity: 10
          },
          {
            name: "Shorshe Ilish",
            price: 320,
            image: "https://static.toiimg.com/thumb/53222760.cms?width=1200&height=900",
            description: "Hilsa fish cooked in mustard sauce, a Bengali specialty",
            isAvailable: true,
            quantity: 8
          }
        ],
        "Fish Curries": [
          {
            name: "Macher Jhol",
            price: 220,
            image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Madhuri_Aggarwal/Macher_Jhol_Bengali_Fish_Curry_Recipe-1.jpg",
            description: "Light fish curry with turmeric and cumin",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Chingri Malai Curry",
            price: 300,
            image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Shaheen_Ali/Chingri_Malai_Curry_Bengali_Style_Prawn_Curry_Recipe-1.jpg",
            description: "Prawns cooked in coconut milk curry",
            isAvailable: true,
            quantity: 10
          }
        ],
        "Sweets": [
          {
            name: "Rasgulla",
            price: 20,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2015/03/rasgulla-recipe.jpg",
            description: "Soft cottage cheese balls soaked in sugar syrup",
            isAvailable: true,
            quantity: 30
          },
          {
            name: "Mishti Doi",
            price: 60,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2017/09/mishti-doi-recipe.jpg",
            description: "Sweet yogurt dessert, a Bengali specialty",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Sandesh",
            price: 25,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2014/05/sandesh-recipe.jpg",
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
            image: "https://img.traveltriangle.com/blog/wp-content/uploads/2018/02/Gujarati-Thali-DP.jpg",
            description: "Complete meal with variety of dishes, rotis, rice, and dessert",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Mini Thali",
            price: 180,
            image: "https://media-cdn.tripadvisor.com/media/photo-s/0e/4f/05/6a/mini-gujarati-thali.jpg",
            description: "Smaller version of Gujarati thali with essential dishes",
            isAvailable: true,
            quantity: 20
          }
        ],
        "Farsan": [
          {
            name: "Dhokla",
            price: 80,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2009/08/dhokla-recipe.jpg",
            description: "Steamed savory cake made from fermented rice and chickpea flour",
            isAvailable: true,
            quantity: 20
          },
          {
            name: "Khandvi",
            price: 90,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2009/08/khandvi-recipe.jpg",
            description: "Soft gram flour rolls tempered with mustard seeds and curry leaves",
            isAvailable: true,
            quantity: 15
          },
          {
            name: "Fafda",
            price: 70,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2016/05/fafda-recipe.jpg",
            description: "Crispy gram flour snack served with chutney",
            isAvailable: true,
            quantity: 25
          }
        ],
        "Sabzis": [
          {
            name: "Undhiyu",
            price: 180,
            image: "https://www.vegrecipesofindia.com/wp-content/uploads/2018/12/undhiyu-recipe-1.jpg",
            description: "Mixed vegetable curry, a Gujarati winter specialty",
            isAvailable: true,
            quantity: 12
          },
          {
            name: "Ringan nu Shaak",
            price: 150,
            image: "https://www.archanaskitchen.com/images/archanaskitchen/1-Author/Jyothi_Rajesh/Ringana_Nu_Shaak_Recipe_Gujarati_Style_Brinjal_Curry.jpg",
            description: "Spicy eggplant curry cooked with traditional spices",
            isAvailable: true,
            quantity: 15
          }
        ]
      }
    };

    // Create food items for each seller and category
    for (const seller of createdSellers) {
      const sellerFoodItems = foodItemsData[seller.name] || {};
      const sellerCategories = createdCategories[seller.name] || [];
      
      for (const category of sellerCategories) {
        const categoryItems = sellerFoodItems[category.name] || [];
        
        for (const itemData of categoryItems) {
          // Download food item image
          const imageName = `food-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
          const imagePath = path.join(__dirname, '../../uploads/food', imageName);
          const imageUrl = `/uploads/food/${imageName}`;
          
          try {
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

    console.log('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();
