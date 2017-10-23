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

// Object with filter params

let answer = {
    "startDate": "20170101",
    "endDate": "201705031",
    "ga": {
        "dimension": ["industry", "utm_source"],
        "goals": "no",
        "metrics": ["visits", "pageviews"]
    },
    "ym": {
        "dimension": ["time_on_site", "utm_campaign"],
        "goals": "no",
        "metrics": ["pageviews", "users"]
    },
    "postbuy": ["fact_impressions", "fact_video_view_25", "fact_video_view_100", "fact_video_view_75", "fact_video_view_50"],
    "filters": {
        "industry": ["ecommerce", "FMCG"],
        "client": ["Karcher", "Pepsico"],
        "site": ["karcher", "agulife"],
        "medium": ["cpm", "cpa"],
        "placement": ["yahoo", "OTM", "twitter", "DBM", "mail"],
        "campaign": ["lightbulb", "credits", "kasko", "molochko"],
        "format": ["banner", "search", "video_120", "video_45"]
    }
};

// Composing SELECT clause for GA or YM

let selectConfig = (datasource) => {

    let selectClause = "SELECT ";
    for (let key in datasource.dimension) {
        selectClause += datasource.dimension[key] + ", ";
    }
    for (let key in datasource.metrics) {
        if (key < datasource.metrics.length - 1) {
            selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key] + ", ";
        } else {
            selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key];
        }
    }
    return selectClause;
};

// Composing SELECT clause for postbuy

let postbuySelectConfig = () => {

    let selectClause = "SELECT ";
    for (let key in answer.postbuy) {
        if (key < answer.postbuy.length - 1) {
            selectClause += answer.postbuy[key] + ", ";
        } else {
            selectClause += answer.postbuy[key];
        }
    }
    return selectClause;
};

// Composing FROM clause

let fromConfig = () => {
    if (answer.filters.industry != []) {
        industryRes = "";
        for (let i=0;i<answer.filters.industry.length;i++) {
            if (i === answer.filters.industry.length - 1) {
                industryRes += ".*" + answer.filters.industry[i] + ".*";
            } else {
                industryRes += ".*" + answer.filters.industry[i] + ".*|";
            }
        }
    }

    if (answer.filters.client != []) {
        clientRes = "";
        for (let i=0;i<answer.filters.client.length;i++) {
            if (i === answer.filters.client.length - 1) {
                clientRes += ".*" + answer.filters.client[i] + ".*";
            } else {
                clientRes += ".*" + answer.filters.client[i] + ".*|";
            }
        }
    }

    if (answer.filters.site != []) {
        siteRes = "";
        for (let i=0;i<answer.filters.site.length;i++) {
            if (i === answer.filters.site.length - 1) {
                siteRes += ".*" + answer.filters.site[i] + ".*";
            } else {
                siteRes += ".*" + answer.filters.site[i] + ".*|";
            }
        }
    }
	return "_(" + industryRes + ")_(" + clientRes + ")_(" + siteRes + ")"
};

let fromConfig = (datasource) => {
    switch (datasource) {
        case "postbuy":
            "[mdma-175510:postbuy.all]";
            break;
        case "ga":
            "TABLE_QUERY([mdma-175510:google_analytics], 'REGEXP_MATCH(table_id, r'Analytics" + fromConfig() + "')'" + '")' 
            break;
        case "ym":
            "TABLE_QUERY([mdma-175510:metrika], 'REGEXP_MATCH(table_id, r'Metrika" + fromConfig() + "')'" + '")' 
            break;
    };
};

// Composing WHERE clause

let whereConfig = (datasource) => {
    let whereClause = "";
    switch (datasource) {
        case 'postbuy':
            whereClause += "WHERE CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_start AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) > " + answer.startDate + " AND CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_end AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) < " + answer.endDate + " "
            break;
        case 'metrika':
        case 'google_analytics':
            whereClause += "date > " + answer.startDate + " AND date < " + answer.endDate + " "
            break;
    }
    for (let key in answer.filters) {
        for (let i = 0; i < answer.filters[key].length; i++) {
            if (i != 0) {
                whereClause += 'OR ';
            } else {
                whereClause += 'AND (';
            }
            whereClause += key + ' CONTAINS "' + answer.filters[key][i];
            if (i == answer.filters[key].length - 1) {
                whereClause += '") ';
            } else {
                whereClause += '" ';
            }
        };
    };
    return whereClause;
};

// Composing GROUP BY clause

let groupByConfig = (datasource) => {
    let groupByClause = "";
    for (let key in datasource.dimension) {
        if (key < datasource.dimension.length - 1) {
            groupByClause += datasource.dimension[key] + ", ";
        } else {
            groupByClause += datasource.dimension[key];
        }
    }
    return groupByClause;
}

let queryReq = selectClause + fromClause + whereClause

// Function to compose query to BQ, send it and receive results

let composeQuery = (req, res) => {
    // **
};

/* Postbuy query

Metrika query

Analytics query */