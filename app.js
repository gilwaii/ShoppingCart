var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routers = require('./routes/index');
var userRouter = require('./routes/users');
var productRouter = require('./routes/products');
var categoryRouter = require('./routes/categories');

// Private
var expressHbs = require('express-handlebars'); //
var mongodb = require('mongoose'); //
var session = require('express-session'); //
var passport = require('passport'); //
var flash = require('connect-flash'); //
var validator = require('express-validator'); //
var MongoStore = require('connect-mongo')(session);

var app = express();

mongodb.connect('mongodb://localhost:27017/shopping2', { useNewUrlParser: true }); //
require('./config/passport');

// view engine setup
app.engine('hbs', expressHbs({ defaultLayout: 'layout', extname: 'hbs' })) //

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(validator());

app.use(cookieParser());
app.use(session({
    secret: "kaito.98.bn@gmail.com",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongodb.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } //Lưu cookie trong 180(phút) * 60(s) * 1000(mili s)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    resave: true,
    saveUninitialized: true
}));

// Set login true or false in all pages
app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/', routers);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);

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