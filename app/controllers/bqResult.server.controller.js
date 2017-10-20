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
        "industry": ["ecommerce","FMCG"],
        "client": ["Karcher","Pepsico"],
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
        if (selectClause < datasource.metrics.length - 1) {
            selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key] + ", ";
        } else {
            selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key];
        }
    }
    return selectClause;
}

// Composing SELECT clause for postbuy

let postbuySelectConfig = () => {

    let selectClause = "SELECT ";
    for (let key in answer.postbuy) {
		if (selectClause === "SELECT ") {
        	selectClause += answer.postbuy[key] + ", ";
        } else {
			selectClause += answer.postbuy[key];
        }
    }
    return selectClause;
}


// Composing FROM clause ДОДЕЛАТЬ ДОДЕЛАТЬ ДОДЕЛАТЬ ДОДЕЛАТЬ => использовать TABLE_QUERY(dataset, expr)
// (TABLE_QUERY([mdma-175510:google_analytics],  "REGEXP_MATCH(table_id, r'_gEnergy_') AND CAST(REGEXP_EXTRACT(table_id, '.*_(20.*)') AS INTEGER) < 20170515 AND CAST(REGEXP_EXTRACT(table_id, '.*_(20.*)') AS INTEGER) >= 20170513"))
 let fromClause = "";

var fromConfig = (datasource, dateFrom, dateTo) => {
    switch (datasource) {
        case "postbuy": "[mdma-175510:postbuy.all]";
    break;
        case "ga" : "[mdma-175510:google_analytics.Analytics_" + "Industry" + "Client" + "Site";
    break;
        case "ym" : "test3";
    break;
                      };
};

// Composing WHERE clause
let whereConfig = () => {
    let whereClause = "";
    for (let key in answer.filters) {
        if (whereClause === "") {
            whereClause += ' WHERE (';
        } else {
            whereClause += 'AND (';
        }
        for (let i = 0; i < answer.filters[key].length; i++) {
            if (i != 0) {
                whereClause += 'OR ';
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
}
// Composing ORDER BY clause

let orderByClause = "";

// Compose query

let queryReq = selectClause + fromClause + whereClause

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