const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SellerSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true,required: true},
    phone: String,
    password: {type: String, required: true},
    address: String,
    status: {type:String,enum:['open','close'],default:'open'},
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