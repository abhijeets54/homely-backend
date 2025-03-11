const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
});

module.exports = mongoose.model('Category', CategorySchema);
