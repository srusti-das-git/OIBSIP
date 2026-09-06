require('dotenv').config();
const connectDB = require('../config/db');
const Inventory = require('../models/Inventory');

const items = [
  ...[
    ['Thin Crust', '🍕', 'Neapolitan pizza'],
    ['Classic Hand Tossed', '🍕', 'Margherita pizza'],
    ['Cheese Burst', '🍕', 'Chicago-style pizza'],
    ['Wheat Thin', '🍕', 'Whole wheat bread'],
    ['Gluten Free', '🍕', 'Gluten-free diet'],
    ['Sicilian Style', '🍕', 'Sicilian pizza'],
    ['New York Style', '🍕', 'New York-style pizza'],
  ].map(([name, emoji, imageQuery]) => ({ category: 'base', name, emoji, imageQuery, stock: 50 })),

  ...[
    ['Tomato Basil', '🍅', 'Tomato sauce'],
    ['BBQ', '🍖', 'Barbecue sauce'],
    ['Pesto', '🌿', 'Pesto'],
    ['Peri Peri', '🌶️', 'Piri piri'],
    ['White Garlic', '🧄', 'Garlic sauce'],
  ].map(([name, emoji, imageQuery]) => ({ category: 'sauce', name, emoji, imageQuery, stock: 50 })),

  ...[
    ['Mozzarella', '🧀', 'Mozzarella'],
    ['Cheddar', '🧀', 'Cheddar cheese'],
    ['Parmesan', '🧀', 'Parmigiano-Reggiano'],
    ['Vegan Cheese', '🧀', 'Vegan cheese'],
  ].map(([name, emoji, imageQuery]) => ({ category: 'cheese', name, emoji, imageQuery, stock: 50 })),

  ...[
    ['Onion', '🧅', 'Onion'],
    ['Capsicum', '🫑', 'Bell pepper'],
    ['Mushroom', '🍄', 'Edible mushroom'],
    ['Corn', '🌽', 'Sweet corn'],
    ['Olives', '🫒', 'Olive'],
    ['Tomato', '🍅', 'Tomato'],
    ['Jalapeno', '🌶️', 'Jalapeño'],
    ['Paneer', '🧀', 'Paneer'],
  ].map(([name, emoji, imageQuery]) => ({ category: 'vegetable', name, emoji, imageQuery, stock: 50 })),

  ...[
    ['Coca-Cola (330ml)', '🥤', 'Coca-Cola'],
    ['Sprite (330ml)', '🥤', 'Sprite (drink)'],
    ['Fresh Lime Soda', '🍋', 'Limeade'],
    ['Cold Coffee', '☕', 'Iced coffee'],
    ['Mango Shake', '🥭', 'Milkshake'],
  ].map(([name, emoji, imageQuery], i) => ({
    category: 'drink', name, emoji, imageQuery, price: [60, 60, 50, 90, 100][i], stock: 40,
  })),

  ...[
    ['Chocolate Lava Cake', '🍫', 'Molten chocolate cake'],
    ['Garlic Breadsticks', '🥖', 'Breadstick'],
    ['Tiramisu', '🍰', 'Tiramisu'],
    ['Choco Chip Cookies (3pc)', '🍪', 'Chocolate chip cookie'],
  ].map(([name, emoji, imageQuery], i) => ({
    category: 'dessert', name, emoji, imageQuery, price: [120, 99, 150, 89][i], stock: 30,
  })),
];

(async () => {
  await connectDB();
  for (const item of items) {
    await Inventory.updateOne(
      { category: item.category, name: item.name },
      { $set: item },
      { upsert: true }
    );
  }
  console.log(`Inventory seeded (${items.length} items across 6 categories) with photo lookups.`);
  process.exit(0);
})();