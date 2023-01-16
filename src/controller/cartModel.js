const mongoose = require("mongoose");
const cartDatabaseModel = require("../models/cart");

module.exports = function Cart(oldCart, userEmail) {
    this.items = oldCart.productsObject || {};
    this.totalPrice = oldCart.totalPriceOfAllProducts || 0;
    this.totalQty = oldCart.totalQtyOfAllProducts || 0;
    this.userEmail = userEmail || 0;
    this.add = function (item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, itemName: item.productName, qty: 0, price: 0 };
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
        // console.log(this.items);
        cartDatabaseModelObject = cartDatabaseModel({
            userEmail: userEmail,
            cartProductArray: this.generateArray(),
            productsObject: this.items,
            totalQtyOfAllProducts: this.totalQty,
            totalPriceOfAllProducts: this.totalPrice
        });
        if (this.totalQty <= 1) {
            cartDatabaseModelObject.save(function () {
                console.log(userEmail)
                console.log("Cart Details Saved In The Database")

            });
        }
        else {
            console.log(userEmail)
            cartDatabaseModel.updateOne({ userEmail: userEmail }, { $set: { cartProductArray: this.generateArray(), productsObject: this.items, totalPriceOfAllProducts: this.totalPrice, totalQtyOfAllProducts: this.totalQty } }, function () {
                console.log("Updated")
            });
        }
    }
    this.reduceItemByOne = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id]
            cartDatabaseModel.updateOne({ userEmail: userEmail }, { $set: { cartProductArray: this.generateArray(), productsObject: this.items, totalPriceOfAllProducts: this.totalPrice, totalQtyOfAllProducts: this.totalQty } }, function () {
                console.log("One Product Completely Deleted")
            });
        }
        else {
            cartDatabaseModel.updateOne({ userEmail: userEmail }, { $set: { cartProductArray: this.generateArray(), productsObject: this.items, totalPriceOfAllProducts: this.totalPrice, totalQtyOfAllProducts: this.totalQty } }, function () {
                console.log("One Product Reduced")

            })
        }
        if (this.totalQty <= 0) {
            cartDatabaseModel.deleteOne({ userEmail: userEmail }, function () {
                console.log("Cart Is Empty ")
            })
        }
    }
    this.removeItem = function (id) {
        // this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price * this.items[id].qty;
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].item.price * this.items[id].qty;
        this.items[id].qty = 0;
        if (this.items[id].qty <= 0) {
            delete this.items[id]
            cartDatabaseModel.updateOne({ userEmail: userEmail }, { $set: { cartProductArray: this.generateArray(), productsObject: this.items, totalPriceOfAllProducts: this.totalPrice, totalQtyOfAllProducts: this.totalQty } }, function () {
                console.log("One Product Completely Deleted")
            });
        }
        // else{
        //     cartDatabaseModel.updateOne({userEmail:userEmail},{ $set: {cartProductArray:this.generateArray(), productsObject:this.items, totalPriceOfAllProducts:this.totalPrice,totalQtyOfAllProducts:this.totalQty } }, function() {
        //         console.log("One Product Reduced")

        //     })
        // }
        if (this.totalQty <= 0) {
            cartDatabaseModel.deleteOne({ userEmail: userEmail }, function () {
                console.log("Cart Is Empty ")
            })
        }
    }
    this.generateArray = function () {
        var arr = []
        for (var id in this.items) {
            arr.push(this.items[id])
        }
        return arr;
    }
}

