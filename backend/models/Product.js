const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    countInStock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
