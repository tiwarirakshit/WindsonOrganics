const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controller/passportlocal')(passport);

const {
    home,
    getsignup,
    getlogin,
    category,
    about,
    gallery,
    contact,
    myAccount,
    blog,
    myCart,
    productDetails,
    checkout,
    orderDetails,
    signup,
    login,
    forgotPassword,
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
} = require('../controller/homeController');


// * authentication middleware
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.render('ecommercView/login', { csrfToken: req.csrfToken() });
    }
}
const cartDatabaseModel = require('../models/cart')
var Cart = require("../controller/cartModel");
const user = require('../models/user');

router.use(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const User = await user.findOne({ _id: req.session.passport.user, });
        const cart = await cartDatabaseModel.findOne({ userEmail: User.email });
        // console.log(cart);
        res.locals.Cart = cart;
        next();
    } else {
        next();
    }
}
)


// e-commerce home controller
router.get('/', home);
// e-commerce signup get controller
router.get('/getlogin', getlogin);
// e-commerce signup get controller
router.get('/getsignup', getsignup);
// e-commerce logout get controller
router.get('/logout', logout);
// e-commerce category get controller
router.get('/category', category);
// e-commerce about get controller
router.get('/about', about);
// e-commerce gallery get controller
router.get('/gallery', gallery);
// e-commerce contact get controller
router.get('/contact', contact);
// e-commerce my account get controller
router.get('/myAccount', checkAuth, myAccount);
// e-commerce my cart get controller
router.get('/myCart', checkAuth, myCart);
// e-commerce blog get controller
router.get('/blog', blog);
// e-commerce product details get controller
router.get('/productDetails/:productId', productDetails);
// e-commerce checkout get controller
router.get('/checkout', checkAuth, checkout);
// e-commerce checkout get controller
router.get('/orderDetails', checkAuth, orderDetails);
// e-commerce add to cart get controller
router.get('/addToCart/:id', addToCart);
// e-commerce remove one item from cart get controller
router.get('/reduceItemByOne/:id', reduceItemByOne)
// e-commerce increase one item in cart get controller
router.get('/increaseItemByOne/:id', increaseItemByOne)
// e-commerce remove all items from cart get controller
router.get('/removeItem/:id', removeItem);
// e-commerce forgot password get controller
router.get('/forgotPassword', forgotPassword)
// e-commerce reset password get controller
router.get('/resetPassword', resetPassword)
// e-commerce verify user email get controller
router.get('/verifyEmail', verifyEmail)
// e-commerce send verify user email get controller
router.get('/sendVerificationEmail', checkAuth, sendVerificationEmail)
// e-commerce Thank you page get controller
router.get('/donation', donation)



// e-commerce sign up post controller
router.post('/signup', signup);
// e-commerce sign up post controller
router.post('/login', login);
// e-commerce update user details post controller
router.post('/updateUserProfile', updateUserProfile);
// e-commerce review post controller
router.post('/review/:id', review);
// e-commerce user order post controller
router.post('/order', order);
// e-commerce user order payment confirmation post controller
router.post('/success', success)
// forgot password post controller
router.post('/ForgotPassword', ForgotPassword);
// reset password post controller
router.post('/ResetPassword', ResetPassword)
// save email post controller
router.post('/saveEmail', saveEmail);
//  email send post controller
router.post('/emailSender', emailSender)

// export routes
module.exports = router;
