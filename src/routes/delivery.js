const express = require('express');
const DeliveryPartner = require('../models/DeliveryPartner');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get all available delivery partners
router.get('/partners/available', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const partners = await DeliveryPartner.find({ isAvailable: true })
      .select('name phone vehicleType currentLocation');
    
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Assign delivery partner to an order (seller only)
router.post('/assign', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { orderId, deliveryPartnerId, estimatedDeliveryTime } = req.body;
    
    if (!orderId || !deliveryPartnerId) {
      return res.status(400).json({ message: 'Order ID and delivery partner ID are required' });
    }
    
    // Verify order exists and belongs to this seller
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify order is in 'preparing' status
    if (order.status !== 'preparing') {
      return res.status(400).json({ message: 'Order must be in preparing status to assign delivery' });
    }
    
    // Verify delivery partner exists and is available
    const partner = await DeliveryPartner.findOne({
      _id: deliveryPartnerId,
      isAvailable: true
    });
    
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found or not available' });
    }
    
    // Check if assignment already exists
    const existingAssignment = await DeliveryAssignment.findOne({ orderId });
    
    if (existingAssignment) {
      return res.status(400).json({ message: 'Order already has a delivery assignment' });
    }
    
    // Create delivery assignment
    const assignment = new DeliveryAssignment({
      orderId,
      deliveryPartnerId,
      status: 'assigned',
      estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : undefined
    });
    
    await assignment.save();
    
    // Update delivery partner availability
    partner.isAvailable = false;
    await partner.save();
    
    // Update order status
    order.status = 'out for delivery';
    await order.save();
    
    res.status(201).json({ 
      message: 'Delivery partner assigned successfully',
      assignment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update delivery status (delivery partner only)
router.put('/status/:assignmentId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { status } = req.body;
    
    if (!status || !['picked up', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (picked up, delivered) is required' });
    }
    
    // Find assignment
    const assignment = await DeliveryAssignment.findOne({
      _id: req.params.assignmentId,
      deliveryPartnerId: req.user.id
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Delivery assignment not found' });
    }
    
    // Update assignment status
    assignment.status = status;
    
    if (status === 'picked up') {
      assignment.pickedUpAt = Date.now();
    } else if (status === 'delivered') {
      assignment.deliveredAt = Date.now();
      assignment.actualDeliveryTime = Date.now();
      
      // Update order status
      await Order.findByIdAndUpdate(assignment.orderId, { status: 'delivered' });
      
      // Make delivery partner available again
      await DeliveryPartner.findByIdAndUpdate(req.user.id, { isAvailable: true });
    }
    
    await assignment.save();
    
    res.json({ 
      message: `Delivery status updated to ${status}`,
      assignment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update delivery partner location (delivery partner only)
router.put('/location', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Update location
    const partner = await DeliveryPartner.findById(req.user.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    partner.currentLocation = { lat, lng };
    await partner.save();
    
    res.json({ 
      message: 'Location updated successfully',
      location: partner.currentLocation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get delivery partner's current assignments
router.get('/my-assignments', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const assignments = await DeliveryAssignment.find({
      deliveryPartnerId: req.user.id,
      status: { $ne: 'delivered' }
    }).populate({
      path: 'orderId',
      select: 'restaurantId userId totalPrice',
      populate: [
        { path: 'restaurantId', select: 'name address' },
        { path: 'userId', select: 'name phone address' }
      ]
    });
    
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get delivery partner's assignment history
router.get('/my-history', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'delivery') {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    const assignments = await DeliveryAssignment.find({
      deliveryPartnerId: req.user.id,
      status: 'delivered'
    }).populate({
      path: 'orderId',
      select: 'restaurantId userId totalPrice createdAt',
      populate: [
        { path: 'restaurantId', select: 'name address' },
        { path: 'userId', select: 'name' }
      ]
    }).sort({ deliveredAt: -1 });
    
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get delivery status for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permission
    if (req.user.role === 'customer' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    } else if (req.user.role === 'seller' && order.restaurantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied' });
    }
    
    // Get delivery assignment
    const assignment = await DeliveryAssignment.findOne({ orderId: req.params.orderId })
      .populate('deliveryPartnerId', 'name phone currentLocation');
    
    if (!assignment) {
      return res.status(404).json({ message: 'No delivery assignment found for this order' });
    }
    
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add delivery notes
router.put('/notes/:assignmentId', verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({ message: 'Notes are required' });
    }
    
    // Find assignment
    let assignment;
    
    if (req.user.role === 'delivery') {
      assignment = await DeliveryAssignment.findOne({
        _id: req.params.assignmentId,
        deliveryPartnerId: req.user.id
      });
    } else if (req.user.role === 'seller') {
      const assignmentData = await DeliveryAssignment.findById(req.params.assignmentId)
        .populate('orderId');
      
      if (assignmentData && assignmentData.orderId.restaurantId.toString() === req.user.id) {
        assignment = assignmentData;
      }
    }
    
    if (!assignment) {
      return res.status(404).json({ message: 'Delivery assignment not found' });
    }
    
    // Update notes
    assignment.deliveryNotes = notes;
    await assignment.save();
    
    res.json({ 
      message: 'Delivery notes updated',
      assignment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
