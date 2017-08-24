'use strict';

let index = require('../controllers/index.server.controller'),
	users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {

	app.route('/')
		.get(index.showIndex);
	
	app.route('/custom')
		.get(users.checkAuthentication, index.showCustom);
};