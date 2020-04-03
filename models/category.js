const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const today = new Date();

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: new Date(today.getTime()+(1000*60*30 + 1000*60*60*5))
    }
});

categorySchema.set('toObject', {virtuals: true});
categorySchema.set('toJSON', {virtuals: true});

categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId'
   
});

const Category = mongoose.model('Category', categorySchema);


module.exports.Category = Category;
//module.exports.categorySchema = categorySchema;