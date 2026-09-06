const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Verifies a JWT and attaches the decoded payload to req.user
const protect = (requiredRole) => async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    console.log('\n===== AUTH CHECK =====');
    console.log('Request:', req.method, req.originalUrl);
    console.log('Required role:', requiredRole);
    console.log('Authorization header exists:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');

      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ Token is empty');

      return res.status(401).json({
        message: 'Not authorized, empty token'
      });
    }

    // 3. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log('✅ JWT verified');
    console.log('Decoded ID:', decoded.id);
    console.log('Decoded role:', decoded.role);
    console.log('Token issued at:', decoded.iat);
    console.log('Token expires at:', decoded.exp);

    // 4. Check required role
    if (requiredRole && decoded.role !== requiredRole) {
      console.log(
        `❌ Role mismatch: required "${requiredRole}", received "${decoded.role}"`
      );

      return res.status(403).json({
        message: 'Forbidden: insufficient role'
      });
    }

    // 5. Find user/admin in database
    if (decoded.role === 'admin') {
      console.log('Looking for admin:', decoded.id);

      const admin = await Admin.findById(decoded.id).select('-password');

      if (!admin) {
        console.log('❌ Admin not found:', decoded.id);

        return res.status(401).json({
          message: 'Admin not found'
        });
      }

      req.user = {
        id: admin._id,
        role: 'admin',
        name: admin.name,
        email: admin.email
      };

      console.log('✅ Admin authenticated:', admin.email);

    } else {
      console.log('Looking for user:', decoded.id);

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('❌ User not found:', decoded.id);

        return res.status(401).json({
          message: 'User not found'
        });
      }

      req.user = {
        id: user._id,
        role: 'user',
        name: user.name,
        email: user.email
      };

      console.log('✅ User authenticated:', user.email);
    }

    console.log('✅ AUTH SUCCESS');
    console.log('======================\n');

    // 6. Continue to controller
    next();

  } catch (err) {
    console.error('\n❌ AUTH ERROR');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('======================\n');

    return res.status(401).json({
      message: 'Not authorized, token invalid or expired',
      error: err.message
    });
  }
};

module.exports = protect;