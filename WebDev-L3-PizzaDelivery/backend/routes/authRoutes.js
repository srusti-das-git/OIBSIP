const express = require('express');
const router = express.Router();
const {
  register, verifyEmail, login, adminLogin, forgotPassword, resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/admin/login', adminLogin); // separate endpoint, no admin registration route exists
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
