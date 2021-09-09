var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
let Product = require('../models/product');
let Cart = require('../models/cart');
let Transaction = require('../models/transaction');
const ZarinpalCheckout = require('zarinpal-checkout');
const zarinpal = ZarinpalCheckout.create('e208bc00-b292-11e9-87cb-000c29344814', true);

/* GET home page. */
router.get('/', function (req, res, next) {
    let successMessage = req.flash('success')[0];
    let errMsg = req.flash('error')[0];
    Product.find(function (err, docs) {
        res.render('shop/index', {title: 'Express', products: docs , successMessage: successMessage , noSuccess: !successMessage , errMsg:errMsg , noError: !errMsg});
    });
});

router.get('/add-to-cart/:id', function (req, res, next) {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

    Product.findById(productId, function (err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        //console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }

    let cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkOut',isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    let cart = new Cart(req.session.cart);
    //console.log(cart);
    let errMsg = req.flash('error')[0];
    res.render('shop/checkout', {cart: cart , errMsg:errMsg , noError: !errMsg});
});

router.post('/pay', function (req, res, next) {
    let cart = req.session.cart;
    zarinpal.PaymentRequest({
        Amount: cart.totalPrice, // In Tomans
        //CallbackURL: 'https://your-safe-api/example/zarinpal/validate',
        CallbackURL: 'http://localhost:3000/paymentVerification',
        Description: 'A Payment from Node.JS',
        Email: 'hi@siamak.work',
        Mobile: '09120000000'
    }).then(response => {
        if (response.status === 100) {
            console.log(response);
            const transaction ={
              name: req.body.name,
              address: req.body.address,
              cardName: req.body.cardName,
              cardNumber: req.body.cardNumber,
              cardExpireMonth: req.body.cardExpireMonth,
              cardExpireYear: req.body.cardExpireYear,
              cvc: req.body.cvc,
              user: req.user,
              cart: req.session.cart,
              price:req.body.price,
              resId:response.authority
            };
            Transaction.create(transaction , function(err , ok) {
              if (err) {
                return next(err);
              }
            return res.redirect(response.url);
            });
        }
    }).catch(err => {
        console.error(err);
    });
});

router.get('/paymentVerification', function (req, res, next) {
    // console.log(req.query.Authority);
    // console.log(req.user._id);
    let cart = req.session.cart;
    zarinpal.PaymentVerification({
        Amount: cart.totalPrice, // In Tomans
        Authority: req.query.Authority,
    }).then(response => {
        //console.log(response.status );
        if (response.status !== 100) {
            console.log(response.status);
            req.flash('error' , response.status);
            res.redirect('/checkOut');
        } else {
            //console.log(`Verified! Ref ID: ${response.RefID}`);
            let query = { resId: req.query.Authority };
            Transaction.update(query, { status: 1 })
            .exec()
            .then(result => {
              req.flash('success' , "Pay is SuccessFully!");
              req.session.cart = null;
              res.redirect('/');
            }).catch((err) => {
              req.flash('error' , err.message);
              //req.cart = null;
              res.redirect('/checkOut');
            });

        }
      }).catch(err => {
        req.flash('error' , err.message);
        //req.cart = null;
        res.redirect('/checkOut');
      });
});

module.exports = router;

function isLoggedIn(req , res , next) {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error' , "Please loggin in our website!!!");
    req.session.oldUrl = req.url;
    //console.log(req.session.oldUrl);
    res.redirect('/users/signin');
}
