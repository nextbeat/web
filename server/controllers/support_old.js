// var mail            = require('../lib/mail'),
//     hostName        = require('../utils/hostName'),
//     ValidationError = require('../errors').ValidationError,
//     libphonenumber  = require('libphonenumber'),
//     sms             = require('../lib/sms'),

//     e164Async       = Promise.promisify(libphonenumber.e164);

// module.exports = {

//     getPasswordReset: function(req, res) {
//         var token = req.query.t;

//         models.User.validatePasswordResetToken(token).then(function(user) {
//             return res.render('password-reset', {
//                 "username": user.get('username'),
//                 "token": token
//             });
//         }).catch(function() {
//             return res.render('password-reset', {
//                 "invalid-token": true
//             });
//         });

//     },

//     postPasswordReset: function(req, res) {
//         var password = req.body.password,
//             passwordConfirm = req.body.passwordConfirm,
//             token = req.body.token;

//         models.User.changePassword(password, passwordConfirm, token).then(function(user) {

//             mail.sendMail({
//                 from: 'team@getbubble.me',
//                 to: user.get('email'),
//                 subject: 'Bubble Password Changed',
//                 text: "Hey " + user.get('username') + ",\n\nYour Bubble password has successfully been updated!\n\nTeam Bubble"
//             });

//             return res.render('password-reset', {
//                 "password-changed": true
//             });

//         }).catch(ValidationError, function(e) {

//             if (e.field === "password") {
//                 return res.render('password-reset', {
//                     "password-invalid": true,
//                     "token": token
//                 });
//             }

//             if (e.field === "password2") {
//                 return res.render('password-reset', {
//                     "passwords-different": true,
//                     "token": token
//                 });
//             }

//             // else assume invalid token
//             return res.render('password-reset', {
//                 "invalid-token": true
//             });

//         }).catch(function(e) {

//             console.log(e);

//             return res.render('password-reset', {
//                 "password-change-failed": true
//             });

//         });
//     },

//     getPasswordResetRequest: function(req, res) {
//         res.render('password-reset-request');
//     },

//     postPasswordResetRequest: function(req, res) {
//         var email = req.body.email.toLowerCase();

//         models.User.generatePasswordResetToken(email).then(function(data) {
//             var user = data[0];
//             var tokens = data[1];
//             var scheme = process.env.NODE_ENV === "local" ? "http://" : "https://";
//             var url = scheme + config.hostName() + '/password-reset?t=' + tokens.get('password_reset_token');
//             var username = user.get('username');
//             var message = "Hey " + username + ",\n\n" + "To reset the password to your Bubble account, click the link below. This link will expire in four hours. If the link is expired you can request a new password reset.\n\n" + url + "\n\n" + "Team Bubble";

//             mail.sendMail({
//                 from: 'team@getbubble.me',
//                 to: email,
//                 subject: 'Bubble Password Reset',
//                 text: message
//             });

//             res.render('password-reset-request', {
//                 "request-sent": true
//             });
//         }).catch(ValidationError, function() {
//             return res.render('password-reset-request', {
//                 "email-invalid": true
//             });
//         }).catch(function() {
//             // Assume email not found
//             return res.render('password-reset-request', {
//                 "email-not-found": true
//             });
//         });
//     },

//     sendGetAppSMS: function(req, res) {
//         e164Async(req.body.tel, "US").then(function(result) {
//             return sms.sendMessage({
//                 to: result,
//                 body: "Welcome to the social network that pops! Download Bubble: http://getbubble.me/app"
//             });
//         }).then(function() {
//             res.status(200).send({});
//         }).catch(function(e) {
//             res.status(500).send({ error: e });
//         });
//     },

//     redirectToAppStore: function(req, res) {
//         res.redirect('https://itunes.apple.com/app/id925645610');
//     }
// };