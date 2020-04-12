const mongoose = require('mongoose');
const Product = require('./product');
const Joi = require('@hapi/joi');

const today = new Date();

const orderSchema = new mongoose.Schema({
  name: String,
  userEmail: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Product,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

orderSchema.virtual('products', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
});

const Order = mongoose.model('Order', orderSchema);

function validateOrder(order) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    userEmail: Joi.string().required().email(),
    productId: Joi.required(),
  });

  return schema.validate(order);
}

exports.Order = Order;
exports.validate = validateOrder;
