const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    address: {
        type: String,
        default: null,
    },
    phone: {
        type: Number,
        default: null,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
    },
    provider: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('user', userSchema);