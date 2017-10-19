'use strict';

let bq = require('../controllers/bqDelete.server.controller'),
	index = require('../controllers/index.server.controller');

module.exports = (app) => {
    app.route('/delete/data')
		.post(bq.deleteDataFromBQ);
		
		app.route('/tables/get')
		.get(bq.getTablesFromBQDataset); 
};