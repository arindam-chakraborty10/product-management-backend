const express = require('express');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const categories = require('./routes/categories');
const products = require('./routes/products');
const orders = require('./routes/orders');
const display = require('./routes/display');

const app = express();
app.use(express.json());

app.use('./views', express.static(__dirname + '/views'));
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/display', display);
app.use((req, res, next) =>
  res.status(404).send({ NotFound: '404 not found' })
);

mongoose
  .connect('mongodb://localhost/playground', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('connected to mongodb...'))
  .catch(err => console.error('could not connect to mongodb'));

let port = 3000;
app.listen(port, () => console.log(`listening to the port ${port}`));
