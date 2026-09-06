const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pizza: {
      base: { type: String, required: true },
      sauce: { type: String, required: true },
      cheese: { type: String, required: true },
      vegetables: [{ type: String }],
    },
    extras: [
      {
        category: { type: String, enum: ['drink', 'dessert'] },
        name: String,
        price: Number,
      },
    ],
    deliveryAddress: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);