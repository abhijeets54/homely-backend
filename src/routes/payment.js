const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');
const crypto = require('crypto');

const router = express.Router();

// Create a payment intent (customer only)
router.post('/create-intent', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { orderId, paymentMethod } = req.body;
    
    if (!orderId || !paymentMethod) {
      return res.status(400).json({ message: 'Order ID and payment method are required' });
    }
    
    // Verify payment method is valid
    const validPaymentMethods = ['cod', 'online', 'upi'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this order' });
    }
    
    // Generate a transaction ID
    const transactionId = crypto.randomBytes(16).toString('hex');
    
    // Create payment record
    const payment = new Payment({
      orderId,
      userId: req.user.id,
      amount: order.totalPrice,
      paymentMethod,
      transactionId,
      status: paymentMethod === 'cod' ? 'pending' : 'initiated'
    });
    
    await payment.save();
    
    // If COD, update order status directly
    if (paymentMethod === 'cod') {
      order.paymentStatus = 'pending';
      await order.save();
      
      return res.status(201).json({
        message: 'Cash on delivery payment method selected',
        payment
      });
    }
    
    // For online payments, in a real app we would integrate with a payment gateway
    // For this demo, we'll simulate a payment gateway response
    
    // Mock payment gateway data
    const paymentIntent = {
      id: transactionId,
      amount: order.totalPrice,
      currency: 'inr',
      status: 'requires_payment_method',
      client_secret: `${transactionId}_secret_${Date.now()}`
    };
    
    res.status(201).json({
      message: 'Payment intent created',
      payment,
      paymentIntent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Confirm payment (customer only)
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }
    
    // Find the payment
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user.id
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment is already completed or failed
    if (['completed', 'failed'].includes(payment.status)) {
      return res.status(400).json({ message: `Payment already ${payment.status}` });
    }
    
    // For COD, payment should be confirmed upon delivery
    if (payment.paymentMethod === 'cod') {
      return res.status(400).json({ message: 'Cash on delivery payments are confirmed upon delivery' });
    }
    
    // Update payment status
    payment.status = 'completed';
    payment.paidAt = Date.now();
    await payment.save();
    
    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'paid' });
    
    res.json({
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark COD payment as received (delivery partner only)
router.post('/cod/confirm', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    // Find the payment
    const payment = await Payment.findOne({ orderId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment method is COD
    if (payment.paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'Payment method is not cash on delivery' });
    }
    
    // Check if payment is already completed
    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    
    // Update payment status
    payment.status = 'completed';
    payment.paidAt = Date.now();
    await payment.save();
    
    // Update order payment status
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });
    
    res.json({
      message: 'COD payment marked as received',
      payment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Cancel payment (customer only)
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }
    
    // Find the payment
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user.id
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment is already completed
    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed payment' });
    }
    
    // Update payment status
    payment.status = 'cancelled';
    await payment.save();
    
    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'cancelled' });
    
    res.json({
      message: 'Payment cancelled successfully',
      payment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get payment details for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permission
    if (req.user.role === 'customer' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    } else if (req.user.role === 'seller' && order.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get payment
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    
    if (!payment) {
      return res.status(404).json({ message: 'No payment found for this order' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get payment history for customer
router.get('/history', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const payments = await Payment.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber createdAt')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get payment statistics for seller
router.get('/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get all orders for this seller
    const orders = await Order.find({ restaurantId: req.user.id });
    const orderIds = orders.map(order => order._id);
    
    // Get payments for these orders
    const payments = await Payment.find({ orderId: { $in: orderIds } });
    
    // Calculate statistics
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const cancelledPayments = payments.filter(p => p.status === 'cancelled').length;
    
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const codPayments = payments.filter(p => p.paymentMethod === 'cod').length;
    const onlinePayments = payments.filter(p => p.paymentMethod === 'online').length;
    const upiPayments = payments.filter(p => p.paymentMethod === 'upi').length;
    
    res.json({
      totalPayments,
      completedPayments,
      pendingPayments,
      cancelledPayments,
      totalRevenue,
      paymentMethods: {
        cod: codPayments,
        online: onlinePayments,
        upi: upiPayments
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
