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
        totalAmount
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
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }

    const { foodItemId, quantity } = req.body;

    if (!foodItemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Food item ID and quantity are required' });
    }

    // Check if food item exists and is available
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (!foodItem.isAvailable) {
      return res.status(400).json({ message: 'Food item is not available' });
    }

    // Check if restaurant is open
    const seller = await Seller.findById(foodItem.restaurantId);
    if (!seller || seller.status !== 'open') {
      return res.status(400).json({ message: 'Restaurant is currently closed' });
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

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      cartId: cart._id,
      foodItemId
    });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += parseInt(quantity);
      cartItem.price = foodItem.price;
      await cartItem.save();
    } else {
      // Add new item
      cartItem = new CartItem({
        cartId: cart._id,
        foodItemId,
        quantity: parseInt(quantity),
        price: foodItem.price
      });
      await cartItem.save();
    }

    res.status(201).json({ 
      message: 'Item added to cart',
      cartItem: {
        id: cartItem._id,
        foodItemId: cartItem.foodItemId,
        quantity: cartItem.quantity,
        price: cartItem.price
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

    res.json({ 
      message: 'Cart item updated',
      cartItem: {
        id: cartItem._id,
        foodItemId: cartItem.foodItemId,
        quantity: cartItem.quantity,
        price: cartItem.price
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

    res.json({ message: 'Item removed from cart' });
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

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
