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

let dataSource = [
        ga: {
            id: 'ga',
            name: 'Google Analytics',
            content: {
                dimension: ['industry', 'client', 'site', 'date', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category'],
                metrics: ['visits', 'pageviews', 'bounces', 'session_duration']
            },
            chosen: {
                dimension: [],
                metrics: [],
                goals: 'no'
            }
        },
        ym: {
            id: 'ym',
            name: 'Yandex Metrika',
            content: {
                dimension: ['industry', 'client', 'site', 'date', 'isBounce', 'time_on_site', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'device_category', 'gender', 'age'],
                metrics: ['visits', 'users', 'pageviews']
            },
            chosen: {
                dimension: [],
                metrics: [],
                goals: 'no'
            }
        },
        postbuy: {
            id: 'postbuy',
            name: 'Postbuy',
            content: ['Test1', 'Test2', 'Test3', 'Test4'],
            chosen: []
        }
    },
    campaign: {
        id: 'campaign',
        name: 'Кампании',
        content: [],
        chosen: []
    },
    placement: {
        id: 'placement',
        name: 'Размещение',
        content: [],
        chosen: []
    },
    medium: {
        id: 'medium',
        name: 'Medium',
        content: [],
        chosen: []
    },
    format: {
        id: 'format',
        name: 'Формат',
        content: [],
        chosen: []
    },
    sites: {
        id: 'sites',
        name: 'Сайты',
        content: [],
        chosen: []
    }
];

// Function to compose query to BQ, send it and receive results

let composeQuery = (req, res) => {
    // **
}

// Postbuy query

if (postbuyArr.length > 0) {
    for (i=0;i<postbuyArr.length;i++) {
        postbuySelect += ", " + postbuyArr[i]
    }
    postbuySelect = "SELECT " + postbuySelect + " FROM [mdma-175510:postbuy.all]"
}

// Metrika query

// Analytics query

// SQL query config

let queryReq = 'SELECT * FROM ' +

// Optional Yandex Metrika request

// '"Metrika" AS Data_source,'