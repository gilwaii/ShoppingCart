var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Schema = bảng trong sql

var schema = new Schema({
    name: {
        type: String,
        require: true
    },
    parent_id: Object,
    sort: {
        type: String
    },
    has_child: String,
    has_brand: String,
    has_size: String,
    require_weight: String,
    image: String
});

module.exports = mongoose.model('Category', schema);