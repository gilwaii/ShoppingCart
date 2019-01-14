var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Product = require('../models/product');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    phonenumber: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    avatar: String,
    url: String,
    liked: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    created: { type: Date, default: Date.now },
    status: String,
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    seller: Boolean,
    address: String,
    like: Number,
    product: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
});

userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);