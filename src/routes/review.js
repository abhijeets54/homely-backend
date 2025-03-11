const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const FoodItem = require('../models/FoodItem');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ sellerId: req.params.sellerId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get reviews for a food item
router.get('/food/:foodItemId', async (req, res) => {
  try {
    const reviews = await Review.find({ foodItemId: req.params.foodItemId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a review (customer only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { sellerId, foodItemId, orderId, rating, comment } = req.body;
    
    if (!sellerId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Seller ID and valid rating (1-5) are required' });
    }
    
    // Verify the seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    // If food item ID is provided, verify it exists and belongs to the seller
    if (foodItemId) {
      const foodItem = await FoodItem.findById(foodItemId);
      if (!foodItem || foodItem.restaurantId.toString() !== sellerId) {
        return res.status(400).json({ message: 'Invalid food item' });
      }
    }
    
    // If order ID is provided, verify it exists and belongs to the customer
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.userId.toString() !== req.user.id || order.restaurantId.toString() !== sellerId) {
        return res.status(400).json({ message: 'Invalid order' });
      }
      
      // Check if order is delivered
      if (order.status !== 'delivered') {
        return res.status(400).json({ message: 'Cannot review an order that has not been delivered' });
      }
      
      // Check if review already exists for this order
      const existingReview = await Review.findOne({ orderId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this order' });
      }
    }
    
    // Create the review
    const review = new Review({
      userId: req.user.id,
      sellerId,
      foodItemId,
      orderId,
      rating,
      comment: comment || ''
    });
    
    await review.save();
    
    // Update seller rating
    const allReviews = await Review.find({ sellerId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    seller.rating = parseFloat(averageRating.toFixed(1));
    await seller.save();
    
    // If food item review, update food item rating
    if (foodItemId) {
      const foodItemReviews = await Review.find({ foodItemId });
      const foodItemTotalRating = foodItemReviews.reduce((sum, review) => sum + review.rating, 0);
      const foodItemAverageRating = foodItemTotalRating / foodItemReviews.length;
      
      await FoodItem.findByIdAndUpdate(foodItemId, { 
        rating: parseFloat(foodItemAverageRating.toFixed(1)) 
      });
    }
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a review (customer only)
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required' });
    }
    
    // Find the review
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update the review
    review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = Date.now();
    
    await review.save();
    
    // Update seller rating
    const sellerId = review.sellerId;
    const allReviews = await Review.find({ sellerId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    await Seller.findByIdAndUpdate(sellerId, { 
      rating: parseFloat(averageRating.toFixed(1)) 
    });
    
    // If food item review, update food item rating
    if (review.foodItemId) {
      const foodItemId = review.foodItemId;
      const foodItemReviews = await Review.find({ foodItemId });
      const foodItemTotalRating = foodItemReviews.reduce((sum, review) => sum + review.rating, 0);
      const foodItemAverageRating = foodItemTotalRating / foodItemReviews.length;
      
      await FoodItem.findByIdAndUpdate(foodItemId, { 
        rating: parseFloat(foodItemAverageRating.toFixed(1)) 
      });
    }
    
    res.json({ 
      message: 'Review updated successfully',
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a review (customer only)
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Find the review
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    const sellerId = review.sellerId;
    const foodItemId = review.foodItemId;
    
    // Delete the review
    await review.deleteOne();
    
    // Update seller rating
    const allReviews = await Review.find({ sellerId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      await Seller.findByIdAndUpdate(sellerId, { 
        rating: parseFloat(averageRating.toFixed(1)) 
      });
    } else {
      // No reviews left, remove rating
      await Seller.findByIdAndUpdate(sellerId, { 
        $unset: { rating: 1 } 
      });
    }
    
    // If food item review, update food item rating
    if (foodItemId) {
      const foodItemReviews = await Review.find({ foodItemId });
      
      if (foodItemReviews.length > 0) {
        const foodItemTotalRating = foodItemReviews.reduce((sum, review) => sum + review.rating, 0);
        const foodItemAverageRating = foodItemTotalRating / foodItemReviews.length;
        
        await FoodItem.findByIdAndUpdate(foodItemId, { 
          rating: parseFloat(foodItemAverageRating.toFixed(1)) 
        });
      } else {
        // No reviews left, remove rating
        await FoodItem.findByIdAndUpdate(foodItemId, { 
          $unset: { rating: 1 } 
        });
      }
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get customer's reviews
router.get('/my-reviews', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const reviews = await Review.find({ userId: req.user.id })
      .populate('sellerId', 'name')
      .populate('foodItemId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
