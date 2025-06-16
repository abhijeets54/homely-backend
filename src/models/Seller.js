const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SellerSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true, required: true},
    phone: String,
    password: {type: String, required: true},
    address: String,
    description: {type: String, default: ''},
    cuisineType: {type: String, default: ''},
    status: {type: String, enum: ['open', 'close'], default: 'open'},
    openingTime: {type: String, default: '09:00'},
    closingTime: {type: String, default: '22:00'},
    minimumOrder: {type: Number, default: 10},
    deliveryRadius: {type: Number, default: 5},
    image: { type: String }, // New field for storing image URL or path
    imageUrl: {
        type: String,
        default: ''
    },
    imagePublicId: {
        type: String,
        default: ''
    },
    created_at: {type: Date, default: Date.now},
    // updated_at: {type: Date, default: Date.now},
});

// Hash password before saving to database

SellerSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    next();
});

module.exports = mongoose.model('Seller', SellerSchema);