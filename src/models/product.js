const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    comment: {
        type: String,
    },
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    brand: {
        type: String,

    },
    price: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    stock: {
        type: Number,

    },
    details: {
        type: String,
    },
    image: {
        type: String
    },
    review: [reviewSchema],
    date: {
        type: Date
    }
});

// creating collection
const productModel = new mongoose.model("product", productSchema);

module.exports = productModel;