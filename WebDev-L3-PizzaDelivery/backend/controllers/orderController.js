const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { decrementStockForOrder } = require('./inventoryController');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
};

exports.verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      pizza, extras, deliveryAddress, quantity, totalAmount,
    } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await Order.create({
      user: req.user.id,
      pizza,
      extras: extras || [],
      deliveryAddress: deliveryAddress || '',
      quantity: quantity || 1,
      totalAmount,
      payment: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      status: 'Placed',
    });

    await decrementStockForOrder(pizza, extras || []);

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    const distinctCustomers = new Set(orders.map((o) => String(o.user?._id)));
    const pendingOrders = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
    const orderValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const ingredients = await Inventory.countDocuments();
    const lowStock = await Inventory.countDocuments({ $expr: { $lt: ['$stock', '$lowStockThreshold'] } });

    res.json({
      customers: distinctCustomers.size,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      orderValue,
      ingredients,
      lowStock,
      recentOrders: orders.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};