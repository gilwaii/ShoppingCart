var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Product = require('../models/product');

router.get('/add_category', isLoggedIn, function(req, res, next) {
    Category.find(function(err, docs) {
        var categoryChuck = [];
        for (var i = 0; i < docs.length; i += 1) {
            if (docs.has_child = "1")
                categoryChuck.push(docs.slice(i, i + 1));
        }
        res.render('categories/add_category', { category: categoryChuck });
    })
})

router.post('/add_category', isLoggedIn, function(req, res, next) {
    var newCategory = Category();
    newCategory.name = req.body.name;
    newCategory.parent_id = req.body.parent_id;
    newCategory.sort = '';
    newCategory.has_child = req.body.has_child;
    newCategory.has_brand = req.body.has_brand;
    newCategory.has_size = req.body.has_size;
    newCategory.require_weight = req.body.require_weight;
    newCategory.save(function(err, result) {
        if (err) {
            return done(err);
        }
    })
    res.redirect('add_category');
})

router.get('/get_category', isLoggedIn, function(req, res, next) {
    res.render('categories/get_category');
})
router.post('/get_category', isLoggedIn, function(req, res, next) {
    Category.find({ 'parent_id': req.body.parent_id }, function(err, docs) {
        res.render('categories/get_category', { code: 1000, message: "OK", data: docs });
    })
})

router.get('/:_id', function(req, res, next) {
    Category.findOne({ '_id': req.params._id }, function(err, category) {
        Product.find({ category_id: req.params._id }, function(err, products) {
            var productChuck = [];
            var chucksize = 1;
            for (var i = 0; i < products.length; i += chucksize) {
                productChuck.push(products.slice(i, i + 1));
            }
            Category.find(function(err, categories) {
                if (err) throw err
                res.render('categories/category', {
                    category: category,
                    products: productChuck,
                    categories: categories,
                });
            })
        })
    })
})


module.exports = router;

function isLoggedIn(req, res, next) {
    return next();
}
// function isLoggedIn(req, res, next) {
//     // if user is logged in
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     // if they aren't redirect them to home
//     res.redirect('/');
// }