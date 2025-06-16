const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const verifyToken = require('../middleware/verifyToken');
const { uploadImage, deleteImage, extractPublicId } = require('../utils/cloudinary');

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
    cb(null, 'food-' + uniqueSuffix + ext);
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

// Helper function to handle image filenames
const processImageUrl = (imageUrl) => {
  // If it's already a full path (starts with /uploads/ or http), return as is
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, treat it as a filename in the food folder
  return `/uploads/food/${imageUrl}`;
};

const router = express.Router();

// Get all food items
// Get all food items or filter by sellerId query parameter
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.sellerId) {
      // Validate sellerId if provided
      if (!mongoose.Types.ObjectId.isValid(req.query.sellerId)) {
        return res.status(400).json({ message: 'Invalid seller ID format' });
      }
      filter.restaurantId = req.query.sellerId;
    }
    const foodItems = await FoodItem.find(filter)
      .populate('restaurantId', 'name address status')
      .populate('categoryId', 'name');
    
    res.json(foodItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get food items by category ID
router.get('/category/:categoryId', async (req, res) => {
  try {
    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const foodItems = await FoodItem.find({ categoryId: req.params.categoryId })
      .populate('restaurantId', 'name address status')
      .populate('categoryId', 'name')
      .lean();
    
    // Map _id to id for frontend consistency
    const mappedItems = foodItems.map(item => ({
      ...item,
      id: item._id,
      categoryId: item.categoryId._id,
      restaurantId: item.restaurantId._id
    }));
    
    console.log('Fetching food items for category ID:', req.params.categoryId);
    res.json(mappedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get food item by ID
router.get('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id)
      .populate('restaurantId', 'name address status')
      .populate('categoryId', 'name');
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    res.json(foodItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get food items by seller ID
router.get('/seller/:sellerId', async (req, res) => {
  // Validate seller ID
  if (!mongoose.Types.ObjectId.isValid(req.params.sellerId)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
  }
  try {
    const foodItems = await FoodItem.find({ restaurantId: req.params.sellerId })
      .populate('categoryId', 'name');
    console.log('Fetching food items for seller ID:', req.params.sellerId);
    res.json(foodItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// New route: Get food items by seller ID (menu route)
router.get('/:sellerId/menu', async (req, res) => {
  // Validate seller ID
  if (!mongoose.Types.ObjectId.isValid(req.params.sellerId)) {
    return res.status(400).json({ message: 'Invalid seller ID' });
  }
  try {
    const foodItems = await FoodItem.find({ restaurantId: req.params.sellerId })
      .populate('categoryId', 'name');
    console.log('Fetching food items for seller ID (menu route):', req.params.sellerId);
    res.json(foodItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new food item (Only seller can add)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { name, categoryId, price, description, quantity, isAvailable, imageUrl: providedImageUrl } = req.body;
    
    // Validate required fields
    if (!name || !categoryId || !price) {
      return res.status(400).json({ message: 'Name, category and price are required' });
    }
    
    // Verify category belongs to this seller
    const category = await Category.findOne({
      _id: categoryId,
      restaurantId: req.user.id
    });
    
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Create image URL if image was uploaded
    let imageUrl = '';
    let imagePublicId = '';
    
    if (req.file) {
      // Upload to Cloudinary
      const filePath = req.file.path;
      const result = await uploadImage(filePath, 'food');
      
      // Delete temporary file
      fs.unlinkSync(filePath);
      
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } else if (providedImageUrl) {
      imageUrl = providedImageUrl;
    }
    
    // Validate seller ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const newFood = new FoodItem({
      name,
      categoryId,
      restaurantId: req.user.id,
      price: parseFloat(price),
      imageUrl,
      imagePublicId,
      description: description || '',
      quantity: quantity ? parseInt(quantity) : 0,
      isAvailable: isAvailable === 'true'
    });
    
    await newFood.save();
    
    res.status(201).json({ 
      message: 'Food item created successfully', 
      foodItem: newFood 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a food item (Only seller can update)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { name, categoryId, price, description, quantity, isAvailable, imageUrl: providedImageUrl } = req.body;
    
    // Find the food item
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      restaurantId: req.user.id
    });
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    // If changing category, verify it belongs to this seller
    if (categoryId && categoryId !== foodItem.categoryId.toString()) {
      const category = await Category.findOne({
        _id: categoryId,
        restaurantId: req.user.id
      });
      
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      
      foodItem.categoryId = categoryId;
    }
    
    // Update fields
    if (name) foodItem.name = name;
    if (price) foodItem.price = parseFloat(price);
    if (description !== undefined) foodItem.description = description;
    if (quantity !== undefined) foodItem.quantity = parseInt(quantity);
    if (isAvailable !== undefined) foodItem.isAvailable = isAvailable === 'true';
    
    // Update image if new one was uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (foodItem.imageUrl && foodItem.imageUrl.includes('cloudinary') && foodItem.imagePublicId) {
        await deleteImage(foodItem.imagePublicId);
      }
      
      // Upload to Cloudinary
      const filePath = req.file.path;
      const result = await uploadImage(filePath, 'food');
      
      // Delete temporary file
      fs.unlinkSync(filePath);
      
      foodItem.imageUrl = result.secure_url;
      foodItem.imagePublicId = result.public_id;
    } else if (providedImageUrl && providedImageUrl !== foodItem.imageUrl) {
      // If it's a Cloudinary URL, use it directly
      foodItem.imageUrl = providedImageUrl;
    }
    
    await foodItem.save();
    
    res.status(200).json({ 
      message: 'Food item updated successfully', 
      foodItem 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a food item (Only seller can delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      restaurantId: req.user.id
    });
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    // Delete image from Cloudinary if it exists
    if (foodItem.imageUrl && foodItem.imageUrl.includes('cloudinary') && foodItem.imagePublicId) {
      await deleteImage(foodItem.imagePublicId);
    }
    
    await FoodItem.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Search food items
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const foodItems = await FoodItem.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('restaurantId', 'name address status')
    .populate('categoryId', 'name');
    
    res.json(foodItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Toggle food item availability (Only seller can update)
router.put('/:id/availability', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { isAvailable } = req.body;
    
    if (isAvailable === undefined) {
      return res.status(400).json({ message: 'isAvailable field is required' });
    }
    
    const foodItem = await FoodItem.findOne({
      _id: req.params.id,
      restaurantId: req.user.id
    });
    
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    
    foodItem.isAvailable = isAvailable;
    await foodItem.save();
    
    res.json({ 
      message: `Food item ${isAvailable ? 'enabled' : 'disabled'} successfully`, 
      foodItem 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
