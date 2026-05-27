const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();
router.use(protect);
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/', admin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', admin, updateOrderStatus);
router.delete('/:id', admin, deleteOrder);

module.exports = router;
