const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    phone: {
        type: Number,
        default: null,
    },
    message: {
        type: String,
        default: null,
    }
});

module.exports = mongoose.model('contact', contactSchema);