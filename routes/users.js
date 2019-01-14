var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var csrfProtection = csrf();
var User = require('../models/user');
var Order = require('../models/order');

var Cart = require('../models/cart');
router.use(csrfProtection);


// protect routes /profile, chỉ khi đã đăng nhập mới có thể vào profile
router.get('/profile', isLoggedIn, function(req, res, next) {
    Order.find({ user: req.user }, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('users/profile', { orders: orders });
    });
})

// Logout
router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
})

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('users/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/users/profile',
    failureRedirect: '/users/signup',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/users/profile');
    }
});


router.get('/signin', function(req, res, next) {
    var messages = req.flash('error');
    res.render('users/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
})

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/users/signin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/users/profile');
    }
});

router.post('/get_my_likes', function(req, res, next) {
    var _id = req.user._id;
    User.find({ _id: _id })
        .populate('liked')
        .then(function(docs) {
            var results = [];
            for (var i = 0; i < docs.length; i++) {
                results.push({
                    _id: docs.liked[i]._id,
                    name: docs.liked[i].name,
                    price: docs.liked[i].price,
                    image: docs.liked[i].image
                })
            }
            res.json({
                code: 1000,
                message: "OK",
                data: results
            })
        })
})

router.post('/set_user_info', function(req, res, next) {
    var user = new User();
    var _id = req.user._id;
    user.email = req.body.email;
    user.username = req.body.username;
    user.status = req.body.status;
    user.avatar = req.body.avatar;
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.address = req.body.address;
    user.city = req.body.address;
    user.password = user.encryptPassword(req.body.password);
    user.updateOne({ _id: _id }, user, function(err, result) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
})

// route to middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
    // if user is logged in
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to home
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = router;