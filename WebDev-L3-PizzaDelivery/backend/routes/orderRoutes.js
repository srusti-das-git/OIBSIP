const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createPaymentOrder, verifyAndPlaceOrder, getMyOrders, getAllOrders, updateOrderStatus, getAdminStats,
} = require('../controllers/orderController');

router.post('/create-payment-order', protect('user'), createPaymentOrder);
router.post('/verify-and-place', protect('user'), verifyAndPlaceOrder);
router.get('/mine', protect('user'), getMyOrders);

router.get('/stats', protect('admin'), getAdminStats);
router.get('/', protect('admin'), getAllOrders);
router.put('/:id/status', protect('admin'), updateOrderStatus);

module.exports = router;