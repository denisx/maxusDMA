'use strict';

let bq = require('../controllers/bq.server.controller'),
	index = require('../controllers/index.server.controller');

module.exports = (app) => {

	app.route('/filters/gettablesobj')
		.post(bq.sendData);

	app.route('/mongoupdate')
		.post(bq.updateMongo);
};