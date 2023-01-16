const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    id: { type: String },
    name: { type: String },
    email: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String },
    address: { type: String },
    items: { type: Object },
    totalQtyOfAllProducts: { type: Number },
    totalPriceOfAllProducts: { type: Number },
    OrderPrice: { type: Number },
    paymentType: { type: String, default: 'Prepaid' },
    paymentStatus: { type: Boolean, default: false },
    status: { type: String, default: 'order placed' },
    OrderDate: { type: String },
    orderId: { type: String },
    paymentId: { type: String },
    billPdf: { type: String },
}, { timestamps: true })
const OrderModel = new mongoose.model('Order', orderSchema);
module.exports = OrderModel;