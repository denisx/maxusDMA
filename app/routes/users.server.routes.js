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

	app.route('/signin')
		// .get(users.checkAuthentication, users.giveUserName)
		.post(passport.authenticate('local', {
/* 			successRedirect: '/',
			failureRedirect: '/filters' */
		}
		), users.giveUserName);

	app.route('/signout')
		.get(users.signout);

	app.route('/campaign')
		.get(users.campaign)
		.post(users.campaignCreate);

	app.route('/campaignUnique')
		.post(users.campaignGetUnique);
		
	app.param('authId', users.authByHash);
};