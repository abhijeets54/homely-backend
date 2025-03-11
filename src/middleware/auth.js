const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

const router = express.Router();

// Register Customer
router.post('/register/customer', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already registered as a customer' });
        }

        // Create a new customer (password hashing is handled in the model)
        const customer = new Customer(req.body);

        await customer.save();
        res.status(201).json({ message: 'Customer created successfully' });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Register Seller
router.post('/register/seller', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: 'Email already registered as a seller' });
        }

        // No need to hash the password here (handled in Seller model)
        const seller = new Seller(req.body);

        await seller.save();
        res.status(201).json({ message: 'Seller created successfully' });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // console.log("🔍 Received Login Request: ", req.body);

        // Determine the correct model based on the role
        const Model = role === 'seller' ? Seller : Customer;
        const user = await Model.findOne({ email });

        if (!user) {
            // console.log("❌ User not found!");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // console.log("🔐 Stored Hashed Password:", user.password);
        // console.log("🔑 Entered Plain Password:", password);

        // Compare the entered password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        // console.log("✅ Password Match Status:", isMatch);

        if (!isMatch) {
            // console.log("❌ Password mismatch!");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // console.log("✅ Login Successful! Token generated.");

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;


