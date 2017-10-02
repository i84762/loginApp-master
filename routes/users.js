var express = require('express');
var router = express.Router();
var passport = require('passport');
const bcrypt = require('bcrypt');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
const gConfig = require('./../_modules/config');
const mqUtil = require('./../_modules/mq/mq-util');

function alreadyLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/');
	}
}
// Get
router.get('/register', function (req, res) {
	res.render('register');
});
router.get('/forgotPassword', function (req, res) {
	res.render('forgotPassword', { register: true, showLink: true });
});
router.get('/register', function (req, res) {
	res.render('register', { register: true });
});
router.get('/login', alreadyLoggedIn, function (req, res) {
	res.render('login');
});
router.post('/login',
	passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
	// function(req, res, next) {
	// 	// issue a remember me cookie if the option was checked
	// 	console.log(req.body);
	// 	if (!req.body.remember_me) { return next(); }

	// 	var token = utils.generateToken(64);
	// 	Token.save(token, { userId: req.user._id }, function(err) {
	// 	  if (err) { return done(err); }
	// 	  res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
	// 	  return next();
	// 	});
	//   },
	function (req, res) {
		res.redirect('/');
	});
router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});
router.get('/verify', function (req, res) {
	let queueName = gConfig.get('/queue/verifyUser');
	mqUtil.sendAndWait(queueName,
		req.query.token,
		{ 'replyTo': req.sessionID + '-verifyUser' },
		(response, headers) => {
			response = JSON.parse(response);
			console.log(response);
			if (response.status == 200) {
				req.flash('success_msg', response.message);
				res.redirect('/users/login');
			}
			else {
				req.flash('error_msg', response.message);
				res.redirect('/users/login');
			}
		}
	);
});
router.get('/resetPassword', function (req, res) {
	let findByFilter = gConfig.get('/queue/findByFilter');
	// console.log(req.query.token);
	mqUtil.sendAndWait(findByFilter,
		JSON.stringify({passwordResetToken : req.query.token}),
		{ 'replyTo': req.sessionID + '-findByFilter' },
		(response, headers) => {
			response = JSON.parse(response);
			// console.log(response);
			if (response.status == 200) {
				// req.flash('success_msg', response.message);
				// console.log(response.body);
				res.render('resetPassword' , {email : response.body[0].email});
			}
			else {
				//req.flash('error_msg', response.message);
				res.render('errorPage', {error_msg : 'Invalid token'});
			}
		}
	);
});



// Post


router.post('/resetPassword', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	console.log(req.body);
	var errors = req.validationErrors();
	let findAndUpdate = gConfig.get('/queue/findAndUpdate');
	if (errors) {
		res.render('resetPassword', {
			errors: errors,
			email : email
		});
		return;
	}
	console.log(req.body.email);
	var package = {query : {email : email}, update : {passwordResetToken : null, password : bcrypt.hashSync(password, 10)}};
	mqUtil.sendAndWait(findAndUpdate,
		package,
		{ 'replyTo': req.sessionID + '-findAndUpdate'},
		(response, headers) => {
			response = JSON.parse(response);
			if (response.status == 200)
				res.render('successPage', { register: false, success_msg: 'Password is changed' });
			else
				res.render('resetPassword', { register: false,  error_msg: response.message });
		}
	);
});

router.post('/forgotPassword', function (req, res) {
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();

	var errors = req.validationErrors();
	let register = gConfig.get('/queue/register');
	if (errors) {
		res.render('forgotPassword', {
			error_msg: 'Enter valid email id',
			register: true,
			showLink: true,
		});
		return;
	}

	let queueName = gConfig.get('/queue/forgotPassword');
	console.log(req.body.email);
	mqUtil.sendAndWait(queueName,
		req.body.email,
		{ 'replyTo': req.sessionID + '-forgotPassword'},
		(response, headers) => {
			response = JSON.parse(response);
			if (response.status == 200)
				res.render('forgotPassword', { register: true, showLink: false, success_msg: response.message });
			else
				res.render('forgotPassword', { register: true, showLink: true, error_msg: response.message });
		}
	);
});


router.post('/register', function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	let register = gConfig.get('/queue/register');
	if (errors) {
		res.render('register', {
			errors: errors
		});
	} else {
		var user = {
			name: name,
			email: email,
			username: username,
			password: bcrypt.hashSync(password, 10)
		};
		mqUtil.sendAndWait(register,
			user,
			{ 'replyTo': req.sessionID + '-register' },
			(response, headers) => {
				response = JSON.parse(response);
				// console.log(response);
				if (response.status == 200) {
					req.flash('success_msg', response.message);
					res.redirect('/users/login');
				}
				else {
					req.flash('error_msg', response.message);
					res.render('register', {
						error_msg: response.message
					});
				}
			}
		);
	}
});
passport.use(new LocalStrategy({
	passReqToCallback: true
},
	function (req, emailId, password, done) {
		// req.session.cookie.expires = false;
		let queueName = gConfig.get('/queue/login');
		let user = { 'email': emailId, 'password': password };
		// console.log(req.sessionID);
		mqUtil.sendAndWait(queueName,
			user,
			{ 'replyTo': req.sessionID + '-login'},
			(response, headers) => {
				response = JSON.parse(response);
				if (response.status == 200)
					return done(null, response.body);
				else
					return done(null, false, { message: response.message });
			}
		);
	}));

module.exports = router;