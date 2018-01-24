'use strict';

let index = require('../controllers/index.server.controller'),
	user = require('../controllers/users.server.controller');

module.exports = (app) => {

/*  	app.route('*')
		.get((req,res, next)=>{
			if (!req.secure){
				res.redirect('https://'+req.headers.host+req.url);
			}
			next();
		})  */

	app.route('/benchmarks')
		.get(user.checkAuthentication)
		.get(index.showBenchmarks);

	app.route('/benchmarks/filters')
		.get(user.checkAuthentication)
		.get(index.showBenchmarksFilters);

	app.route('/benchmarks/result')
		.get(user.checkAuthentication)
		.get(index.showBenchmarksResults);

	app.route('/')
		.get(user.checkAuthentication)
		.get(index.showIndex);

	app.route('/dirname')
		.get(index.dirname);


};