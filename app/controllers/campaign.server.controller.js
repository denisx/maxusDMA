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
            });
        })
    res.send('message: success');
    next();
};

exports.campaignGetUnique = (req,res,next) => {
    let query = req.body;
    let filtered = {};
	Campaign.find(query, (err, campaign) => {
		if (err){
			console.log(err);
			res.json(error);
		} else {
            campaign.forEach((obj)=>{
                Object.keys(obj._doc).forEach((key)=>{
                    if (key != '_id' && key != '__v'){
                        if (filtered[key] == undefined){
                            filtered[key] = [];
                            filtered[key].push(obj._doc[key]);
                            return false;
                        }
                        if (!filtered[key].includes(obj._doc[key])){
                            filtered[key].push(obj._doc[key]);
                            return false;
                        }
                    }
                });
            });
			res.json(filtered);
			next();
		}
	})
};

