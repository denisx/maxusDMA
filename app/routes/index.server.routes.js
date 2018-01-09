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

	app.route('/')
		.get(user.checkAuthentication)
		.get(index.showIndex);

	app.route('/filters')
		// .get(user.checkAuthentication)
		.get(index.showFilters);

	app.route('/result')
		// .get(user.checkAuthentication)
		.get(index.showResults);

	app.route('/dirname')
		.get(index.dirname);


};