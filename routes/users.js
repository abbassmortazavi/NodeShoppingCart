var express = require('express');
var router = express.Router();
let csrf = require('csurf');
let passport = require('passport');
let Transaction = require('../models/transaction');
let Cart = require('../models/cart');

let csrfProtection = csrf();
router.use(csrfProtection);

router.get('/pprofile', isLoggedIn , function (req , res , next) {
    Transaction.find({user:req.user} , (err , transactions)=>{
      if (err) {
        console.log(err.message);
      }
      transactions.forEach(function(transaction) {
        cart = new Cart(transaction.cart);
        transaction.items = cart.generateArray();
      });
      res.render('users/pprofile' , {transactions:transactions});
    });

});

router.get('/logout' , isLoggedIn , function(req , res , next) {
    req.logout();
    //req.session.destroy();
    res.redirect('/');
});

router.use('/' , isNotLoggedIn , function (req , res , next) {
   next();
});

router.get('/signup' , function (req , res , next) {
  let messages = req.flash('error');
   res.render('users/signup' , {csrfToken: req.csrfToken() , messages:messages , hasErrors:messages.length > 0});
});

/*router.post('/users/register' , function (req , res , next) {
   res.redirect('/');
});*/
router.post('/register' , passport.authenticate('local.signup' , {
    successRedirect: '/users/pprofile',
    failureRedirect: '/users/signup' ,
    failureFlash:true
}));


router.get('/signin' , function (req , res , next) {
  let messages = req.flash('error');
   res.render('users/signin' , {csrfToken: req.csrfToken() , messages:messages , hasErrors:messages.length > 0});
});
// router.post('/signin' , passport.authenticate('local-signin' , {
//     successRedirect: '/users/pprofile',
//     failureRedirect: '/users/signin' ,
//     failureFlash:true
// }));
router.post('/signin' , passport.authenticate('local-signin' , {
    failureRedirect: '/users/signin' ,
    failureFlash:true
}),(req , res , next)=>{
  let oldUrl = req.session.oldUrl;
  if (oldUrl) {
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  }else {
    res.redirect('/users/pprofile')
  }
});




module.exports = router;

function isLoggedIn(req , res , next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function isNotLoggedIn(req , res , next) {
    if (req.isUnauthenticated())
    {
        return next();
    }
    res.redirect('/');
}
