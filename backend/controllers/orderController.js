const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const orderItemsFromCart = user.cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      imageUrl: item.product.imageUrl,
    }));

    const orderItems = req.body.orderItems && req.body.orderItems.length > 0 ? req.body.orderItems : orderItemsFromCart;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    const totalPrice = req.body.totalPrice || orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'Online',
      totalPrice,
    });

    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.status = req.body.status || order.status;
    if (req.body.isPaid !== undefined) {
      order.isPaid = req.body.isPaid;
      order.paidAt = req.body.isPaid ? Date.now() : order.paidAt;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    await order.remove();
    res.json({ message: 'Order removed' });
  } catch (error) {
    next(error);
  }
};
