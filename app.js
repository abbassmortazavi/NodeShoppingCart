var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let hbs = require('express-handlebars');
let mongoose = require('mongoose');
let session = require('express-session');
let passport = require('passport');
let flash = require('connect-flash');
const expressValidator  = require('express-validator');
let MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//connect the database
//mongoose.connect('localhost:27017/shopping');
mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true});
require('./config/passport');
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs' , hbs({defaultLayout: 'layout' , extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
    secret: 'abbass' ,
    resave: false ,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req , res , next) {
   res.locals.loggin = req.isAuthenticated();
   res.locals.session = req.session;
   next();
});

app.use('/users', usersRouter);
app.use('/', indexRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
