'use strict';

let bq = require('../controllers/bq.server.controller'),
	index = require('../controllers/index.server.controller');

module.exports = (app) => {
	app.route('/filters')
		.post(bq.showFiltersAnswer);

	app.route('/filters/gettablesobj')
		.get(bq.getTablesObj);
};