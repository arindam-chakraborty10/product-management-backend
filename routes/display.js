const mongoose = require('mongoose');
const express = require('express');
const Product = require('../models/product');
const { Category } = require('../models/category');
const { Order } = require('../models/order');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const sendEMail = require('../source/sendMail');
const auth = require('../middleware/auth');
const datetime = require('node-datetime');

const router = express.Router();

router.get('/showall', auth, async (req, res) => {
  try {
    const result = await Category.find().populate('products');
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//filters1.  Show all the products of a perticular category
router.get('/category/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Category.findById(id).populate({
      path: 'products',
      options: { sort: { price: -1 } },
    });
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//filter4.  top three most expensive products of each category

router.get('/expensive', auth, async (req, res) => {
  try {
    Category.find({})
      .populate({
        path: 'products',
        options: {
          sort: { price: -1 },
        },
        perDocumentLimit: 2,
      })
      .exec(function (err, result) {
        if (err) console.log(err);
        else res.send(result);
      });
  } catch (error) {
    res.status(400).send(error);
  }
});

//2. User can filter by price range

router.post('/pricewise', auth, async (req, res) => {
  try {
    const highest = req.body.highest;
    const lowest = req.body.lowest;

    const result = await Product.find({
      price: { $gte: lowest, $lte: highest },
    }).populate('categories');
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//6. show orders
router.get('/orders', auth, async (req, res) => {
  try {
    const today = new Date();

    const result = await Order.find({
      createdAt: { $gte: today.getTime() - 1000 * 60 * 60 * 24 * 12 },
    }).populate({
      path: 'products',
      populate: {
        path: 'categories',
        options: { select: { name: 1, id: -1 } },
      },
    });
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//just orders pagination
router.post('/pagination', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = limit * (page - 1);

    if (skip < 0)
      return res.status(400).send({ Error: 'Invalid page request...' });

    const count = await Order.find().countDocuments();
    if (count % limit == 0) var max_page = count / limit;
    else var max_page = Math.ceil(count / limit);

    if (page > max_page)
      return res
        .status(400)
        .send({ NotFound: `Page available from 1 to ${max_page}` });

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const response = {
      totalDocuments: count,
      showingPage: `${page} of ${max_page}`,
      orders: orders,
    };
    res.send(response);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Single API

router.post('/singleapi', auth, async (req, res) => {
  const catId = req.body.catId;
  const price_max = req.body.price.max;
  const price_min = req.body.price.min;
  var condition = {};
  var initCondition = {};

  try {
    if (catId) {
      const cat = await Category.findById(catId);
      if (!cat)
        return res
          .status(400)
          .send({ Error: 'Invalid category Id provided....' });
      initCondition['_id'] = catId;

      if (!price_max && !price_min) {
      } else if (price_max && !price_min) {
        condition['price'] = { $lte: price_max };
      } else if (price_min && !price_max) {
        condition['price'] = { $gte: price_min };
      } else {
        if (price_min > price_max)
          return res
            .status(400)
            .send({ Error: 'price_min must be less than max' });

        condition['price'] = { $lte: price_max, $gte: price_min };
      }
    } else {
      if (!price_max && !price_min) {
      } else if (price_max && !price_min) {
        condition['price'] = { $lte: price_max };
      } else if (price_min && !price_max) {
        condition['price'] = { $gte: price_min };
      } else {
        if (price_min > price_max)
          return res
            .status(400)
            .send({ Error: 'price_min must be less than max' });

        condition['price'] = { $lte: price_max, $gte: price_min };
      }
    }
    console.log(initCondition);
    console.log(condition);
    const result = await Category.find(initCondition).populate({
      path: 'products',
      options: {
        sort: { createdAt: -1 },
      },
      match: condition,
    });
    res.send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

//extensions
router.post('/extensions', auth, async (req, res) => {
  try {
    const search = new RegExp(req.query.search, 'i');
    console.log(search);
    const products = await Product.find({ name: search });
    res.send(products);
  } catch (error) {
    res.status(400).send(error);
  }
});

//send order details on mail
router.get('/sendmail/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'products',
      populate: 'categories',
    });

    if (!order)
      return res.status(400).send({ Error: 'Invalid order_id given...' });

    const date = new Date(order.createdAt);
    const dt = datetime.create(date);
    const formatted = dt.format('d/m/yy  H:M');

    const context = {
      name: order.name,
      product_name: order.products[0].name,
      price: order.products[0].price,
      category_name: order.products[0].categories[0].name,
      purchased: formatted,
    };
    sendEMail(order.userEmail, context);
    res.send(order);
  } catch (error) {
    es.status(400).send(error);
  }
});

//router.get('*', (req, res) => res.status(404).send({NotFound: '404 page not found'}));

module.exports = router;
