const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable', 'drink', 'dessert'],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    emoji: { type: String, default: '🍕' },
    imageQuery: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 20 },
    lowStockAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);