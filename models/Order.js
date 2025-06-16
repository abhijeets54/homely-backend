const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  foodItemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  restaurantId: {
    type: String,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'on-the-way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  restaurantId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure model isn't recreated if it already exists
module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema); 