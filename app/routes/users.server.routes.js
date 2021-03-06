'use strict';

let users = require('../../app/controllers/users.server.controller'),
	local = require('../../config/strategies/local'),
	passport = require('passport');

module.exports = (app) => {

	app.route('/login')
		.get(users.noLogin)
		.get(users.login)
		.post(users.checkLogin);

 	app.route('/signup')
		.post(users.signup);
		
	app.route('/lostpass')
		.post(users.lostPassword)

	app.route('/signup/name')
		.post(users.giveUserName); 

	app.route('/changepass')
		.post(users.checkAuthentication)
		.post(users.changePassword)

	app.route('/signup/:authId')
		.get(users.verificationSuccess);

	app.param('authId', users.authByHash);

	app.route('/signout')
		.get(users.checkAuthentication)
		.get(users.signout);
	
	
};