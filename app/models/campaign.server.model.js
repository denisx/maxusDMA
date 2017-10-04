'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
   

const CampaignSchema = new Schema({
    industry:String,
    client:String,
    brand:String,
    ad_goal:String,
    medium:String,
    placement:String,
    device:String,
    format:String,
    successful:String
});

mongoose.model('Campaign', CampaignSchema);