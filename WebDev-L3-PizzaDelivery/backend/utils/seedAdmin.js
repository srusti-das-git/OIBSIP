// One-off script to create the first admin account.
// Usage: node utils/seedAdmin.js "Admin Name" admin@example.com StrongPass123
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

(async () => {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.log('Usage: node utils/seedAdmin.js "Admin Name" admin@example.com StrongPass123');
    process.exit(1);
  }
  await connectDB();
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists with this email.');
    process.exit(0);
  }
  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ name, email, password: hashed });
  console.log('Admin created successfully:', email);
  process.exit(0);
})();
