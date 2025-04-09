const express = require('express');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get all categories for a seller
router.get('/seller/:sellerId', async (req, res) => {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return res.status(400).json({ message: 'Invalid sellerId' });
    }

    try {
        const categories = await Category.find({ restaurantId: sellerId });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create a new category (seller only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const newCategory = new Category({
            name,
            restaurantId: req.user.id
        });
        
        await newCategory.save();
        
        res.status(201).json({ 
            message: 'Category created successfully',
            category: newCategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update a category (seller only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        
        const category = await Category.findOne({
            _id: req.params.id,
            restaurantId: req.user.id
        });
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        category.name = name;
        await category.save();
        
        res.json({ 
            message: 'Category updated successfully',
            category
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a category (seller only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Access Denied' });
        }
        
        const category = await Category.findOne({
            _id: req.params.id,
            restaurantId: req.user.id
        });
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        // Check if there are food items in this category
        const foodItems = await FoodItem.countDocuments({ categoryId: category._id });
        
        if (foodItems > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete category with food items. Please move or delete the food items first.' 
            });
        }
        
        await category.deleteOne();
        
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get food items by category
router.get('/:categoryId/food-items', async (req, res) => {
    try {
        const foodItems = await FoodItem.find({ categoryId: req.params.categoryId });
        res.json(foodItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
