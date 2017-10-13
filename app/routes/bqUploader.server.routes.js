'use strict';

let bq = require('../controllers/bqUploader.server.controller'),
	index = require('../controllers/index.server.controller');

module.exports = (app) => {
    app.route('/upload/data')
		.post(bq.uploadDataToBQ);    
};