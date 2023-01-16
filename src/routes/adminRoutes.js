const express = require('express');
var Router = require('router')
var router = new Router()
const passport = require('passport');
const path = require('path');
const csrf = require("csurf");

// use csrf token globly
router.use(csrf());
require('../controller/passportlocalAdmin')(passport);
var multer = require('multer');

const uploadPath = path.join(__dirname, "../../public/uploads");

// image upload
const storage = multer.diskStorage({
    destination: uploadPath,
    filename: function (req, file, cb) {
        cb(null, 'Product' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        var validextension = ['.png', '.jpg', '.jpeg'];
        var ext = path.extname(file.originalname);
        if (!validextension.includes(ext)) {
            return cb(new Error("please choose .png,.jpg of .jpeg files !"));
        }
        cb(null, true)
    },
    limits: { fileSize: 125000 * 10 },
}).single('file');

const {
    dashboard,
    getadminsignup,
    getadminlogin,
    adminsignup,
    adminlogin,
    adminlogout,
    productList,
    addProduct,
    userList,
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

} = require('../controller/adminController');

//* admin authentication 
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();

    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.render('adminView/login', { csrfToken: req.csrfToken(), error: "Please Login to continue !" });
    }
}

// admin home controller
router.get('/dashboard', checkAuth, dashboard);
// admin signup get controller
router.get('/getadminlogin', getadminlogin);
// admin signup get controller
router.get('/getadminsignup', getadminsignup);
// admin logout get controller
router.get('/adminlogout', adminlogout);
// admin product List get controller
router.get('/productList', productList);
// admin add product get controller
router.get('/addProduct', addProduct);
// admin user list get controller
router.get('/userList', userList);
// admin order list get controller
router.get('/orderList', orderList);
// admin edit product get controller
router.get('/edit/:productId', editList);
// admin delete product get controller
router.get('/deleteProduct/:productId', deleteProduct);
// admin add pincode get controller
router.get('/addPincode', addPincode);
// admin view pincode get controller
router.get('/pincodeList', pincodeList)
// admin delete pincode get controller
router.get('/deletePincode/:id', deletePincode);
// admin order confirmed get controller
router.get('/confirmed/:id', confirmed)
// admin order dispatched get controller
router.get('/dispatched/:id', dispatched)
// admin order delivered get controller
router.get('/delivered/:id', delivered)
// admin order canceled get controller
router.get('/canceled/:id', canceled)
// admin user details get controller
router.get('/viewUser/:id', viewUser)
// admin emails get controller
router.get('/getEmails', checkAuth, getEmails);



// admin sign up post controller
router.post('/adminsignup', adminsignup);
// admin sign up post controller
router.post('/adminlogin', adminlogin);
// admin add product  post controller
router.post('/AddNewProduct', upload, AddNewProduct);
// edit product  post controller
router.post('/edit', upload, edit);
// add pincode post controller
router.post('/AddNewPincode', AddNewPincode);


// export routes
module.exports = router;
