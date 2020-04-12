const mongoose = require('mongoose');
const express = require('express');
const { Category } = require('../models/category');
const categories = require('../routes/categories');
const Product = require('../models/product');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let products = await req.body;

    var isErr = false;

    for (let index = 0; index < products.length; index++) {
      if (!products[index].name || !products[index].categoryId) {
        isErr = true;
        break;
      }
    }

    if (isErr)
      return res
        .status(400)
        .send({ Error: 'name and categoryId both are required..' });

    var flag = true;

    for (let i = 0; i < products.length - 1; i++) {
      for (let j = i + 1; j < products.length; j++) {
        if (
          products[i].name.toLowerCase() == products[j].name.toLowerCase() &&
          products[i].categoryId == products[j].categoryId
        ) {
          flag = false;
          break;
        }
      }
    }

    if (!flag)
      return res.status(400).send({ Error: 'Duplicate product found..' });

    var flag1 = true;
    for (let i = 0; i < products.length; i++) {
      let catId = products[i].categoryId;
      let name = products[i].name;

      let results = await Product.find({ categoryId: catId });

      for (let j = 0; j < results.length; j++) {
        if (results[j].name.toLowerCase() == name.toLowerCase()) {
          flag1 = false;
          break;
        }
      }
    }

    console.log(flag1);
    if (!flag1)
      return res.status(400).send({ Error: 'Duplicate product found in db..' });

    //products = await Product.create(products);
    products = await Product.insertMany(products);
    res.send(products);
  } catch (ex) {
    for (const field in ex.errors) {
      console.log(ex.errors[field].message);
    }
  }
});

module.exports = router;
