const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

exports.getInventory = async (req, res) => {
  const items = await Inventory.find().sort({ category: 1, name: 1 });
  res.json(items);
};

exports.getPublicOptions = async (req, res) => {
  const items = await Inventory.find({ stock: { $gt: 0 } }).select('category name emoji price imageQuery');
  const grouped = { base: [], sauce: [], cheese: [], vegetable: [], drink: [], dessert: [] };
  items.forEach((i) =>
    grouped[i.category].push({ name: i.name, emoji: i.emoji, price: i.price, imageQuery: i.imageQuery })
  );
  res.json(grouped);
};

exports.updateStock = async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    if (stock !== undefined) item.stock = stock;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
    if (item.stock > item.lowStockThreshold) item.lowStockAlertSent = false;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.decrementStockForOrder = async (pizza, extras = []) => {
  const namesUsed = [
    { category: 'base', name: pizza.base },
    { category: 'sauce', name: pizza.sauce },
    { category: 'cheese', name: pizza.cheese },
    ...pizza.vegetables.map((v) => ({ category: 'vegetable', name: v })),
    ...extras.map((e) => ({ category: e.category, name: e.name })),
  ];

  for (const { category, name } of namesUsed) {
    const item = await Inventory.findOneAndUpdate(
      { category, name },
      { $inc: { stock: -1 } },
      { new: true }
    );
    if (item && item.stock < item.lowStockThreshold && !item.lowStockAlertSent) {
      item.lowStockAlertSent = true;
      await item.save();
      await sendEmail({
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `Low stock alert: ${item.name}`,
        html: `<p><strong>${item.name}</strong> (${item.category}) has fallen below the threshold of ${item.lowStockThreshold} units. Current stock: ${item.stock}.</p>`,
      });
    }
  }
};