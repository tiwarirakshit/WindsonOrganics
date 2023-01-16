const mongoose = require('mongoose');
const pincodeSchema = new mongoose.Schema({
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    pincode: {
        type: Number,
    }
});

module.exports = mongoose.model('pincode', pincodeSchema);