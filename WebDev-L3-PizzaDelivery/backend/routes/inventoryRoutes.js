const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getInventory, getPublicOptions, updateStock } = require('../controllers/inventoryController');

router.get('/public', getPublicOptions); // used by pizza builder, no auth needed
router.get('/', protect('admin'), getInventory);
router.put('/:id', protect('admin'), updateStock);

module.exports = router;
