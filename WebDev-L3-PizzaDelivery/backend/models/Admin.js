const mongoose = require('mongoose');

// Admins are seeded manually (see backend/utils/seedAdmin.js) and are NOT
// reachable via the public user-registration flow, per the requirement
// that admin login is separate from user signup.
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
