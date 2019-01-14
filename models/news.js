var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Schema = bảng trong sql

var schema = new Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('News', schema);