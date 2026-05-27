const Product = require('../models/Product');

exports.getProducts = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: { $regex: req.query.keyword, $options: 'i' },
        }
      : {};

    const category = req.query.category
      ? { category: { $regex: req.query.category, $options: 'i' } }
      : {};

    const products = await Product.find({
      ...keyword,
      ...category,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, countInStock } = req.body;

    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error('Name, description, price and category are required');
    }

    const product = await Product.create({
      user: req.user._id,
      name,
      description,
      price,
      category,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      countInStock: countInStock || 0,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const { name, description, price, category, countInStock } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
