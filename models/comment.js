var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Schema = bảng trong sql

var schema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment: {
        type: String,
        require: true
    },
    poster_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', schema);