const Product = require('../models/Product');
const User = require('../models/User');

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price imageUrl countInStock');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const totalPrice = user.cart.reduce((sum, item) => sum + item.quantity * (item.product.price || 0), 0);
    res.json({ cart: user.cart, totalPrice });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      res.status(400);
      throw new Error('Product ID and quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const existingItem = user.cart.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    if (quantity === undefined) {
      res.status(400);
      throw new Error('Quantity is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const item = user.cart.find((item) => item.product.toString() === productId);
    if (!item) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    if (Number(quantity) <= 0) {
      user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    } else {
      item.quantity = Number(quantity);
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
