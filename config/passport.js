const passport =  require('passport');
let User = require('../models/user');
let localStrategy = require('passport-local').Strategy;


  passport.use('local.signup',
    new localStrategy(
      // the first parameter is an optional object with options
      {
        // when using the local strategy you MUST name your keys usernameField and passwordField. By default they will have values of "username" and "password", but if you are using something like an email instead of a username or have different name attribute values in your form, modifying the optional object is essential for authentication to work.
        usernameField: "email",
        passwordField: "password",
        // by default this option is set to false, but when specified to true, the first parameter of the verify callback will be the request object. This is quite useful if you want to see if your application has multiple strategies and you want to see if a users is already logged in with an existing strategy, if they are you can simply associate the new strategy with them (eg. they have put in their username/password, but then try to authenticate again through twitter)
        passReqToCallback: true
      },
      // the second parameter to the constructor function is known as the verify callback. Since we have set passReqToCallback as true, the first parameter is the request object. The second parameter is the username which comes from users entered data in a form, the third second parameter is the plain text password which comes from users entered data in a form. The fourth parameter is a callback function that will be invoked depending on the result of the verify callback.
      function verifyCallback(req, email, password, done) {
        //check input validation
        req.checkBody('email' , 'invalid email').notEmpty().isEmail();
        req.checkBody('password' , 'Inavalid password').isLength({min:4});
        const errors = req.validationErrors();
        console.log(errors);
        if (errors) {
          let messages = [];
          errors.forEach(function(error) {
            messages.push(error.msg);
          });
          return done(null , false , req.flash('error' , messages));
        }
        // find a users in the database based on their username
        User.findOne({'email': email}, function(err, userFind) {
          // if there is an error with the DB connection (NOT related to finding the users successfully or not, return the callback with the error)
          if (err) {
            return done(err);
          }
          // if the users is not found in the database or if the password is not valid, do not return an error (set the first parameter to the done callback as null), but do set the second parameter to be false so that the failureRedirect will be reached.

          // validPassword is a method WE have to create for every object created from our Mongoose model (we call these instance methods or "methods" in Mongoose)
          if (userFind) {
            console.log('User exist!');
            return done(null, false, {message: 'users exist!'});
          }
          console.log('ok');
          let user = new User();
          user.email = email;
          user.password = user.encryptPassword(password);
          user.save(function(err , result){
            if (err) {
                console.log(err);
              return done(err);
            }
              console.log(user);
            return done(null , user);
          });
          // if the users has put in the correct username and password, move onto the next step and serialize! Pass into the serialization function as the first parameter the users who was successfull found (we will need it's id to store in the session and cookie)
          //return done(null, users);
        });
      }
    )
  );

  passport.use('local-signin' , new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },function(req , email , password , done) {
    req.checkBody('email' , 'Inavalid Email').notEmpty().isEmail();
    //req.checkBody('password' , 'Inavalid Password!').isDecimal().isLength({min:4});

    req.checkBody({
      'password': {
        // isLength: {
        //   min: 4,
        //   errorMessage: 'Minimum 4 digit!!'
        // },
        isDecimal: {
          errorMessage: 'The product price must be a decimal'
        }
      }
    });

    let errors = req.validationErrors();
    let messages = [];
    if (errors) {
      errors.forEach(function(error){
        messages.push(error.msg);
      });
      return done(null , false , req.flash('error' , messages));
    }
    User.findOne({'email':email} , function(err , user){

      if (err) {
        done(null , err);
      }
      if (!user) {
        return done(null , false , {message:'User is not found in to the database!!!'});
      }
      if (!user.validPassword(password)) {
        return done(null , false , {message:'Password is Wrong!!!'});
      }
      return done(null , user);
    });
  }));

  // this code is ONLY run if the verify callback returns the done callback with no errors and a truthy value as the second parameter. This code only runs once per session and runs a callback function which we can assume will not have any errors (null as the first parameter) and the data we want to put in the session (only the users.id). The successCallback is run next!
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // once a users has been authenticated and serialized, we now find that users in the database on every request. This allows passport to have some useful methods on the request object like req.users (the current users logged in) and req.isAuthenticated() (returns true if the users is logged in or false if not)
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });



module.exports = passport;
