const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    userEmail:{
        type:String,
    },
    cartProductArray:{
        type:Array,
    },
    productsObject:{
        type:Object
    },
    totalPriceOfAllProducts:{
        type:Number,
    },
    totalQtyOfAllProducts:{
        type:Number,
    },
}) ;

// creating collection
const cartModel = new mongoose.model("cart", cartSchema);
module.exports= cartModel;