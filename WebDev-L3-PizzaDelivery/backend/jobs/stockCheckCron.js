const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

// Runs every hour: sweeps all inventory items and emails the admin about any
// that are below their configured threshold and haven't already been alerted.
// (This is a safety-net alongside the immediate check in inventoryController's
// decrementStockForOrder, and also catches items lowered via manual updates.)
const startStockCheckCron = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[cron] Running scheduled low-stock check...');
    try {
      const lowItems = await Inventory.find({
        $expr: { $lt: ['$stock', '$lowStockThreshold'] },
        lowStockAlertSent: false,
      });

      for (const item of lowItems) {
        await sendEmail({
          to: process.env.ADMIN_NOTIFY_EMAIL,
          subject: `[Scheduled Check] Low stock: ${item.name}`,
          html: `<p><strong>${item.name}</strong> (${item.category}) is below threshold (${item.lowStockThreshold}). Current stock: ${item.stock}.</p>`,
        });
        item.lowStockAlertSent = true;
        await item.save();
      }

      if (lowItems.length) {
        console.log(`[cron] Sent ${lowItems.length} low-stock alert(s).`);
      }
    } catch (err) {
      console.error('[cron] Stock check failed:', err.message);
    }
  });
};

module.exports = startStockCheckCron;
