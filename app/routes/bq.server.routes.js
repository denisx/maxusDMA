'use strict';

let bq = require('../controllers/bq.server.controller'),
	index = require('../controllers/index.server.controller');

module.exports = (app) => {
	app.route('/filters')
		.post(bq.getQuery);

	app.route('/filters/gettablesobj')
		.get(bq.sendData);

	app.route('/mongoupdate')
		.post(bq.updateMongo);
};