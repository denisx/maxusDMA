'use strict';

// Paths to datasets and tables

const projectId = 'mdma-175510';

// Paths to postbuy data
const postbuyDatasetId = 'postbuy';
const postbuyTableId = 'all';

// Paths to Google Analytics data
const analyticsDatasetId = 'google_analytics';
const analyticsTableId = 'analytics_';

// Paths to Yandex Metrika data
const metrikaDatasetId = 'metrika';
const metrikaTableId = 'metrika_';

// Methods init
const request = require('request');

// JSON-token path
const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
});

// 


// SQL query config
let queryReq = 'SELECT * FROM ' +

// Optional Yandex Metrika request

// '"Metrika" AS Data_source, '
//test