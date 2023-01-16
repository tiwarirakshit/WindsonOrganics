const userAdmin = require("../models/user");
const bcryptjs = require("bcryptjs");
const passportAdmin = require("passport");
require("./passportlocalAdmin")(passportAdmin);
const productModel = require("../models/product");
const pincodeModel = require("../models/pincode");
const OrderModel = require("../models/order");
const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const contactModel = require('../models/contact')

// home get method
const dashboard = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("adminView/index", { logged: true, user: req.user });
  } else {
    res.render("adminView/index", { logged: false });
  }
};

// login get method
const getadminlogin = (req, res) => {
  res.render("adminView/login", { csrfToken: req.csrfToken() });
};

// signup get method
const getadminsignup = (req, res) => {
  res.render("adminView/signup", { csrfToken: req.csrfToken() });
};

// product list get method
const productList = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const products = await productModel.find({});
      if (products == " ") {
        res.render("adminView/product", { logged: true, user: req.user, product: null });
      } else {
        console.log(products);
        res.render("adminView/product", {
          logged: true,
          user: req.user,
          product: products,
        });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("adminView/product", { logged: false });
  }
};

// add product get method
const addProduct = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("adminView/Addproduct", {
      logged: true,
      csrfToken: req.csrfToken(),
      user: req.user,
    });
    console.log(req.csrfToken());
    console.log(req.file);
  } else {
    res.render("adminView/Addproduct", { csrfToken: req.csrfToken(), logged: false });
  }
};

// user list get method
const userList = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const users = await userAdmin.find({});
      if (users == " ") {
        res.render("adminView/userList", { logged: true, user: req.user, users: null });
      } else {
        console.log(users);
        res.render("adminView/userList", { logged: true, user: req.user, users: users });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("adminView/userList", { logged: false });
  }
};

// signup  post method
const adminsignup = (req, res) => {
  try {
    // get all the values
    const { email, username, password, confirmpassword } = req.body;
    // check if the are empty
    if (!email || !username || !password || !confirmpassword) {
      res.render("signup", {
        err: "All Fields Required !",
        csrfToken: req.csrfToken(),
      });
    } else if (password != confirmpassword) {
      res.render("adminView/signup", {
        err: "Password Don't Match !",
        csrfToken: req.csrfToken(),
      });
    } else {
      // validate email and username and password
      // skipping validation
      // check if a user exists
      userAdmin.findOne(
        { $or: [{ email: email }, { username: username }] },
        function (err, data) {
          if (err) throw err;
          if (data) {
            res.render("adminView/signup", {
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
                userAdmin({
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
                  res.redirect("/getadminlogin");
                });
              });
            });
          }
        }
      );
    }
  } catch (err) {
    console.log("In Catch Block");
    console.log(err);
  }
};

// login  get method
const adminlogin = (req, res, next) => {
  passportAdmin.authenticate("local", {
    failureRedirect: "getadminlogin",
    successRedirect: "/dashboard",
    failureFlash: true,
    logged: true,
    user: req.user,
  })(req, res, next);
};
// admin logout get method

const adminlogout = (req, res) => {
  req.logout();
  req.session.destroy(function (err) {
    res.redirect("/getadminlogin");
  });
};

// add product post method
let AddNewProduct = async (req, res) => {
  try {
    console.log(req.file);
    const image = req.file.filename;
    const { name, brand, price, quantity, stock, details } = req.body;
    if (!name || !brand || !price || !quantity || !stock || !details) {
      res.render("adminView/Addproduct", {
        err: "All Fields Required !",
        logged: true,
        csrfToken: req.csrfToken(),
        user: req.user,
      });
    } else {
      // validate product if already present in the database
      productModel.findOne(
        { $or: [{ name: name }, { brand: brand }] },
        function (err, data) {
          if (err) throw err;
          if (data) {
            res.render("adminView/addProduct", {
              err: "product Exists, add anothe one !",
              csrfToken: req.csrfToken(),
              logged: true,
              user: req.user,
            });
          } else {
            const products = new productModel({
              name,
              brand,
              price,
              quantity,
              stock,
              details,
              image,
            });
            products.save();
            res.status(201).render("adminView/addProduct", {
              csrfToken: req.csrfToken(),
              logged: true,
              msg: "product added successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    console.log("error in adding product");
    console.log(err);
  }
};

// Edit product details get method
let editList = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      let id = req.params.productId;
      console.log(id);
      const Product = await productModel.findById({ _id: id });
      console.log(Product);
      res.render("adminView/productEdit", {
        csrfToken: req.csrfToken(),
        logged: true,
        user: req.user,
        Product: Product,
      });
    } else {
      res.render("adminView/productEdit", {
        csrfToken: req.csrfToken(),
        logged: true,
        user: req.user,
        Product: null,
      });
    }
  } catch (err) {
    console.log("error to get product data");
    res.send(err);
  }
};

// Edit product details post method
const edit = async (req, res) => {
  try {
    const id = req.body.id;
    const Product = await productModel.findById({ _id: id });
    const productData = {
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      quantity: req.body.quantity,
      stock: req.body.stock,
      details: req.body.details,
      image: req.file.filename
    }

    productModel.findByIdAndUpdate(id, productData, { new: true }, (err, docs) => {
      if (!err) {
        res.status(201).render("adminView/productEdit", {
          logged: true,
          Product: docs,
          msg: "product updated successfully!",
          csrfToken: req.csrfToken(),
          user: req.user,
        });
        console.log(docs);
      }
      else {
        res.render("adminView/productEdit", {
          err: "Something wrong when updating product !",
          logged: true,
          Product: Product,
          csrfToken: req.csrfToken(),
          user: req.user,
        });
      }
    });
  } catch (err) {
    console.log("something wrong in changing product details");
    res.send(err);
  }
};

// delete product get method
const deleteProduct = (req, res) => {
  const id = req.params.productId;
  productModel.findByIdAndRemove(id, (err, doc) => {
    if (!err) {
      res.redirect('back');
    }
    else {
      console.log('Error during delete : ' + err);
    }
  });
}

// add pincode get method
const addPincode = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("adminView/Addpincode", {
      logged: true,
      csrfToken: req.csrfToken(),
      user: req.user,
    });
    console.log(req.csrfToken());
  } else {
    res.render("adminView/Addpincode", { csrfToken: req.csrfToken(), logged: false });
  }
};


// add pincode post method
let AddNewPincode = async (req, res) => {
  try {
    const { city, state, pincode } = req.body;
    console.log(req.body)
    if (!city || !state || !pincode) {
      res.render("adminView/Addpincode", {
        err: "All Fields Required !",
        logged: true,
        csrfToken: req.csrfToken(),
        user: req.user,
      });
    } else if (req.body) {
      // validate product if already present in the database
      pincodeModel.findOne(
        { $or: [{ pincode: pincode }] },
        function (err, data) {
          if (err) throw err;
          if (data) {
            res.render("adminView/Addpincode", {
              err: "pincode Exists, add another one !",
              csrfToken: req.csrfToken(),
              logged: true,
              user: req.user,
            });
          } else {
            const pincodes = new pincodeModel({
              city,
              state,
              pincode
            });
            pincodes.save();
            res.status(201).render("adminView/Addpincode", {
              csrfToken: req.csrfToken(),
              logged: true,
              msg: "pincode added successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    console.log("error in adding pincode");
    console.log(err);
  }
};


// pincode list get method
const pincodeList = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const pincode = await pincodeModel.find({});
      if (pincode == " ") {
        res.render("adminView/pincodeList", { logged: true, user: req.user, pincode: null });
      } else {
        console.log(pincode);
        res.render("adminView/pincodeList", {
          logged: true,
          user: req.user,
          pincode: pincode,
        });
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("adminView/pincodeList", { logged: false });
  }
};


// delete product get method
const deletePincode = (req, res) => {
  const id = req.params.id;
  pincodeModel.findByIdAndRemove(id, (err, doc) => {
    if (!err) {
      res.redirect('back');
    }
    else {
      console.log('Error during delete : ' + err);
    }
  });
}
// order confirmed get method
const confirmed = async (req, res) => {
  const id = req.params.id;
  const order = {
    status: 'Confirmed',
  }
  OrderModel.findByIdAndUpdate(id, order, { new: true }, (err, docs) => {
    if (!err) {
      res.redirect("back");
    }
    else {
      res.send(err)
    }
  });
}

// order dispatched get method
const dispatched = async (req, res) => {
  const id = req.params.id;
  const order = {
    status: 'Dispatched',
  }
  OrderModel.findByIdAndUpdate(id, order, { new: true }, (err, docs) => {
    if (!err) {
      res.redirect("back");
    }
    else {
      res.send(err)
    }
  });
}


// order delivered get method
const delivered = async (req, res) => {
  const id = req.params.id;
  const order = {
    status: 'Delivered',
  }
  OrderModel.findByIdAndUpdate(id, order, { new: true }, (err, docs) => {
    if (!err) {
      res.redirect("back");
    }
    else {
      res.send(err)
    }
  });
}


// order canceled get method
const canceled = async (req, res) => {
  const id = req.params.id;
  const order = {
    status: 'Canceled',
  }
  OrderModel.findByIdAndUpdate(id, order, { new: true }, (err, docs) => {
    if (!err) {
      res.redirect("back");
    }
    else {
      res.send(err)
    }
  });
}


// user details get method
const viewUser = async (req, res) => {
  const id = req.params.id;
  const userDetails = await userAdmin.findById({ _id: id });
  if (userDetails != null) {
    const orderDetails = await OrderModel.find({ id: id })
    if (orderDetails != null) {
      res.render("adminView/userDetails", { userDetails: userDetails, order: orderDetails, logged: true, user: req.user, });
    }
    else {
      res.render("adminView/userDetails", { userDetails: userDetails, order: null, logged: true, user: req.user, });
    }
  }
  else {
    res.render("adminView/userDetails", { userDetails: null, order: null, logged: true, user: req.user, });
  }
}



// order list get method
const orderList = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const orderlist = await OrderModel.find();
      console.log(orderlist)
      if (orderlist != null) {
        res.render("adminView/orderList", { logged: true, user: req.user, orderDetails: orderlist });
      }
      else {
        res.render("adminView/orderList", { logged: true, user: req.user, orderDetails: null });
      }
    } else {
      res.render("adminView/orderList", { logged: false });
    }
  }
  catch (err) {
    res.send(err);
  }
};

// emails get method
const getEmails = async (req, res) => {
  if (req.isAuthenticated()) {
    const data = await contactModel.find({});
    if (data != null) {
      res.render("adminView/emails", { title: "Emails", logged: true, user: req.user, emailData: data, csrfToken: req.csrfToken() });
    }
    else {
      res.render("adminView/emails", { title: "Emails", logged: true, user: req.user, emailData: null, csrfToken: req.csrfToken() });

    }
  } else {
    res.render('adminView/emails', { title: 'gallery', logged: false });
  }
}

module.exports = {
  dashboard,
  getadminlogin,
  getadminsignup,
  adminsignup,
  adminlogin,
  adminlogout,
  productList,
  userList,
  addProduct,
  orderList,
  AddNewProduct,
  editList,
  edit,
  deleteProduct,
  addPincode,
  AddNewPincode,
  pincodeList,
  deletePincode,
  confirmed,
  dispatched,
  delivered,
  canceled,
  viewUser,
  getEmails
};
