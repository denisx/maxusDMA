'use strict';

const Campaign = require('mongoose').model('Campaign'),
	config = require('../../config/config'),
	local = require('../../config/strategies/local'),
	url = require('url'),
    path = require('path');
    
//костыль
exports.campaignCreate = function(req, res, next) {
	req.body.forEach((data)=>{
		var campaign = new Campaign(data);
	var message = null;
	campaign.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
				console.log(message);
				return 'message: success';
			}
		/* else{
			// res.json('msg:scs');
			// res.redirect('/campaign');
		} */});
	})
    res.send('message: success');
    next();
	//res.redirect('/campaign');
};

exports.campaignGetUnique = (req,res,next) => {
	let query = req.body;
	console.log(query);
	Campaign.find(query, (err, campaign) => {
		if (err){
			console.log(err);
			res.json(error);
		} else {
			console.log(campaign);
			res.json(campaign);
			next();
		}
	})
};