'use strict';

let users = require('../../app/controllers/users.server.controller'),
	local = require('../../config/strategies/local'),
	passport = require('passport');

module.exports = (app) => {

	app.route('/signup')
		.get(users.showSignup)
		.post(users.signup);

	app.route('/signup/:authId')
		.get(users.verificationSuccess);

	app.route('/login')
		.get(users.login)
		.post(passport.authenticate('local', users.giveUserName));
		
	app.route('/signout')
		.get(users.signout);
	
	app.param('authId', users.authByHash);
};