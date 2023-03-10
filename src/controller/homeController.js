const express = require("express");
const router = express.Router();
const user = require('../models/user');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
require('./passportlocal')(passport);
const productModel = require("../models/product");
const cartDatabaseModel = require('../models/cart')
var Cart = require("./cartModel");
const pincodeModel = require('../models/pincode');
const orderModel = require('../models/order');
const Razorpay = require("razorpay");
var crypto = require('crypto');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const path = require('path');
const options = require('../helpers/options');
const resetToken = require('../models/resetTokens');
const mailer = require('./sendMail');
const e = require("connect-flash");
const emailModel = require("../models/email")
const contactModel = require("../models/contact");
const nodemailer = require('nodemailer');


const authorization = {
  service: 'gmail',
  secure: 'true',
  auth: {
    user: process.env.mailId,  //your email address
    pass: process.env.password  // your password
  }
};


var instance = new Razorpay({
  key_id: 'rzp_test_k6LuoogxKOFhAh',
  key_secret: 'sYfvXP5OT6Yae9JkR9n7J4Ql',
});

// date function
const date = new Date();
var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();

// home get method
const home = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("ecommercView/index", { logged: true, user: req.user, ProductDetails: res.locals.Cart, csrfToken: req.csrfToken() });
  } else {
    res.render("ecommercView/index", { logged: false });
  }
}

// login get method
const getlogin = (req, res) => {
  res.render('ecommercView/login', { csrfToken: req.csrfToken() });
}

// signup get method
const getsignup = (req, res) => {
  res.render('ecommercView/signup', { csrfToken: req.csrfToken() });
}


// signup get method
const forgotPassword = (req, res) => {
  res.render('ecommercView/forgotPassword', { csrfToken: req.csrfToken() });
}

// blog get method
const blog = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/blog', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart, csrfToken: req.csrfToken() });
  } else {
    res.render('ecommercView/blog', { csrfToken: req.csrfToken(), logged: false });
  }

}


// category get method
const category = async (req, res) => {
  try {
    const products = await productModel.find({});
    if (req.isAuthenticated()) {
      if (products == " ") {
        res.render('ecommercView/category', { csrfToken: req.csrfToken(), logged: true, user: req.user, product: null });
      } else {
        console.log(products);
        res.render("ecommercView/category", {
          csrfToken: req.csrfToken(),
          logged: true,
          user: req.user,
          Product: products,
          ProductDetails: res.locals.Cart,
        });
      }
    }
    else {
      res.render('ecommercView/category', { csrfToken: req.csrfToken(), logged: false, Product: products, });
    }

  }
  catch (err) {
    console.log(err);
  }
}

// about get method
const about = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/about', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart, v });
  } else {
    res.render('ecommercView/about', { csrfToken: req.csrfToken(), logged: false });
  }

}

// gallery get method
const gallery = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/gallery', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart });
  } else {
    res.render('ecommercView/gallery', { csrfToken: req.csrfToken(), logged: false });
  }
}


// contact get method
const contact = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/contact', { logged: true, user: req.user, ProductDetails: res.locals.Cart, csrfToken: req.csrfToken() });
  } else {
    res.render('ecommercView/contact', { logged: false, csrfToken: req.csrfToken() });
  }
}

// my Account get method
const myAccount = (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user.isVerified)
    res.render('ecommercView/myAccount', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart, verified: req.user.isVerified });
  } else {
    res.render('ecommercView/myAccount', { csrfToken: req.csrfToken(), logged: false });
  }

}

// my Account get method
const myCart = async (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/myCart', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart });
    // console.log(res.locals.Cart);
  }
  else {
    res.render('ecommercView/myCart', { csrfToken: req.csrfToken(), logged: false });
  }
}

// product details  get method
const productDetails = async (req, res) => {
  try {
    let id = req.params.productId;
    console.log(id);
    const Product = await productModel.findById({ _id: id });
    if (req.isAuthenticated()) {
      res.render('ecommercView/productDetails', { csrfToken: req.csrfToken(), logged: true, user: req.user, Product: Product, ProductDetails: res.locals.Cart });
    } else {
      res.render('ecommercView/productDetails', { csrfToken: req.csrfToken(), logged: false, Product: Product });
    }
  }
  catch (err) {
    console.log(err);
  }
}

// check out  get method
const checkout = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/checkout', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart });
  } else {
    res.render('ecommercView/checkout', { csrfToken: req.csrfToken(), logged: false });
  }
}


// order details get method
const orderDetails = async (req, res) => {
  if (req.isAuthenticated()) {
    const order = await orderModel.find({ email: req.user.email })
    console.log(order)
    res.render('ecommercView/orderDetails', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart, OrderDetail: order });
  } else {
    res.render('ecommercView/orderDetails', { csrfToken: req.csrfToken(), logged: false });
  }

}


// signup  get method
const signup = (req, res) => {
  try {
    // get all the values
    const { email, username, password, confirmpassword } = req.body;
    // check if the are empty
    if (!email || !username || !password || !confirmpassword) {
      res.render("ecommercView/signup", {
        err: "All Fields Required !",
        csrfToken: req.csrfToken(),
      });
    } else if (password != confirmpassword) {
      res.render("ecommercView/signup", {
        err: "Password Don't Match !",
        csrfToken: req.csrfToken(),
      });
    } else {
      // validate email and username and password
      // skipping validation
      // check if a user exists
      user.findOne(
        { $or: [{ email: email }, { username: username }] },
        function (err, data) {
          if (err) throw err;
          if (data) {
            res.render("ecommercView/signup", {
              err: "User Exists, Try Logging In !",
              csrfToken: req.csrfToken(),
            });
          } else {
            // generate a salt
            bcryptjs.genSalt(12, (err, salt) => {
              if (err) throw err;
              // hash the password
              bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err;
                // save user in db
                user({
                  username: username,
                  email: email,
                  password: hash,
                  googleId: null,
                  provider: 'email',
                }).save((err, data) => {
                  if (err) throw err;
                  // login the user
                  // use req.login
                  // redirect , if you don't want to login
                  res.render("ecommercView/login", { csrfToken: req.csrfToken() });
                });
              });
            });
          }
        }
      );
    }

  } catch (err) {
    console.log("In Catch Block")
    console.log(err);
  }
}

// login  get method
const login = (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "getlogin",
    successRedirect: "/myAccount",
    failureFlash: true,
    logged: true,
  })(req, res, next);
}

const logout = (req, res) => {
  req.logout();
  req.session.destroy(function (err) {
    res.redirect("/");
  });
}

// updating user profile  get method
const updateUserProfile = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      var userDetails = {
        username: req.body.username,
        phone: req.body.phone,
        address: req.body.address,
      };
      //    console.log(req.user.id);
      var update = user.findByIdAndUpdate(req.user.id, userDetails);
      update.exec(function (err, data) {
        if (err) throw err;
        user.find({}).exec(function (err, data) {
          if (err) throw err;
          res.redirect("back");
        });
      });
    } else {
      res.send("no working");
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

// review post method
const review = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById({ _id: id });
    const { username, email, comment } = req.body;
    if (!username || !email || !comment) {
      res.status(404).render("ecommercView/productDetails", {
        err: "All Fields Required !",
        csrfToken: req.csrfToken(),
        Product: product,
      });
    }

    const reviewData = {
      username,
      email,
      comment
    };

    const result = await productModel.updateMany({ _id: id }, {
      $addToSet: { review: [reviewData] }
    })

    if (result) {
      res.redirect("back");
    } else {
      res.status(404).send("error");
    }
  }
  catch (err) {
    console.log(err);
  }
}

// add product to cart post method
const addToCart = async (req, res) => {
  try {
    if (req.isAuthenticated()) {

      // console.log(req.session.passport.user);
      await user.findOne({ _id: req.session.passport.user },
        function (err, User) {
          if (User) {
            var productId = req.params.id;
            console.log(productId);
            cartDatabaseModel.findOne({ userEmail: User.email },
              async function (err, userCart) {
                cart = new Cart(userCart ? userCart : {}, User.email);
                // console.log(userCart.psroductsObject)
                await productModel.findById(productId, function (err, product) {
                  cart.add(product, product.id);
                  // console.log(product)
                  res.redirect("back");
                });
              }
            );
          } else {
            console.log("No user found");
          }
        }
      );
    } else {
      res.render('ecommercView/login', { csrfToken: req.csrfToken(), logged: false });
    }

  }
  catch (err) {
    res.send(err);
  }
};

// reduce one item in cart get method  
const reduceItemByOne = (req, res) => {
  user.findOne(
    {
      _id: req.session.passport.user,
    },
    function (err, User) {
      var productId = req.params.id;
      cartDatabaseModel.findOne(
        {
          userEmail: User.email,
        },
        function (err, userCart) {
          cart = new Cart(userCart ? userCart : {}, User.email);
          cart.reduceItemByOne(productId);
          res.redirect("back");
        }
      );
    }
  );
};

// increase one item in cart get method  
const increaseItemByOne = (req, res) => {
  user.findOne(
    {
      _id: req.session.passport.user,
    },
    function (err, User) {
      var productId = req.params.id;
      cartDatabaseModel.findOne(
        {
          userEmail: User.email,
        },
        function (err, userCart) {
          cart = new Cart(userCart ? userCart : {}, User.email);
          // console.log(userCart.productsObject)
          productModel.findById(productId, function (err, product) {
            cart.add(product, product.id);
            // console.log(req.session.cart)
            res.redirect("back");
          });
        }
      );
    }
  );
};

// remove all items from the cart get method  
const removeItem = (req, res) => {
  user.findOne(
    {
      _id: req.session.passport.user,
    },
    function (err, User) {
      var productId = req.params.id;
      cartDatabaseModel.findOne(
        {
          userEmail: User.email,
        },
        function (err, userCart) {
          cart = new Cart(userCart ? userCart : {}, User.email);
          cart.removeItem(productId);
          res.redirect("back");
        }
      );
    }
  );
};


// create order post method
const order = async (req, res) => {
  try {
    const { name, city, state, pincode, phone, address } = req.body;
    const email = req.user.email;
    const pinCode = await pincodeModel.findOne({ pincode: pincode });
    const CartDetails = await cartDatabaseModel.findOne({ userEmail: email });
    const amount = CartDetails.totalPriceOfAllProducts;
    const currencyMultiplier = 100;
    const data = {
      name,
      email,
      city,
      state,
      pincode,
      phone,
      address,
      totalQtyOfAllProducts: CartDetails.totalQtyOfAllProducts,
      totalPriceOfAllProducts: CartDetails.totalPriceOfAllProducts,
      items: CartDetails.productsObject,
      OrderPrice: CartDetails.totalPriceOfAllProducts
    }
    if (pinCode != null) {
      if (pinCode.pincode == 482001 || pinCode.pincode == 482002 || pinCode.pincode == 482003 || pinCode.pincode == 482004 || pinCode.pincode == 482005 || pinCode.pincode == 482007 || pinCode.pincode == 482008 || pinCode.pincode == 482009 || pinCode.pincode == 482010 || pinCode.pincode == 482011 || pinCode.pincode == 482020) {
        console.log(pincode)
        var options = {
          amount: amount * currencyMultiplier,
          currency: "INR",
          receipt: "receipt_order_74394",
          payment_capture: '1',
        };
        instance.orders.create(options, function (err, order) {
          const order_id = order.id;
          res.render("ecommercView/template", {
            orderID: order_id,
            csrfToken: req.csrfToken(),
            data: data,
          });
        });
      }
      else if (pinCode.pincode != null && CartDetails.totalPriceOfAllProducts > 500) {
        var options = {
          amount: amount * currencyMultiplier,
          currency: "INR",
          receipt: "receipt_order_74394",
          payment_capture: '1',
        };
        instance.orders.create(options, function (err, order) {
          const order_id = order.id;
          res.render("ecommercView/template", {
            orderID: order_id,
            csrfToken: req.csrfToken(),
            data: data,
          });
        });
      }
      else if (pinCode.pincode = null && CartDetails.totalPriceOfAllProducts > 500) {
        res.render("ecommercView/checkout", {
          csrfToken: req.csrfToken(),
          err: "Delivery to this pincode is not available",
          logged: true,
          user: req.user,
          ProductDetails: res.locals.Cart
        });
      }
      else {
        res.render("ecommercView/checkout", {
          csrfToken: req.csrfToken(),
          err: "min order must be 500rs",
          logged: true,
          ProductDetails: res.locals.Cart,
          user: req.user,
        });
      }
    }
    else {
      res.render("ecommercView/checkout", {
        csrfToken: req.csrfToken(),
        err: "pincode not valid",
        logged: true,
        ProductDetails: res.locals.Cart,
        user: req.user,
      });
    }
  }
  catch (err) {
    res.send(err);
  }
}

const pdf_path = path.join(__dirname, "../public/docs");


// payment confirmation post method
const success = async (req, res) => {

  try {

    const html = fs.readFileSync(path.join(__dirname, '../../templates/views/ecommercView/bill.html'), 'utf-8');
    const filename = Math.random() + '_doc' + '.pdf';
    const { name, email, city, state, pincode, phone, address, payID, orderID } = req.body;
    const pinCode = await pincodeModel.findOne({ pincode: pincode });
    const CartDetails = await cartDatabaseModel.findOne({ userEmail: email });
    const cartId = CartDetails.id;
    var body = req.body.orderID + "|" + req.body.payID;
    var generated_signature = crypto.createHmac('sha256', 'sYfvXP5OT6Yae9JkR9n7J4Ql')
      .update(body.toString())
      .digest('hex');
    // console.log(generated_signature);
    // console.log(req.body.sign);

    let array = [];
    const productData = res.locals.Cart.cartProductArray;
    productData.forEach(d => {
      const prod = {
        name: d.item.name,
        brand: d.item.brand,
        details: d.item.details,
        quantity: d.qty,
        price: d.item.price,
        total: d.price,
        image: d.item.image
      }
      array.push(prod);
    });

    let subtotal = 0;
    array.forEach(i => {
      subtotal += i.total
    });
    const tax = (subtotal * 20) / 100;
    const grandtotal = subtotal + tax;
    const obj = {
      prodlist: array,
      subtotal: subtotal,
      tax: tax,
      gtotal: grandtotal
    }

    const document = {
      html: html,
      data: {
        products: obj
      },
      path: pdf_path + filename
    }
    pdf.create(document, options)
      .then(res => {
        console.log(res);
      }).catch(error => {
        console.log(error);
      });
    if (generated_signature == req.body.sign) {
      orderModel({
        id: req.user.id,
        name,
        email,
        city,
        state,
        pincode,
        phone,
        address,
        paymentId: payID,
        orderId: orderID,
        OrderDate: `${day}/${month}/${year}`,
        totalQtyOfAllProducts: CartDetails.totalQtyOfAllProducts,
        totalPriceOfAllProducts: CartDetails.totalPriceOfAllProducts,
        items: CartDetails.productsObject,
        OrderPrice: CartDetails.totalPriceOfAllProducts,
        billPdf: filename,
      }).save((err, data) => {
        if (err) throw err;
        cartDatabaseModel.findByIdAndDelete(cartId, (err, doc) => {
          res.render("ecommercView/ThankYou", {
            csrfToken: req.csrfToken(),
            msg: "Order Successful",
            logged: true,
            user: req.user,
            ProductDetails: null
          });

        });

      });
    }
    else {
      console.log("Broken");
      res.send(req.body);
    }

  }
  catch (err) {
    res.status(500).send(err);
    console.log(err);
  }

}

// forgot user password post method
const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  // not checking if the field is empty or not 
  // check if a user exist with this email
  var userData = await user.findOne({ email: email });
  if (userData) {
    if (userData.provider == 'google') {
      // type is for bootstrap alert types
      res.render('ecommercView/forgotPassword', { csrfToken: req.csrfToken(), error_messages: "User exists with Google account. Try resetting your google account password or logging using it.", type: 'danger' });
    } else {
      // user exists and is not with google
      // generate token
      var token = crypto.randomBytes(32).toString('hex');
      // add that to database
      await resetToken({ token: token, email: email }).save();
      // send an email for verification
      mailer.sendResetEmail(email, token);

      res.render('ecommercView/forgotPassword', { csrfToken: req.csrfToken(), msg: "Reset email sent. Check your email for more info.", type: 'success' });
    }
  } else {
    res.render('ecommercView/forgotPassword', { csrfToken: req.csrfToken(), error_messages: "No user Exists with this email.", type: 'danger' });

  }
}

// reset user password get method
const resetPassword = async (req, res) => {
  const token = req.query.token;
  if (token) {
    var check = await resetToken.findOne({ token: token });
    if (check) {
      res.render('ecommercView/resetPassword', { csrfToken: req.csrfToken(), reset: true, email: check.email });
    } else {
      res.render('ecommercView/forgotPassword', { csrfToken: req.csrfToken(), msg: "Token Tampered or Expired.", type: 'danger' });
    }
  } else {
    res.redirect('/ecommercView/login');
  }

}

// reset user password post method
const ResetPassword = async (req, res) => {
  const { password, password2, email } = req.body;
  console.log(password);
  console.log(email)
  console.log(password2);
  if (!password || !password2 || (password2 != password)) {
    res.render('/ecommercView/forgotPassword', { csrfToken: req.csrfToken(), reset: true, err: "Passwords Don't Match !", email: email });
  } else {
    var salt = await bcryptjs.genSalt(12);
    if (salt) {
      var hash = await bcryptjs.hash(password, salt);
      await user.findOneAndUpdate({ email: email }, { $set: { password: hash } });
      res.redirect('getlogin');
    } else {
      res.render('/ecommercView/forgotPassword', { csrfToken: req.csrfToken(), reset: true, err: "Unexpected Error Try Again", email: email });

    }
  }
}

//  user email verification post method
const verifyEmail = async (req, res) => {
  const token = req.query.token;
  if (token) {
    var check = await resetToken.findOne({ token: token });
    if (check) {
      var userData = await user.findOne({ email: check.email });
      userData.isVerified = true;
      await userData.save();
      await resetToken.findOneAndDelete({ token: token });
      res.redirect('myAccount');
    } else {
      res.render('ecommercView/myAccount', { user: req.user, csrfToken: req.csrfToken(), ProductDetails: res.locals.Cart, verified: req.user.isVerified, err: "Invalid token or Token has expired, Try again." });
    }
  } else {
    res.redirect('/ecommercView/myAccount');
  }
}

// send user email verification  get method
const sendVerificationEmail = async (req, res) => {
  try {
    if (req.user.isVerified || req.user.provider == 'google') {
      res.redirect('myAccount');
    } else {
      var token = crypto.randomBytes(32).toString('hex');
      await resetToken({ token: token, email: req.user.email }).save();
      mailer.sendVerifyEmail(req.user.email, token);
      res.render('ecommercView/myAccount', { username: req.user.username, verified: req.user.isVerified, emailsent: true, csrfToken: req.csrfToken() });
    }
  }
  catch (err) {
    res.status(404).send(err);
    console.log(err);
  }
}

// donation page get method
const donation = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('ecommercView/donation', { csrfToken: req.csrfToken(), logged: true, user: req.user, ProductDetails: res.locals.Cart });
  } else {
    res.render('ecommercView/donation', { csrfToken: req.csrfToken(), logged: false });
  }
}

// email post method
const saveEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const date = new Date();
    const emails = new emailModel({
      email: email,
      date
    });
    emails.save();
    res.redirect("back")

  }
  catch (err) {
    res.status(500).send(err)
    console.log(err)
  }

}

const emailSender = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!email || !name || !subject || !phone || !message) {
      res.render("ecommercView/contact", {
        err: "All Fields Required !",
        csrfToken: req.csrfToken()
      });
    }
    else {
      var contacts = new contactModel({
        name,
        email,
        subject,
        phone,
        message
      });
      await contacts.save()
      const transporter = nodemailer.createTransport(authorization);
      const mailOptions = {
        from: req.body.email,
        to: `${process.env.mailId}`,
        subject: 'User Information',
        text: `${req.body.name} ${req.body.email} ${req.body.subject} ${req.body.phone} ${req.body.message}`,
      }
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(400).render('404');
          console.log(error);
        } else {
          res.status(200).render('ecommercView/contact', { msg: 'email send successful', csrfToken: req.csrfToken() });
          console.log('Email sent: ' + info.response);
        }
      });
    }
  }
  catch (err) {
    res.status(400).render('404');
  }
}

module.exports = {
  home,
  getlogin,
  getsignup,
  forgotPassword,
  category,
  about,
  blog,
  gallery,
  contact,
  myAccount,
  myCart,
  productDetails,
  checkout,
  orderDetails,
  signup,
  login,
  logout,
  updateUserProfile,
  review,
  addToCart,
  reduceItemByOne,
  increaseItemByOne,
  removeItem,
  order,
  success,
  ForgotPassword,
  resetPassword,
  ResetPassword,
  verifyEmail,
  sendVerificationEmail,
  donation,
  saveEmail,
  emailSender
}
