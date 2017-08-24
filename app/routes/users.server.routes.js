'use strict';

let users = require('../../app/controllers/users.server.controller'),
	local = require('../../config/strategies/local'),
	passport = require('passport');

module.exports = function (app) {

	app.route('/signup')
		.get(users.showSignup)
		.post(users.signup);

	app.route('/signup/:authId')
		.get(users.verificationSuccess);

	app.route('/signin')
		.get(users.checkAuthentication, users.giveUserName)
		.post(passport.authenticate('local', {
			successRedirect: '/custom',
			failureRedirect: '/'
		}
		));

	app.route('/signout')
		.get(users.signout);

		
	app.param('authId', users.authByHash);
};