const axios = require('axios');

// Function to fetch and display data from API endpoints
async function checkData() {
  try {
    console.log('Checking Sellers Data:');
    const sellersResponse = await axios.get('http://localhost:5000/api/seller');
    console.log(`Found ${sellersResponse.data.length} sellers`);
    sellersResponse.data.forEach(seller => {
      console.log(`- ${seller.name} (${seller.status})`);
    });
    
    // If we have sellers, check the first seller's menu
    if (sellersResponse.data.length > 0) {
      const firstSellerId = sellersResponse.data[0]._id;
      console.log(`\nChecking Menu for seller: ${sellersResponse.data[0].name}`);
      
      // Get categories for this seller
      const categoriesResponse = await axios.get(`http://localhost:5000/api/category/seller/${firstSellerId}`);
      console.log(`Found ${categoriesResponse.data.length} categories`);
      categoriesResponse.data.forEach(category => {
        console.log(`- ${category.name}`);
      });
      
      // Get food items for this seller
      const foodItemsResponse = await axios.get(`http://localhost:5000/api/food/seller/${firstSellerId}`);
      console.log(`\nFound ${foodItemsResponse.data.length} food items`);
      foodItemsResponse.data.forEach(item => {
        console.log(`- ${item.name} (₹${item.price}) - ${item.isAvailable ? 'Available' : 'Not Available'}`);
      });
      
      // Get menu structure
      const menuResponse = await axios.get(`http://localhost:5000/api/seller/${firstSellerId}/menu`);
      console.log(`\nMenu Structure:`);
      menuResponse.data.forEach(menuCategory => {
        console.log(`Category: ${menuCategory.category.name}`);
        console.log(`Items (${menuCategory.items.length}):`);
        menuCategory.items.forEach(item => {
          console.log(`  - ${item.name} (₹${item.price})`);
        });
        console.log('');
      });
    }
    
    console.log('Data check completed successfully!');
  } catch (error) {
    console.error('Error checking data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the check function
checkData();
