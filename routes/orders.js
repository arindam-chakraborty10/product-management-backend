const mongoose = require('mongoose');
const express = require('express');
const Order = require('../models/order');
const Product = require('../models/product');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let order = new Order({ ...req.body });

    if (!order.productId || !order.userEmail)
      return res
        .status(400)
        .send({ Error: 'Product Id and userEmail required' });

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
