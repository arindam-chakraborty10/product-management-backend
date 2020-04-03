const mongoose = require('mongoose');
const {Category, categorySchema} = require('../models/category');
var idvalidator = require('mongoose-id-validator');

const today = new Date();

const productSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    name: String,
    price: Number,
    isActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date(today.getTime()+(1000*60*30 + 1000*60*60*5))
    }
});

productSchema.set('toObject', {virtuals: true});
productSchema.set('toJSON', {virtuals: true});

productSchema.virtual('categories' ,{
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id'
});
productSchema.plugin(idvalidator);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;