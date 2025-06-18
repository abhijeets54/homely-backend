const express = require('express');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const FoodItem = require('../models/FoodItem');
const Seller = require('../models/Seller');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ 
      customerId: req.user.id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({
        customerId: req.user.id,
        status: 'active'
      });
      await cart.save();
    }

    // Get cart items with food item details
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate({
        path: 'foodItemId',
        select: 'name price imageUrl isAvailable restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'name status'
        }
      });

    // Group items by restaurant
    const restaurantMap = new Map();
    
    for (const item of cartItems) {
      const restaurant = item.foodItemId.restaurantId;
      const restaurantId = restaurant._id.toString();
      
      if (!restaurantMap.has(restaurantId)) {
        restaurantMap.set(restaurantId, {
          restaurant: {
            id: restaurantId,
            name: restaurant.name,
            status: restaurant.status
          },
          items: []
        });
      }
      
      restaurantMap.get(restaurantId).items.push({
        id: item._id,
        foodItem: {
          id: item.foodItemId._id,
          name: item.foodItemId.name,
          price: item.foodItemId.price,
          imageUrl: item.foodItemId.imageUrl,
          isAvailable: item.foodItemId.isAvailable
        },
        quantity: item.quantity,
        price: item.price
      });
    }
    
    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    
    for (const restaurant of restaurantMap.values()) {
      let restaurantTotal = 0;
      
      for (const item of restaurant.items) {
        totalItems += item.quantity;
        restaurantTotal += item.price * item.quantity;
      }
      
      restaurant.total = restaurantTotal;
      totalAmount += restaurantTotal;
    }

    res.json({
      cart: {
        id: cart._id,
        restaurants: Array.from(restaurantMap.values()),
        totalItems,
        totalAmount,
        items: cartItems.map(item => ({
          id: item._id,
          foodItemId: item.foodItemId._id,
          foodItem: {
            id: item.foodItemId._id,
            name: item.foodItemId.name,
            price: item.foodItemId.price,
            imageUrl: item.foodItemId.imageUrl,
            isAvailable: item.foodItemId.isAvailable
          },
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add item to cart
router.post('/items', verifyToken, async (req, res) => {
  try {
    console.log('Add to cart request received:', {
      userId: req.user.id,
      role: req.user.role,
      body: req.body
    });

    if (req.user.role !== 'customer') {
      console.log('Access denied: User is not a customer');
      return res.status(403).json({ message: 'Access Denied' });
    }

    const { foodItemId, quantity } = req.body;

    if (!foodItemId || !quantity || quantity < 1) {
      console.log('Invalid request: Missing foodItemId or quantity');
      return res.status(400).json({ message: 'Food item ID and quantity are required' });
    }

    // Check if food item exists and is available
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      console.log('Food item not found:', foodItemId);
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (!foodItem.isAvailable) {
      console.log('Food item not available:', foodItemId);
      return res.status(400).json({ message: 'Food item is not available' });
    }

    // Check if restaurant is open
    const seller = await Seller.findById(foodItem.restaurantId);
    if (!seller || seller.status !== 'open') {
      console.log('Restaurant closed:', seller?.status);
      return res.status(400).json({ message: 'Restaurant is currently closed' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ 
      customerId: req.user.id,
      status: 'active'
    });

    console.log('Existing cart found:', !!cart);

    if (!cart) {
      cart = new Cart({
        customerId: req.user.id,
        status: 'active'
      });
      await cart.save();
      console.log('New cart created:', cart._id);
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      cartId: cart._id,
      foodItemId
    });

    console.log('Existing cart item found:', !!cartItem);

    if (cartItem) {
      // Update quantity
      cartItem.quantity += parseInt(quantity);
      cartItem.price = foodItem.price;
      await cartItem.save();
      console.log('Cart item quantity updated:', cartItem.quantity);
    } else {
      // Add new item
      cartItem = new CartItem({
        cartId: cart._id,
        foodItemId,
        quantity: parseInt(quantity),
        price: foodItem.price
      });
      await cartItem.save();
      console.log('New cart item created:', cartItem._id);
    }

    // Get all cart items with food item details (similar to GET /cart)
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate({
        path: 'foodItemId',
        select: 'name price imageUrl isAvailable restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'name status'
        }
      });

    // Group items by restaurant
    const restaurantMap = new Map();
    
    for (const item of cartItems) {
      const restaurant = item.foodItemId.restaurantId;
      const restaurantId = restaurant._id.toString();
      
      if (!restaurantMap.has(restaurantId)) {
        restaurantMap.set(restaurantId, {
          restaurant: {
            id: restaurantId,
            name: restaurant.name,
            status: restaurant.status
          },
          items: []
        });
      }
      
      restaurantMap.get(restaurantId).items.push({
        id: item._id,
        foodItem: {
          id: item.foodItemId._id,
          name: item.foodItemId.name,
          price: item.foodItemId.price,
          imageUrl: item.foodItemId.imageUrl,
          isAvailable: item.foodItemId.isAvailable
        },
        quantity: item.quantity,
        price: item.price
      });
    }
    
    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    
    for (const restaurant of restaurantMap.values()) {
      let restaurantTotal = 0;
      
      for (const item of restaurant.items) {
        totalItems += item.quantity;
        restaurantTotal += item.price * item.quantity;
      }
      
      restaurant.total = restaurantTotal;
      totalAmount += restaurantTotal;
    }

    console.log('Item successfully added to cart');
    res.status(201).json({ 
      message: 'Item added to cart',
      cartItem: {
        id: cartItem._id,
        foodItemId: cartItem.foodItemId,
        quantity: cartItem.quantity,
        price: cartItem.price
      },
      cart: {
        id: cart._id,
        restaurants: Array.from(restaurantMap.values()),
        totalItems,
        totalAmount,
        items: cartItems.map(item => ({
          id: item._id,
          foodItemId: item.foodItemId._id,
          foodItem: {
            id: item.foodItemId._id,
            name: item.foodItemId.name,
            price: item.foodItemId.price,
            imageUrl: item.foodItemId.imageUrl,
            isAvailable: item.foodItemId.isAvailable
          },
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update cart item quantity
router.put('/items/:itemId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      customerId: req.user.id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      _id: req.params.itemId,
      cartId: cart._id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update quantity
    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    // Get all cart items with food item details
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate({
        path: 'foodItemId',
        select: 'name price imageUrl isAvailable restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'name status'
        }
      });

    // Group items by restaurant
    const restaurantMap = new Map();
    
    for (const item of cartItems) {
      const restaurant = item.foodItemId.restaurantId;
      const restaurantId = restaurant._id.toString();
      
      if (!restaurantMap.has(restaurantId)) {
        restaurantMap.set(restaurantId, {
          restaurant: {
            id: restaurantId,
            name: restaurant.name,
            status: restaurant.status
          },
          items: []
        });
      }
      
      restaurantMap.get(restaurantId).items.push({
        id: item._id,
        foodItem: {
          id: item.foodItemId._id,
          name: item.foodItemId.name,
          price: item.foodItemId.price,
          imageUrl: item.foodItemId.imageUrl,
          isAvailable: item.foodItemId.isAvailable
        },
        quantity: item.quantity,
        price: item.price
      });
    }
    
    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    
    for (const restaurant of restaurantMap.values()) {
      let restaurantTotal = 0;
      
      for (const item of restaurant.items) {
        totalItems += item.quantity;
        restaurantTotal += item.price * item.quantity;
      }
      
      restaurant.total = restaurantTotal;
      totalAmount += restaurantTotal;
    }

    res.json({ 
      message: 'Cart item updated',
      cartItem: {
        id: cartItem._id,
        foodItemId: cartItem.foodItemId,
        quantity: cartItem.quantity,
        price: cartItem.price
      },
      cart: {
        id: cart._id,
        restaurants: Array.from(restaurantMap.values()),
        totalItems,
        totalAmount,
        items: cartItems.map(item => ({
          id: item._id,
          foodItemId: item.foodItemId._id,
          foodItem: {
            id: item.foodItemId._id,
            name: item.foodItemId.name,
            price: item.foodItemId.price,
            imageUrl: item.foodItemId.imageUrl,
            isAvailable: item.foodItemId.isAvailable
          },
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove item from cart
router.delete('/items/:itemId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      customerId: req.user.id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find and remove cart item
    const cartItem = await CartItem.findOne({
      _id: req.params.itemId,
      cartId: cart._id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.deleteOne();

    // Get remaining cart items to return updated cart data
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate({
        path: 'foodItemId',
        select: 'name price imageUrl isAvailable restaurantId',
        populate: {
          path: 'restaurantId',
          select: 'name status'
        }
      });

    // Group items by restaurant
    const restaurantMap = new Map();
    
    for (const item of cartItems) {
      const restaurant = item.foodItemId.restaurantId;
      const restaurantId = restaurant._id.toString();
      
      if (!restaurantMap.has(restaurantId)) {
        restaurantMap.set(restaurantId, {
          restaurant: {
            id: restaurantId,
            name: restaurant.name,
            status: restaurant.status
          },
          items: []
        });
      }
      
      restaurantMap.get(restaurantId).items.push({
        id: item._id,
        foodItem: {
          id: item.foodItemId._id,
          name: item.foodItemId.name,
          price: item.foodItemId.price,
          imageUrl: item.foodItemId.imageUrl,
          isAvailable: item.foodItemId.isAvailable
        },
        quantity: item.quantity,
        price: item.price
      });
    }
    
    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;
    
    for (const restaurant of restaurantMap.values()) {
      let restaurantTotal = 0;
      
      for (const item of restaurant.items) {
        totalItems += item.quantity;
        restaurantTotal += item.price * item.quantity;
      }
      
      restaurant.total = restaurantTotal;
      totalAmount += restaurantTotal;
    }

    res.json({ 
      message: 'Item removed from cart',
      cart: {
        id: cart._id,
        restaurants: Array.from(restaurantMap.values()),
        totalItems,
        totalAmount,
        items: cartItems.map(item => ({
          id: item._id,
          foodItemId: item.foodItemId._id,
          foodItem: {
            id: item.foodItemId._id,
            name: item.foodItemId.name,
            price: item.foodItemId.price,
            imageUrl: item.foodItemId.imageUrl,
            isAvailable: item.foodItemId.isAvailable
          },
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    // Find cart
    const cart = await Cart.findOne({ 
      customerId: req.user.id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove all cart items
    await CartItem.deleteMany({ cartId: cart._id });

    // Return empty cart response with the same structure for consistency
    res.json({ 
      message: 'Cart cleared successfully',
      cart: {
        id: cart._id,
        restaurants: [],
        totalItems: 0,
        totalAmount: 0,
        items: []
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
