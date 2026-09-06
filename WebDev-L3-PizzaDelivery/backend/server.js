require('dotenv').config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8" ,"1.1.1.1"]);
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const connectDB = require('./config/db');
const startStockCheckCron = require('./jobs/stockCheckCron');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startStockCheckCron();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
