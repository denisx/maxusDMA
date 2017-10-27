'use strict';

// Paths project, datasets, tables

const projectId = 'mdma-175510';

// Methods init
const request = require('request');

// JSON-token path
const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
});

// Variables to configure SQL query as text string for each datasource
let queryConfigObj = {
    "postbuyResultQuery": "",
    "ymResultQuery": "",
    "gaResultQuery": ""
}

// Array with objects to record query results
// Each have 'data' property to receive data and 'name' property with datasource name
let queryResultArr = [{
        'postbuy': {
            'data': [],
            'name': 'postbuy'
        }
    },
    {
        'yandex_metrika': {
            'data': [],
            'name': 'yandex_metrika'
        }
    },
    {
        'google_analytics': {
            'data': [],
            'name': 'google_analytics'
        }
    },
]


// TEST object with filter params. Should be named 'answer'.
let answer = {
    "startDate": "20170101",
    "endDate": "201705031",
    "ga": {
        "dimension": ["industry", "utm_source"],
        "goals": "no",
        "metrics": ["visits", "pageviews"],
        "name": "google_analytics"
    },
    "ym": {
        "dimension": ["time_on_site", "utm_campaign"],
        "goals": "no",
        "metrics": [], //["users"],
        "name": "yandex_metrika"
    },
    "postbuy": ["industry", "client", "brand", "site", "date_start", "date_end", "campaign", "placement", "medium", "clicks", "sessions", "unique_users"],
    "filters": {
        "industry": ["ecommerce", "FMCG"],
        "client": ["karcher", "pepsico", "osram"],
        "site": ["karcher", "agulife", "lampy"],
        "medium": ["cpm", "cpa", "cpc"]
    }
};

// Define variables to check for tables existance
let industryRes = ""
for (let i in answer.filters.industry) {
    if (answer.filters.industry.length === 0) {
        industryRes += ".*";
    } else if (i < answer.filters.industry.length - 1) {
        industryRes += answer.filters.industry[i] + "|"
    } else {
        industryRes += answer.filters.industry[i]
    }
}

let clientRes = ""
for (let i in answer.filters.client) {
    if (answer.filters.client.length === 0) {
        clientRes += ".*";
    } else if (i < answer.filters.client.length - 1) {
        clientRes += answer.filters.client[i] + "|"
    } else {
        clientRes += answer.filters.client[i]
    }
}

let siteRes = ""
for (let i in answer.filters.site) {
    if (answer.filters.client.length === 0) {
        siteRes += ".*";
    } else if (i < answer.filters.site.length - 1) {
        siteRes += answer.filters.site[i] + "|"
    } else {
        siteRes += answer.filters.site[i]
    }
}

// Init 'sqlArr' array to record if datasource have been chosen by user and we should query table(s) from this datasource
let sqlArr = [];

if (answer.postbuy.length > 0) {
    sqlArr.push('postbuy');
}
if (answer.ym.metrics.length > 0) {
    sqlArr.push('yandex_metrika');
}
if (answer.ga.metrics.length > 0) {
    sqlArr.push('google_analytics');
}

let sqlArrLen = 0;
for (let key in sqlArr) {
    sqlArrLen++;
}

// Funtion to configure SELECT clause for google_analytics or metrika datasources
let selectConfig = (datasource) => {

    let selectClause = "SELECT '" + datasource.name + "' AS datasource, ";
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

// Function to configure SELECT clause for postbuy table
let postbuySelectConfig = () => {

    let selectClause = "SELECT 'postbuy' AS datasource, ";
    for (let key in answer.postbuy) {
        if (key < answer.postbuy.length - 1) {
            selectClause += answer.postbuy[key] + ", ";
        } else {
            selectClause += answer.postbuy[key];
        }
    }
    return selectClause;
};

// Function  to configure FROM clause to each datasource
let fromConfig = () => {

    let industryRes = "";
    let clientRes = "";
    let siteRes = "";

    if (answer.filters.industry != []) {
        for (let i = 0; i < answer.filters.industry.length; i++) {
            if (i === answer.filters.industry.length - 1) {
                industryRes += ".*" + answer.filters.industry[i] + ".*";
            } else {
                industryRes += ".*" + answer.filters.industry[i] + ".*|";
            }
        }
    }

    if (answer.filters.client != []) {
        for (let i = 0; i < answer.filters.client.length; i++) {
            if (i === answer.filters.client.length - 1) {
                clientRes += ".*" + answer.filters.client[i] + ".*";
            } else {
                clientRes += ".*" + answer.filters.client[i] + ".*|";
            }
        }
    }

    if (answer.filters.site != []) {
        for (let i = 0; i < answer.filters.site.length; i++) {
            if (i === answer.filters.site.length - 1) {
                siteRes += ".*" + answer.filters.site[i] + ".*";
            } else {
                siteRes += ".*" + answer.filters.site[i] + ".*|";
            }
        }
    }
    return "_(" + industryRes + ")_(" + clientRes + ")_(" + siteRes + ")"
};

// Function  to finally configure FROM clause to each datasource :)
let fromConfigSplitted = (datasource) => {
    switch (datasource) {
        case "postbuy":
            return " FROM [mdma-175510:postbuy.all] ";
            break;
        case "ga":
            return ' FROM TABLE_QUERY([mdma-175510:google_analytics], "REGEXP_MATCH(table_id, r' + "'Analytics" + fromConfig() + "')" + '") '
            break;
        case "ym":
            return ' FROM TABLE_QUERY([mdma-175510:metrika], "REGEXP_MATCH(table_id, r' + "'Metrika" + fromConfig() + "')" + '") '
            break;
    };
};

// Function to configure WHERE clause
let whereConfig = (datasource) => {
    let whereClause = "";
    switch (datasource) {
        case 'postbuy':
            whereClause += "WHERE CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_start AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) > " + answer.startDate + " AND CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_end AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) < " + answer.endDate + " "
            break;
        case 'ym':
        case 'ga':
            whereClause += "WHERE date > " + answer.startDate + " AND date < " + answer.endDate + " "
            break;
    }
    if (datasource === 'postbuy') {
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
    }
    return whereClause;
};

// Function to configure GROUP BY clause
let groupByConfig = (datasource) => {
    let groupByClause = "GROUP BY ";
    for (let key in datasource.dimension) {
        if (key < datasource.dimension.length - 1) {
            groupByClause += datasource.dimension[key] + ", ";
        } else {
            groupByClause += datasource.dimension[key];
        }
    }
    return groupByClause;
};

// Function to send query to BQ and receive results. Query loops through 'sqlArr' and switch 'bigquery.query' for each selected datasource
let queryResult = [];
exports.resultQuery = (req, res) => {

    let promAnsw = [];
    let pr = new Promise((resolve, reject) => {
        for (let key in sqlArr) {
            switch (sqlArr[key]) {
                case 'postbuy':
                    queryConfigObj.postbuyResultQuery += postbuySelectConfig() + fromConfigSplitted('postbuy') + whereConfig('postbuy');
                    let prPostBuy = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.postbuyResultQuery, function (err, rows) {
                            if (!err) {
                                resolve(rows);

                            }
                        });
                    });
                    promAnsw.push(prPostBuy);
                    break;
                case 'yandex_metrika':
                    queryConfigObj.ymResultQuery += selectConfig(answer.ym) + fromConfigSplitted('ym') + whereConfig('ym') + groupByConfig(answer.ym);
                    let prYM = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.ymResultQuery, function (err, rows) {
                            if (!err) {
                                resolve(rows);
                            }
                        });
                    });
                    promAnsw.push(prYM);
                    break;
                case 'google_analytics':
                    queryConfigObj.gaResultQuery += selectConfig(answer.ga) + fromConfigSplitted('ga') + whereConfig('ga') + groupByConfig(answer.ga);
                    let prGA = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.gaResultQuery, function (err, rows) {
                            if (!err) {
                                resolve(rows);
                            }
                        });
                    });
                    promAnsw.push(prGA);
                    break;
            }
        }
        resolve(Promise.all(promAnsw));
    })
    pr.then((data) => {
        for (let key in data) {
            if (data[key][0].datasource == 'postbuy') {
                queryResultArr[0].postbuy.data = data[key];
            } else if (data[key][0].datasource == 'yandex_metrika') {
                queryResultArr[1].yandex_metrika.data = data[key];
            } else if (data[key][0].datasource == 'google_analytics') {
                queryResultArr[2].google_analytics.data = data[key];
            }
        }
        console.log(queryResultArr);
        res.send(queryResultArr);
    })
}

exports.checkDataSources = (req, res) => {
    let tablesArr = [];
    let splittedObjArr = []
    let webAnalArr = ['google_analytics', 'metrika'];
    let pr = new Promise((resolve, reject) => {
        let answ = [];
        for (let i = 0; i < webAnalArr.length; i++) {
            //let dataset = ;
            bigquery.dataset(webAnalArr[i]).getTables().then((data) => {
                for (let j in data[0]) {
                    answ.push({
                        'id': data[0][j].metadata.tableReference.tableId,
                        'dataset': webAnalArr[i]
                    });
                }
                if (i == webAnalArr.length - 1) {
                    resolve(answ);
                }
            });
        }


    });
    pr.then((data) => {

        var reg = new RegExp(".*_(" + industryRes + ")_(" + clientRes + ")_(" + siteRes + ")", "i")

        for (let key of data) {
            if (key.id.match(reg)) {
                splittedObjArr.push(key);
            }
        }

        console.log(splittedObjArr);

            let prS = new Promise((resolve, reject) => {
                for (let i = 0; i < splittedObjArr.length; i++) {
                    bigquery.dataset(splittedObjArr[i].dataset).table(splittedObjArr[i].id).getMetadata().then(function (data) {
                        let schemaArr = [];
                        let apiResponse = data[1];
                        for (let k in apiResponse.schema.fields) {
                            schemaArr.push(apiResponse.schema.fields[k].name)
                        }
                        splittedObjArr[i].schema = schemaArr;
                        if (i == splittedObjArr.length - 1) {
                            resolve(splittedObjArr);
                        }
                    });

                }
            });
            prS.then((data) => {
                //console.log(schemaArr);
                res.send(splittedObjArr);
            });
    });

};

/*exports.getGoalsFromSchema = (req, res) => {
    let schemaArr = [];
    let pr = new Promise((resolve, reject) => {
    let testArr = ['Analytics_bankingFinance_renins_renins', 'Analytics_ecommerce_osram_lampy']
    for (let i = 0; i < testArr.length; i++) {
        bigquery.dataset("google_" + testArr[i].split("_")[0].toLowerCase()).table(testArr[i]).getMetadata().then(function (data) {
            let apiResponse = data[1];
            for (let i in apiResponse.schema.fields) {
                schemaArr.push(apiResponse.schema.fields[i].name)
            }
            if (i == testArr.length - 1) {
                    resolve(schemaArr);
                }
        });
    }
    });
    pr.then((data) => {
        console.log(schemaArr);
        res.send(schemaArr);
    });
}*/