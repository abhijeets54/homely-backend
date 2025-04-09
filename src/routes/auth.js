const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const DeliveryPartner = require('../models/DeliveryPartner');
const verifyToken = require('../middleware/verifyToken');

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

        // Generate JWT token
        const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Customer created successfully',
            token,
            user: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            }
        });

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

        // Generate JWT token
        const token = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Seller created successfully',
            token,
            user: {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                address: seller.address,
                status: seller.status
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Register Delivery Partner
router.post('/register/delivery', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email already exists
        const existingPartner = await DeliveryPartner.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({ message: 'Email already registered as a delivery partner' });
        }

        const partner = new DeliveryPartner(req.body);

        await partner.save();

        // Generate JWT token
        const token = jwt.sign({ id: partner._id, role: 'delivery' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Delivery partner created successfully',
            token,
            user: {
                id: partner._id,
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                vehicleType: partner.vehicleType
            }
        });

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

        let Model;
        // Determine the correct model based on the role
        if (role === 'seller') {
            Model = Seller;
        } else if (role === 'customer') {
            Model = Customer;
        } else if (role === 'delivery') {
            Model = DeliveryPartner;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: role },  // ✅ Explicitly store role
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from user object
        const userObj = user.toObject();
        delete userObj.password;

        res.json({
            token,
            user: userObj,
            userType: role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const { id, role } = req.user;

        let Model;
        if (role === 'seller') {
            Model = Seller;
        } else if (role === 'customer') {
            Model = Customer;
        } else if (role === 'delivery') {
            Model = DeliveryPartner;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user,
            userType: user.role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { id, role } = req.user;
        const { name, phone, address } = req.body;

        let Model;
        if (role === 'seller') {
            Model = Seller;
        } else if (role === 'customer') {
            Model = Customer;
        } else if (role === 'delivery') {
            Model = DeliveryPartner;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address && (role === 'seller' || role === 'customer')) user.address = address;

        await user.save();

        // Remove password from user object
        const userObj = user.toObject();
        delete userObj.password;

        res.json({
            message: 'Profile updated successfully',
            user: userObj
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { id, role } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        let Model;
        if (role === 'seller') {
            Model = Seller;
        } else if (role === 'customer') {
            Model = Customer;
        } else if (role === 'delivery') {
            Model = DeliveryPartner;
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
