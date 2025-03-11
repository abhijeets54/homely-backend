const express = require('express');
const Seller = require('../models/Seller');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get all sellers
router.get('/', async (req, res) => {
    try {
        const sellers = await Seller.find().select('name address status rating');
        res.json(sellers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get seller by ID
router.get('/:id', async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id).select('name address status rating');
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        res.json(seller);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update seller status (open/closed) - Seller only
router.put('/status', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const { status } = req.body;
        
        if (!status || !['open', 'close'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const seller = await Seller.findById(req.user.id);
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        seller.status = status;
        await seller.save();
        
        res.json({ message: 'Status updated successfully', status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get seller's menu (categories and food items)
router.get('/:id/menu', async (req, res) => {
    try {
        const sellerId = req.params.id;
        
        // Get categories for this seller
        const categories = await Category.find({ restaurantId: sellerId });
        
        // Get food items for this seller
        const foodItems = await FoodItem.find({ restaurantId: sellerId });
        
        // Organize food items by category
        const menu = categories.map(category => {
            const items = foodItems.filter(item => 
                item.categoryId.toString() === category._id.toString()
            );
            
            return {
                category: {
                    id: category._id,
                    name: category.name
                },
                items: items.map(item => ({
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    isAvailable: item.isAvailable,
                    quantity: item.quantity
                }))
            };
        });
        
        res.json(menu);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all orders for a seller
router.get('/orders', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const orders = await Order.find({ restaurantId: req.user.id })
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get seller dashboard stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        // Get total number of orders
        const totalOrders = await Order.countDocuments({ restaurantId: req.user.id });
        
        // Get orders by status
        const pendingOrders = await Order.countDocuments({ 
            restaurantId: req.user.id,
            status: 'pending'
        });
        
        const preparingOrders = await Order.countDocuments({ 
            restaurantId: req.user.id,
            status: 'preparing'
        });
        
        const deliveringOrders = await Order.countDocuments({ 
            restaurantId: req.user.id,
            status: 'out for delivery'
        });
        
        const completedOrders = await Order.countDocuments({ 
            restaurantId: req.user.id,
            status: 'delivered'
        });
        
        // Get total revenue
        const orders = await Order.find({ 
            restaurantId: req.user.id,
            status: 'delivered',
            paymentStatus: 'paid'
        });
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        // Get total number of menu items
        const totalMenuItems = await FoodItem.countDocuments({ restaurantId: req.user.id });
        
        res.json({
            totalOrders,
            ordersByStatus: {
                pending: pendingOrders,
                preparing: preparingOrders,
                delivering: deliveringOrders,
                completed: completedOrders
            },
            totalRevenue,
            totalMenuItems
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
