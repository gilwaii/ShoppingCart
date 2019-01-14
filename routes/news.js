var express = require('express');
var router = express.Router();

var News = require('../models/news.js');

router.post('/get_news', function(req, res, next) {
    var _id = req.body._id;
    News.find({ _id: _id }, function(err, news) {
        res.json({
            code: 1000,
            message: "OK",
            data: {
                title: news.title,
                content: news.content,
                created: news.created,
            }
        })
    })
})

router.post('/get_list_news', function(req, res, next) {
    News.find(function(err, news) {
        res.json({
            code: 1000,
            message: "OK",
            data: {
                title: news.title,
                content: news.content,
                created: news.created,
            }
        })
    })
})

module.exports = router;