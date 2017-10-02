var express = require('express');
var router = express.Router();

var googleScopes = [
	'https://www.googleapis.com/auth/plus.me',
	'https://www.googleapis.com/auth/plus.login',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email'
  ];
// Get Homepage
function routes (passport){
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index', { username: req.user.name });
});

router.get('/secure', ensureAuthenticated, function(req, res){
	res.render('securepage', { username: req.user.name });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email',authType: 'reauthenticate' }));
router.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
											successRedirect : '/',
											failureRedirect : '/'
										}));
router.get('/auth/google', passport.authenticate('google', { 
												// access_type: 'offline',
													scope : googleScopes, 
												}));
router.get('/auth/google/callback',
			passport.authenticate('google', {
											successRedirect : '/',
											failureRedirect : '/'
										}));
	

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

return router;
}
module.exports = routes;