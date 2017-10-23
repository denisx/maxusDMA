'use strict';

let campaign = require('../../app/controllers/campaign.server.controller');

module.exports = (app) => {

	app.route('/campaign')
		.post(campaign.campaignCreate);

	app.route('/campaignUnique')
		.post(campaign.campaignGetUnique);

};