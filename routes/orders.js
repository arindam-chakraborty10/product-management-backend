const mongoose = require('mongoose');
const express = require('express');
const { Order, validate } = require('../models/order');
const Product = require('../models/product');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ Error: error.details[0].message });

    let order = new Order({ ...req.body });

    if (!order.productId || !order.userEmail)
      return res
        .status(400)
        .send({ Error: 'Product Id and userEmail required' });

    const check = await Order.findOne({ userEmail: order.userEmail });

    if (check && check.name != order.name)
      return res
        .status(400)
        .send({ AccessDenied: 'email_id of each user must be unique..' });

    const product = await Product.findById(order.productId);
    if (!product)
      return res.status(400).send({ Error: 'Invalid product id given...' });

    order = await order.save();

    res.send(order);
  } catch (ex) {
    for (const field in ex.errors) {
      console.log(ex.errors[field].message);
    }
  }
});

module.exports = router;
