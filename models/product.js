var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Schema = bảng trong sql

var schema = new Schema({
    image: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    described: {
        type: String,
        require: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        require: true
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', schema);