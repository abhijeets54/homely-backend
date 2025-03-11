const express = require('express');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');
const verifyToken = require('../middleware/verifyToken'); // Import the new middleware

const router = express.Router();

/**
 * 📌 Place a New Order
 * ✅ Only authenticated customers can place an order
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Access Denied' });

    const { restaurantId, items, totalPrice } = req.body;

    // Validate input
    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    // Create Order
    const newOrder = new Order({
      restaurantId,
      userId: req.user.id,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await newOrder.save();

    // Add Order Items
    for (const item of items) {

      // console.log(`Processing item: ${JSON.stringify(item)}`); // Log the current item being processed
      
      const food = await FoodItem.findById(item.foodItemId);

      // console.log(`Food item restaurantId: ${food.restaurantId}`); // Log the restaurantId of the food item
      // console.log(`Food item found: ${JSON.stringify(food)}`); // Log the result of the food item query

      if (!food || food.restaurantId.toString() !== restaurantId) {
        return res.status(400).json({ message: 'Invalid food item' });
      }

      const orderItem = new OrderItem({
        orderId: newOrder._id,
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: item.price,
      });

      await orderItem.save();
    }

    res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * 📌 Get Orders for a Customer
 * ✅ Only authenticated customers can view their orders
 */
router.get('/customer', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Access Denied' });

    const orders = await Order.find({ userId: req.user.id }).select('totalPrice status paymentStatus restaurantId');
    
    // Format the response to include only the restaurantId as a simple field
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      restaurantId: order.restaurantId // This will be the ID of the restaurant
    }));

    res.json(formattedOrders);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * 📌 Get Orders for a Restaurant
 * ✅ Only authenticated sellers can view orders placed in their restaurant
 */
router.get('/restaurant', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Access Denied' });

    const orders = await Order.find({ restrauntId: req.user.if}).select('userId totalPrice status paymentStatus');

    // Format the response to include only the userId and restaurantId as simple fields
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      userId: order.userId, // This will be the ID of the customer
      totalPrice: order.totalPrice,
      status:order.status,
      paymentStatus: order.paymentStatus,
      restrauntId: req.user.id // This will be the ID of the restaurant
    }));
    res.json(formattedOrders);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * 📌 Get a Specific Order by ID
 * ✅ Only authenticated users can view their orders
 */
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('restaurantId', '_id'); // Only include the ID of the restaurant
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({
      _id: order._id,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      restaurantId: order.restaurantId // This will be the ID of the restaurant
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * 📌 Update Order Status (Preparing → Out for Delivery → Delivered)
 * ✅ Only sellers can update order status
 */
router.put('/:orderId/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Access Denied' });

    const { status } = req.body;
    if (!['pending', 'preparing', 'out for delivery', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order || order.restaurantId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * 📌 Update Payment Status (Pending → Paid)
 * ✅ Only customers can update payment status (after successful payment)
 */
router.put('/:orderId/payment', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Access Denied' });

    const order = await Order.findById(req.params.orderId);
    if (!order || order.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    await order.save();

    res.json({ message: 'Payment successful', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
