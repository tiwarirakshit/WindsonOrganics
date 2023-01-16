const mongoose = require('mongoose');
const emailSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    date: {
        type: String,
    },
});

// creating collection
const emailModel = new mongoose.model("email", emailSchema);
module.exports = emailModel;