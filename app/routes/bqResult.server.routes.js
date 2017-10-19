'use strict';

let bq = require('../controllers/bqResult.server.controller')

module.exports = (app) => {
    app.route('/query/results')
		.get(bq.composeQuery);    
};