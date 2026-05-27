const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;
