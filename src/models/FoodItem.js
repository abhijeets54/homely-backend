const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  price: Number,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true },
  quantity: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FoodItem', FoodItemSchema);
