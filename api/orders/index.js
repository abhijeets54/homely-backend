const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const auth = require('../../middleware/auth');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      items,
      total,
      deliveryAddress,
      specialInstructions,
      status,
      paymentMethod,
      restaurantId
    } = req.body;

    // Validate required fields
    if (!userId || !items || !items.length || !total || !deliveryAddress || !restaurantId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new order
    const newOrder = new Order({
      userId,
      items,
      total,
      deliveryAddress,
      specialInstructions: specialInstructions || '',
      status: status || 'pending',
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      restaurantId
    });

    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (with optional filtering)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by user ID
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    
    // Filter by restaurant ID
    if (req.query.restaurantId) {
      query.restaurantId = req.query.restaurantId;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Get orders with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check authorization - only restaurant owner or admin can update status
    const isAuthorized = 
      req.user.role === 'admin' || 
      (req.user.role === 'seller' && order.restaurantId === req.user.restaurantId);
      
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders for customer dashboard
router.get('/customer/:userId', auth, async (req, res) => {
  try {
    // Ensure user can only access their own orders
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders for seller dashboard
router.get('/seller/:restaurantId', auth, async (req, res) => {
  try {
    // Ensure seller can only access their own restaurant's orders
    if (req.user.restaurantId !== req.params.restaurantId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    
    const orders = await Order.find({ restaurantId: req.params.restaurantId })
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 