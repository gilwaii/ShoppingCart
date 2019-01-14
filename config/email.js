var nodemailer = require('nodemailer');
var user = 'youremail@gmail.com';
var password = 'yourpassword';
var service = service;
var sendTo = 'myfriend@yahoo.com';

// Thông tin mail
var transporter = nodemailer.createTransport({
    service: service,
    auth: {
        user: user,
        pass: password
    }
});

function mailOptions(subject, text) {
    mailOptions = {
        from: user,
        to: sendTo,
        subject: subject,
        text: text
    }
};

module.exports = mailOptions;