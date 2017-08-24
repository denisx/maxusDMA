'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
   

const CampaignSchema = new Schema({
    industry : String,
    campaign: String,
    dataSource: {
        metrika: {
            metrika1 : String,
            metrika2 : String
        }
    }
});

mongoose.model('Campaign', CampaignSchema);