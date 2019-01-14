var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Order = require('../models/order.js');


var Product = require('../models/product.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    Product.find(function(err, docs) {
        var productChuck = [];
        var chucksize = 3;
        docs.reverse();
        for (var i = 0; i < docs.length; i += chucksize) {
            productChuck.push(docs.slice(i, i + chucksize));
        }
        var username = ''
        if (req.isAuthenticated()) {
            username = req.user.firstname + " " + req.user.lastname;
        }
        res.render('index', {
            title: 'Online Shop',
            products: productChuck,
            isLogin: req.isAuthenticated(),
            username: username
        });
    });
});

router.get('/add-to-cart/:id', function(req, res, next) {
    var productId = req.params.id;
    req.session.oldUrl = req.oldUrl;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product._id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect(req.session.oldUrl);
    })
})

router.get('/shopping-cart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    res.render('checkout', { total: cart.totalPrice });
})

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var order = new Order({
        user: req.user,
        cart: cart,
        address: req.body.address,
        name: req.body.name,
        phone: req.body.phone
    })
    order.save(function(err, result) {
        req.session.cart = null;
        res.redirect('/')
    })
})

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/users/signin');
}