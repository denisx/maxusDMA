'use strict';

let index = require('../controllers/index.server.controller');

module.exports = (app) => {

	app.route('/')
		.get(index.showIndex);

	app.route('/filters')
		.get(index.showFilters);
};