const express = require('express');
const Seller = require('../models/Seller');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteImage, extractPublicId } = require('../utils/cloudinary');


const router = express.Router();

// Get all sellers
router.get('/', async (req, res) => {
    try {
        const sellers = await Seller.find().select('name address status rating image imageUrl');
        res.json(sellers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get seller profile - Seller only
router.get('/profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const seller = await Seller.findById(req.user.id).select('-password');
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        res.json(seller);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get seller by ID
router.get('/:id', async (req, res) => {
    try {
        const sellerId = req.params.id;
        console.log('Fetching seller with ID:', sellerId); // Log the seller ID being fetched
        
        // Check if sellerId is undefined or not a valid ObjectId
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }
        
        const seller = await Seller.findById(sellerId).select('name address status rating image imageUrl');
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        res.json(seller);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update seller profile - Seller only
router.put('/profile', verifyToken, async (req, res) => {
    try {
        console.log('Update seller profile - Request body:', req.body);
        console.log('User from token:', req.user);
        
        if (req.user.role !== 'seller') {
            console.log('Access denied - User role is not seller:', req.user.role);
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const { name, phone, address, description, cuisineType, imageUrl, openingTime, closingTime, minimumOrder, deliveryRadius } = req.body;
        
        console.log('Looking up seller with ID:', req.user.id);
        const seller = await Seller.findById(req.user.id);
        
        if (!seller) {
            console.log('Seller not found with ID:', req.user.id);
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        console.log('Found seller:', seller.name, seller._id.toString());
        
        // Update fields if provided
        if (name) seller.name = name;
        if (phone) seller.phone = phone;
        if (address) seller.address = address;
        if (description) seller.description = description;
        if (cuisineType) seller.cuisineType = cuisineType;
        if (imageUrl !== undefined) seller.imageUrl = imageUrl;
        if (openingTime) seller.openingTime = openingTime;
        if (closingTime) seller.closingTime = closingTime;
        if (minimumOrder !== undefined) seller.minimumOrder = minimumOrder;
        if (deliveryRadius !== undefined) seller.deliveryRadius = deliveryRadius;
        
        console.log('Saving updated seller profile');
        await seller.save();
        console.log('Seller profile saved successfully');
        
        // Remove password from response
        const sellerObj = seller.toObject();
        delete sellerObj.password;
        
        console.log('Sending response');
        res.json({
            message: 'Profile updated successfully',
            seller: sellerObj
        });
    } catch (err) {
        console.error('Error updating seller profile:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
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
        
        // Check if sellerId is valid
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }
        
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

// Configure multer for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../temp');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'seller-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        
        cb(new Error('Only .jpeg, .jpg, .png, and .webp files are allowed'));
    }
});

// Route to add an image for a seller
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        // Delete old image from Cloudinary if it exists
        if (seller.imageUrl && seller.imageUrl.includes('cloudinary')) {
            const publicId = extractPublicId(seller.imageUrl);
            if (publicId) {
                await deleteImage(publicId);
            }
        }
        
        // Upload to Cloudinary
        const filePath = req.file.path;
        const result = await uploadImage(filePath, 'seller');
        
        // Delete temporary file
        fs.unlinkSync(filePath);
        
        // Save the Cloudinary URL to the seller
        seller.imageUrl = result.secure_url;
        seller.imagePublicId = result.public_id;
        await seller.save();
        
        res.status(200).json({ 
            message: 'Image uploaded successfully', 
            seller: {
                ...seller.toObject(),
                id: seller._id
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error });
    }
});

module.exports = router;
