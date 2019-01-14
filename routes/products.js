var express = require('express');
var router = express.Router();
var user = require('../routes/users');
var Comment = require('../models/comment');
var User = require('../models/user');
var Product = require('../models/product');
var Category = require('../models/category');
var formidable = require('formidable');
var fs = require('fs');
var Mail = require('../config/email');
var lcs = require('lcs');

router.get('/addproduct', isLoggedIn, function(req, res, next) {
    Category.find(function(err, docs) {
        var categoryChuck = [];
        for (var i = 0; i < docs.length; i += 1) {
            if (docs.has_child = "1")
                categoryChuck.push(docs.slice(i, i + 1));
        }
        res.render('products/addproduct', { category: categoryChuck });
    })
})

router.post('/addproduct', function(req, res, next) {
    var newProduct = Product();
    newProduct.name = req.body.name;
    newProduct.price = req.body.price;
    newProduct.described = req.body.described;
    newProduct.user_id = req.user._id;
    newProduct.category_id = req.body.category_id;
    newProduct.image = req.body.image;
    //Khởi tạo form
    // var form = new formidable.IncomingForm();
    // form.parse(req, function(err, fields, files) {
    //     var oldpath = files.filetoupload.path;
    //     var newpath = 'public/images/' + files.filetoupload.name;
    //     fs.rename(oldpath, newpath, function(err) {
    //         if (err) throw err;
    //         res.write('File uploaded and moved!');
    //         res.end();
    //     });
    // })
    // newProduct.imagePath = newpath;
    newProduct.save(function(err, result) {
        User.findOneAndUpdate({ _id: req.user._id }, { $push: { product: result._id } }, function(err, raw) {
            if (err) return handleError(err);
        });
        if (err) {
            return done(err);
        }
    })
    res.json({
        code: 1000,
        message: "OK",
        data: req.body
    });
})

router.post('/get_list_products', function(req, res, next) {
    Product.find({ 'category_id': req.body.category_id }, function(err, products) {
        res.json({
            code: 1000,
            message: "OK",
            data: products
        });
    })
})

router.get('/get_products', function(req, res, next) {
    res.render('products/get_products');
});

router.post('/get_products', function(req, res, next) {
    Product.findOne({ '_id': req.body._id }, function(err, product) {
        res.json({
            code: 1000,
            message: "OK",
            data: product
        });
    })
})

// edit_products
router.post('/edit_products', function(req, res, next) {
    var _id = req.body._id;
    var newName = req.body.name;
    var newPrice = req.body.price;
    var newDescribed = req.body.described;
    var newImage = req.body.image;
    var newCategory_id = req.body.catepory_id;
    Product.updateOne({ _id: _id }, {
        name: newName,
        described: newDescribed,
        price: newPrice,
        image: newImage,
        catepory_id: newCategory_id
    }, function(err, raw) {
        if (err) return handleError(err);
        console.log('The raw response from Mongo was ', raw);
    });
    res.json({
        code: 1000,
        message: "OK"
    });
})

router.post('/del_products', function(req, res, next) {
    var _id = req.body._id;
    Product.deleteOne({ _id: _id }, function(err, res) {
        if (err) throw err;
        console.log('delete success: ' + res.result + ' record');
    });
    res.json({
        code: 1000,
        message: "OK"
    });
})

router.post('/set_comment_products', function(req, res, next) {
    var newComment = Comment();
    newComment.product_id = req.body.product_id;
    newComment.comment = req.body.comment;
    newComment.poster_id = req.body.poster_id;
    newComment.save(function(err, result) {
        if (err) {
            return done(err);
        }
    })
    Comment
        .find({ 'product_id': req.body.product_id })
        .populate('poster_id')
        .then(function(docs) {
            var results = [];
            for (var i = 0; i < docs.length; i++) {
                results.push({
                    _id: docs[i]._id,
                    created: docs[i].created,
                    product_id: docs[i].product_id,
                    comment: docs[i].comment,
                    poster: {
                        _id: docs[i].poster_id._id,
                        name: docs[i].poster_id.firstname + ' ' + docs[i].poster_id.lastname,
                        avatar: docs[i].poster_id.avatar
                    }
                })
            }
            res.json({
                code: 1000,
                message: "OK",
                data: results
            })
        });
})

router.post('/get_comment_products', function(req, res, next) {
    var product_id = req.body.product_id;
    var index = req.body.index;
    var count = req.body.count;
    Comment
        .find({ 'product_id': req.body.product_id })
        .populate('poster_id')
        .then(function(docs) {
            var results = [];
            for (var i = 0; i < docs.length; i++) {
                results.push({
                    _id: docs[i]._id,
                    created: docs[i].created,
                    product_id: docs[i].product_id,
                    comment: docs[i].comment,
                    poster: {
                        _id: docs[i].poster_id._id,
                        name: docs[i].poster_id.firstname + ' ' + docs[i].poster_id.lastname,
                        avatar: docs[i].poster_id.avatar
                    }
                })
            }
            res.json({
                code: 1000,
                message: "OK",
                data: results
            })
        });
})

router.post('/like_products', function(req, res, next) {
    var product_id = req.body.product_id;
    var products;
    Product.findOneAndUpdate({ _id: product_id }, { $inc: { 'like': 1 } }, function(err, raw) {
        if (err) return handleError(err);
        res.json({
            code: 1000,
            message: "OK",
            data: {
                like: raw.like
            }
        });
    });
    User.findOne({ '_id': req.user._id }, function(err, user) {
        user.liked.insert(product_id);
    });
})

router.post('/report_products', function(req, res, next) {
    var product_id = req.body._id;
    var subject = '[' + product_id + '] ' + req.body.subject;
    var details = req.body.details;
    Mail(subject, details);
    res.json({
        code: 1000,
        message: "OK"
    })
})

router.get('/search', function(req, res, next) {
    res.render('index');
})

router.post('/search', function(req, res, next) {
    var data = [];
    var search = req.body.product_name;
    Product.find(function(err, products) {
        for (var i = 0; i < products.length; i++) {
            lcsCount = new lcs(search, products[i].name)
                .getLength();
            var product = products[i];
            products[i] = ({
                _id: products[i].id,
                name: products[i].name,
                image: products[i].image,
                price: products[i].price,
                like: products[i].like,
                lcsCount: lcsCount
            });
        }
        products.sort(function(a, b) {
            return b.lcsCount - a.lcsCount;
        });
        var chucksize = 3;
        for (var i = 0; i < products.length; i += chucksize) {
            if (products[i].lcsCount < 3) break;
            data.push(products.slice(i, i + chucksize));
        }
        res.render('search', {
            code: 1000,
            message: "OK",
            products: data
        })
    })
})

router.get('/upload_image', function(req, res, next) {
    res.render('products/upload_image');
})

router.post('/upload_image', function(req, res, next) {
    var form = new formidable.IncomingForm();
    var text = req.body.text;
    console.log(text);
    form.parse(req, function(err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = 'public/images/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function(err) {
            if (err) throw err;
            res.write('File uploaded and moved!' + '\n' + text);
            res.end();
        });
    })
})

//Get product
router.get('/:_id', function(req, res, next) {
    Product.findOne({ '_id': req.params._id }, function(err, product) {
        User.findOne({ '_id': product.user_id }, function(err, user) {
            var date = new Date(user.created);
            var seller = {
                name: user.firstname + " " + user.lastname,
                url: user.url,
                numProduct: user.product.length,
                created: date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(),
            };
            Category.find(function(err, categories) {
                if (err) throw err;
                var nameCate = "";
                var idCate = "";
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i]._id == product.category_id) {
                        nameCate = categories[i].name;
                        idCate = categories[i]._id;
                        break;
                    }
                }
                res.render('products/product', {
                    product: product,
                    seller: seller,
                    nameCate: nameCate,
                    idCate: idCate,
                    categories: categories,
                });
            })
        })
    })
})

module.exports = router;

// Kiểm tra đã đăng nhập hay chưa
function isLoggedIn(req, res, next) {
    // if user is logged in
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to home
    res.redirect('/');
}