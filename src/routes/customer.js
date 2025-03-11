const express = require('express');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get customer profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const customer = await Customer.findById(req.user.id).select('-password');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update customer profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const { name, phone, address } = req.body;
        
        const customer = await Customer.findById(req.user.id);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Update fields
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (address) customer.address = address;
        
        await customer.save();
        
        res.json({ 
            message: 'Profile updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get customer order history
router.get('/orders', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const orders = await Order.find({ userId: req.user.id })
            .populate('restaurantId', 'name address')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get customer order details
router.get('/orders/:orderId', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const order = await Order.findOne({ 
            _id: req.params.orderId,
            userId: req.user.id
        }).populate('restaurantId', 'name address');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Get order items
        const orderItems = await OrderItem.find({ orderId: order._id })
            .populate('foodItemId', 'name price imageUrl');
        
        res.json({
            order,
            items: orderItems
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get customer dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        // Get total number of orders
        const totalOrders = await Order.countDocuments({ userId: req.user.id });
        
        // Get pending orders
        const pendingOrders = await Order.countDocuments({ 
            userId: req.user.id,
            status: { $in: ['pending', 'preparing', 'out for delivery'] }
        });
        
        // Get completed orders
        const completedOrders = await Order.countDocuments({ 
            userId: req.user.id,
            status: 'delivered'
        });
        
        // Get total spent
        const orders = await Order.find({ 
            userId: req.user.id,
            paymentStatus: 'paid'
        });
        
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
