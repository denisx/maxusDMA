'use strict';

let index = require('../controllers/index.server.controller');

module.exports = (app) => {

/*  	app.route('*')
		.get((req,res, next)=>{
			if (!req.secure){
				res.redirect('https://'+req.headers.host+req.url);
			}
			next();
		})  */

	app.route('/')
		.get(index.showIndex);

	app.route('/filters')
		.get(index.showFilters);

	app.route('/result')
		.get(index.showResults);

	app.route('/dirname')
		.get(index.dirname);


};