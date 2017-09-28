'use strict';

let index = require('../controllers/index.server.controller'),
	users = require('../../app/controllers/users.server.controller');

module.exports = (app) => {

	app.route('/')
		.get(index.showIndex);
	
	app.route('/custom')
		.get(users.checkAuthentication, index.showCustom);

	app.route('/filters')
		.get(index.showFilters);
};