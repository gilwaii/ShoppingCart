var passport = require('passport');
var User = require('../models/user');
var Product = require('../models/product');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'phonenumber',
    passwordField: 'password',
    firstnameField: 'firstname',
    lastnameField: 'lastname',
    passReqToCallback: true
}, function(req, phonenumber, password, done) {
    req.checkBody('phonenumber', 'Invalid phone').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 6 });
    req.checkBody('lastname', 'Invalid lastname').notEmpty().isLength({ min: 1 });
    req.checkBody('firstname', 'Invalid firstname').notEmpty().isLength({ min: 1 });
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'phonenumber': phonenumber }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, { message: 'Phone number is already in use.' });
        }
        var newUser = new User();
        newUser.phonenumber = phonenumber;
        newUser.password = newUser.encryptPassword(password);
        newUser.lastname = req.body.lastname;
        newUser.firstname = req.body.firstname;
        newUser.avatar = '/public/images/user/avatar_default.png';
        newUser.url = '';
        newUser.address = '';
        newUser.like = 0;
        newUser.status = '';
        newUser.seller = req.body.seller;
        newUser.save(function(err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'phonenumber',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, phonenumber, password, done) {
    req.checkBody('phonenumber', 'Invalid phonenumber').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'phonenumber': phonenumber }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'No user found!' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Wrong password!' });
        }
        return done(null, user);
    });
}));