const mongoose = require('mongoose');

const DeliveryAssignmentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
  status: { 
    type: String, 
    enum: ['assigned', 'picked up', 'delivered'], 
    default: 'assigned' 
  },
  assignedAt: { type: Date, default: Date.now },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  deliveryNotes: { type: String }
});

module.exports = mongoose.model('DeliveryAssignment', DeliveryAssignmentSchema);
