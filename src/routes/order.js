const express = require('express');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const FoodItem = require('../models/FoodItem');
const Seller = require('../models/Seller');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Create a new order (customer only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { cartId, deliveryAddress, deliveryInstructions } = req.body;
    
    if (!cartId) {
      return res.status(400).json({ message: 'Cart ID is required' });
    }
    
    // Find the cart
    const cart = await Cart.findOne({
      _id: cartId,
      userId: req.user.id
    });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Check if cart is empty
    const cartItems = await CartItem.find({ cartId })
      .populate('foodItemId');
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check if all items are from the same restaurant
    const restaurantId = cartItems[0].foodItemId.restaurantId;
    const allSameRestaurant = cartItems.every(item => 
      item.foodItemId.restaurantId.toString() === restaurantId.toString()
    );
    
    if (!allSameRestaurant) {
      return res.status(400).json({ 
        message: 'All items must be from the same restaurant' 
      });
    }
    
    // Get restaurant details
    const restaurant = await Seller.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Calculate order total
    let subtotal = 0;
    let totalItems = 0;
    
    cartItems.forEach(item => {
      subtotal += item.foodItemId.price * item.quantity;
      totalItems += item.quantity;
    });
    
    // Calculate delivery fee (simplified)
    const deliveryFee = 40; // Fixed delivery fee
    
    // Calculate taxes (simplified)
    const taxRate = 0.05; // 5% tax
    const taxAmount = subtotal * taxRate;
    
    // Calculate total
    const totalPrice = subtotal + deliveryFee + taxAmount;
    
    // Generate order number
    const orderNumber = `ORD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
    
    // Create order
    const order = new Order({
      orderNumber,
      userId: req.user.id,
      restaurantId,
      subtotal,
      deliveryFee,
      taxAmount,
      totalPrice,
      totalItems,
      deliveryAddress: deliveryAddress || req.user.address,
      deliveryInstructions: deliveryInstructions || '',
      status: 'placed',
      paymentStatus: 'pending'
    });
    
    await order.save();
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      orderId: order._id,
      foodItemId: item.foodItemId._id,
      name: item.foodItemId.name,
      price: item.foodItemId.price,
      quantity: item.quantity,
      totalPrice: item.foodItemId.price * item.quantity
    }));
    
    await OrderItem.insertMany(orderItems);
    
    // Clear the cart
    await CartItem.deleteMany({ cartId });
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();
    
    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        ...order.toObject(),
        items: orderItems
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all orders for a customer
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all orders for a seller
router.get('/restaurant-orders', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { status } = req.query;
    
    let query = { restaurantId: req.user.id };
    
    if (status && ['placed', 'preparing', 'out for delivery', 'delivered', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.orderId)
      .populate('restaurantId', 'name address phone imageUrl')
      .populate('userId', 'name phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permission
    if (req.user.role === 'customer' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    } else if (req.user.role === 'seller' && order.restaurantId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get order items
    const orderItems = await OrderItem.find({ orderId: req.params.orderId })
      .populate('foodItemId', 'imageUrl');
    
    res.json({
      ...order.toObject(),
      items: orderItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update order status (seller only)
router.put('/:orderId/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { status } = req.body;
    
    if (!status || !['placed', 'preparing', 'out for delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    // Find the order
    const order = await Order.findOne({
      _id: req.params.orderId,
      restaurantId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if status transition is valid
    const validTransitions = {
      'placed': ['preparing', 'cancelled'],
      'preparing': ['out for delivery', 'cancelled'],
      'out for delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${order.status} to ${status}` 
      });
    }
    
    // Update order status
    order.status = status;
    
    if (status === 'cancelled') {
      order.cancelledAt = Date.now();
    }
    
    await order.save();
    
    res.json({
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Cancel order (customer only)
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Find the order
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (!['placed', 'preparing'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    await order.save();
    
    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get order statistics for seller
router.get('/stats/seller', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get all orders for this seller
    const orders = await Order.find({ restaurantId: req.user.id });
    
    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => ['placed', 'preparing', 'out for delivery'].includes(o.status)).length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    // Get order items to find most popular items
    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate('foodItemId', 'name');
    
    // Calculate most popular items
    const itemCounts = {};
    orderItems.forEach(item => {
      const itemName = item.foodItemId ? item.foodItemId.name : item.name;
      if (!itemCounts[itemName]) {
        itemCounts[itemName] = 0;
      }
      itemCounts[itemName] += item.quantity;
    });
    
    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      popularItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get order statistics for customer
router.get('/stats/customer', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get all orders for this customer
    const orders = await Order.find({ userId: req.user.id });
    
    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => ['placed', 'preparing', 'out for delivery'].includes(o.status)).length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    
    // Get frequently ordered restaurants
    const restaurantCounts = {};
    orders.forEach(order => {
      const restaurantId = order.restaurantId.toString();
      if (!restaurantCounts[restaurantId]) {
        restaurantCounts[restaurantId] = 0;
      }
      restaurantCounts[restaurantId]++;
    });
    
    // Get restaurant details
    const restaurantIds = Object.keys(restaurantCounts);
    const restaurants = await Seller.find({ _id: { $in: restaurantIds } })
      .select('name');
    
    const restaurantMap = {};
    restaurants.forEach(restaurant => {
      restaurantMap[restaurant._id.toString()] = restaurant.name;
    });
    
    const favoriteRestaurants = Object.entries(restaurantCounts)
      .map(([id, count]) => ({ 
        id, 
        name: restaurantMap[id] || 'Unknown Restaurant', 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalSpent,
      favoriteRestaurants
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
