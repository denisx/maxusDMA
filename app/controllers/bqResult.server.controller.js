'use strict';

// Require export packages
let json2csv = require('json2csv');
let fs = require('fs');
let exportFields = [];
let exportData = [];

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
        'data': [],
        'name': 'postbuy'
    },
    {
        'data': [],
        'name': 'yandex_metrika'
    },
    {
        'data': [],
        'name': 'google_analytics'
    },
]

let answer;

exports.getFiltersAnsw = (req, res) => {
    answer = req.body;
    res.status = 200;
    res.send('');
    console.log(answer);
};

// TEST object with filter params. Should be named 'answer'.
/*  let answer = {
    "startDate": "20170101",
    "endDate": "201705031",
    "ga": {
        "dimension": ["industry", "client", "utm_source"],
        "goals": "yes",
        "metrics": ["visits", "pageviews"],
        "name": "google_analytics"
    },
    "ym": {
        "dimension": ["industry", "client", "time_on_site", "utm_campaign"],
        "goals": "yes",
        "metrics": ["users"],
        "name": "yandex_metrika"
    },
    "postbuy": ["industry", "client", "brand", "site", "date_start", "date_end", "campaign", "placement", "medium", "clicks", "sessions", "unique_users"],
    "filters": {
        "industry": ["ecommerce", "FMCG", "bankingFinance", "oilGaz"],
        "client": ["karcher", "pepsico", "osram", "gazpromneft", "renins"],
        "site": ["karcher", "agulife", "lampy", "renins", "gazpromneftOil", "gEnergy"],
        "medium": ["cpm", "cpa", "cpc"]
    },
    "datasets": [{
            "id": "Analytics_bankingFinance_renins_renins",
            "dataset": "google_analytics",
            "schema": [
                "industry",
                "client",
                "site",
                "date",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "device_category",
                "visits",
                "pageviews",
                "bounces",
                "session_duration",
                "goal_quotation_kasko",
                "goal_quotation_osago",
                "goal_quotation_kaskoOsago",
                "goal_request_osago",
                "goal_request_kasko",
                "goal_request_kaskoOsago"
            ],
            "goals": [
                "goal_quotation_kasko",
                "goal_quotation_osago",
                "goal_quotation_kaskoOsago",
                "goal_request_osago",
                "goal_request_kasko",
                "goal_request_kaskoOsago"
            ],
            "transactions": 0
        },
        {
            "id": "Analytics_ecommerce_osram_lampy",
            "dataset": "google_analytics",
            "schema": [
                "industry",
                "client",
                "site",
                "date",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "device_category",
                "visits",
                "pageviews",
                "bounces",
                "session_duration",
                "goal_product_page_visit",
                "goal_add_to_cart",
                "goal_cart_visit",
                "goal_checkout_visit",
                "goal_order",
                "transactions"
            ],
            "goals": [
                "goal_product_page_visit",
                "goal_add_to_cart",
                "goal_cart_visit",
                "goal_checkout_visit",
                "goal_order"
            ],
            "transactions": 1
        },
        {
            "id": "Analytics_oilGaz_gazpromneft_gEnergy",
            "dataset": "google_analytics",
            "schema": [
                "industry",
                "client",
                "site",
                "date",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "device_category",
                "visits",
                "pageviews",
                "bounces",
                "session_duration"
            ],
            "goals": [],
            "transactions": 0
        },
        {
            "id": "Analytics_oilGaz_gazpromneft_gazpromneftOil",
            "dataset": "google_analytics",
            "schema": [
                "industry",
                "client",
                "site",
                "date",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "device_category",
                "visits",
                "pageviews",
                "bounces",
                "session_duration"
            ],
            "goals": [],
            "transactions": 0
        },
        {
            "id": "Metrika_ecommerce_karcher_karcher",
            "dataset": "yandex_metrika",
            "schema": [
                "industry",
                "client",
                "site",
                "date",
                "isBounce",
                "time_on_site",
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "utm_content",
                "device_category",
                "gender",
                "age",
                "visits",
                "users",
                "pageviews",
                "goal_add_to_cart",
                "goal_visit_cart",
                "goal_checkout",
                "goal_order",
                "transactions"
            ],
            "goals": [
                "goal_add_to_cart",
                "goal_visit_cart",
                "goal_checkout",
                "goal_order"
            ],
            "transactions": 1
        }
    ]
}; */

// Define variables to check for tables existance
let siteSplitter = (site) => {
    let reg = new RegExp(/(\.|\-)/g);
    let matches = [];
    let match;
    while ((match = reg.exec(site)) != null) {
        matches.push(match.index);
    }
    site = site.slice(0, matches[matches.length - 1]);
    matches.pop();
    for (let i = matches.length - 1; i > -1; i--) {
        site = site.split(site[matches[i]] + site[matches[i] + 1])[0] + site[matches[i] + 1].toUpperCase() + site.split(site[matches[i]] + site[matches[i] + 1])[1]
    }
    return site;
}

let paramResFunc = (param) => {
    let answ = ""
    if (answer.filters[param] == undefined) {
        answ = '.*';
        return answ;
    }
    if (param == 'site') {
        answer.filters[param].forEach((elem) => {
            if (elem.length === 0) {
                answ += ".*";
            } else if (answer.filters[param].indexOf(elem) <= elem.length - 1) {
                answ += siteSplitter(elem) + "|"
            } else {
                answ += siteSplitter(elem)
            }
        });
        return answ;
    }
    for (let i in answer.filters[param]) {
        if (answer.filters[param].length === 0) {
            answ += ".*";
        } else if (i < answer.filters[param].length - 1) {
            answ += answer.filters[param][i] + "|"
        } else {
            answ += answer.filters[param][i]
        }
    }
    return answ;
}

// Init 'sqlArr' array to record if datasource have been chosen by user and we should query table(s) from this datasource

let sqlArrFunc = () => {
    let answ = [];
    if (answer.postbuy != undefined && answer.postbuy.length > 0) {
        answ.push('postbuy');
    }
    if (answer.ym.metrics.length > 0) {
        answ.push('yandex_metrika');
    }
    if (answer.ga.metrics.length > 0) {
        answ.push('google_analytics');
    }
    return answ;
}

// Funtion to configure SELECT clause for google_analytics or yandex_metrika datasources
let selectConfig = (datasource) => {

    // let selectClause = "SELECT '" + datasource.name + "' AS datasource, ";
    let selectClause = "SELECT industry, client, site, ";
    for (let key in datasource.dimension) {
        selectClause += datasource.dimension[key] + ", ";
    }
    for (let key in datasource.metrics) {
        selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key] + ", ";
    }
    if (datasource.goals == true) {
        for (let i in answer.datasets) {
            let goalsArray = "";
            if (answer.datasets[i].goals.length > 0 && answer.datasets[i].dataset == datasource.name) {
                for (let k in answer.datasets[i].goals) {
                    goalsArray += "SUM(" + answer.datasets[i].goals[k] + ") AS " + answer.datasets[i].goals[k] + ", ";
                }
                if (answer.datasets[i].transactions == 1 && selectClause.indexOf('transactions') == -1 && answer.datasets[i].dataset == datasource.name) {
                    goalsArray += "SUM(transactions) AS transactions, ";
                }
            }
            selectClause += goalsArray;
        }

    }
    return selectClause.replace(/\, $/, ' ');
};

// Function to configure SELECT clause for postbuy table
let postbuySelectConfig = () => {
    if (answer.postbuy == undefined) {
        return ''
    };
    // let selectClause = "SELECT 'postbuy' AS datasource, ";
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

// Function to  configure FROM clause to each datasource
let fromConfigSplitted = (datasource) => {
    switch (datasource) {
        case "postbuy":
            return " FROM [mdma-175510:postbuy.all] ";
            break;
        case "ga":
            let fromGAArr = " FROM "
            for (let key in answer.datasets) {
                if (answer.datasets[key].dataset === "google_analytics") {
                    fromGAArr += '[mdma-175510:google_analytics.' + answer.datasets[key].id + '], '
                }
            }
            return fromGAArr.replace(/\, $/, ' ');
            break;
        case "ym":
            let fromYMArr = " FROM "
            for (let key in answer.datasets) {
                if (answer.datasets[key].dataset === "yandex_metrika") {
                    fromYMArr += '[mdma-175510:yandex_metrika.' + answer.datasets[key].id + '], '
                }
            }
            return fromYMArr.replace(/\, $/, ' ');
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
    let groupByClause = "GROUP BY industry, client, site, ";
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
exports.resultQuery = async(req, res) => {
    console.log('---------------------');
    console.log(answer);
    let promAnsw = [];
    let sqlArr = sqlArrFunc();
    await checkDataSources().then((data) => {
        answer.datasets = data;
    });
    let pr = new Promise((resolve, reject) => {
        for (let key in sqlArr) {
            switch (sqlArr[key]) {
                case 'postbuy':
                    queryConfigObj.postbuyResultQuery = postbuySelectConfig() + fromConfigSplitted('postbuy') + whereConfig('postbuy');
                    console.log(queryConfigObj.postbuyResultQuery);
                    let prPostBuy = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.postbuyResultQuery, function (err, rows) {
                            if (err) {
                                reject(err);
                            } else {
                                let answ = {
                                    name: 'postbuy',
                                    data: rows
                                };
                                resolve(answ);
                            }
                        });
                    });
                    promAnsw.push(prPostBuy);
                    break;
                case 'yandex_metrika':
                    queryConfigObj.ymResultQuery = selectConfig(answer.ym) + fromConfigSplitted('ym') + whereConfig('ym') + groupByConfig(answer.ym);
                    console.log(queryConfigObj.ymResultQuery);
                    let prYM = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.ymResultQuery, function (err, rows) {
                            if (err) {
                                reject(err);
                            } else {
                                let answ = {
                                    name: 'yandex_metrika',
                                    data: rows
                                };
                                resolve(answ);
                            }
                        });
                    });
                    promAnsw.push(prYM);
                    break;
                case 'google_analytics':
                    queryConfigObj.gaResultQuery = selectConfig(answer.ga) + fromConfigSplitted('ga') + whereConfig('ga') + groupByConfig(answer.ga);
                    console.log(queryConfigObj.gaResultQuery);
                    let prGA = new Promise((resolve, reject) => {
                        bigquery.query(queryConfigObj.gaResultQuery, function (err, rows) {
                            if (err) {
                                reject(err);
                            } else {
                                let answ = {
                                    name: 'google_analytics',
                                    data: rows
                                };
                                resolve(answ);
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
        queryResultArr.forEach((content) => {
            data.forEach((answ) => {
                if (content.name == answ.name) {
                    content.data = answ.data;
                }
            })
            if (content.data.length == 0) {
                content.data = false;
            }
        })

        // Return results
        console.log('queryResultArr');
        console.log(queryResultArr);
        res.send(queryResultArr);


        // Configure files for download
        for (let key of queryResultArr) {
            exportFields.push(Object.keys(key.data[0]));
            exportData.push(key.data);
        }
        let PostbuyCSV = json2csv({
            data: exportData[0],
            fields: exportFields[0],
            del: ';'
        });
        let GACSV = json2csv({
            data: exportData[2],
            fields: exportFields[2],
            del: ';'
        });
        let YMCSV = json2csv({
            data: exportData[1],
            fields: exportFields[1],
            del: ';'
        });
        fs.unlink('./public/lib/CSVData/Postbuy_benchmarks_upload.csv', function (error) {
            if (error) {
                console.log('no postbuy file found');
            }
            console.log('Deleted!!');
        });
        fs.unlink('./public/lib/CSVData/Google_Analytics_benchmarks_upload.csv', function (error) {
            if (error) {
                console.log('no GA file found');
            }
            console.log('Deleted!!');
        });
        fs.unlink('./public/lib/CSVData/Yandex_Metrika_benchmarks_upload.csv', function (error) {
            if (error) {
                console.log('no YM file found');
            }
            console.log('Deleted!!');
        });

        fs.writeFile('public/lib/CSVData/Postbuy_benchmarks_upload.csv', PostbuyCSV, function (err) {
            if (err) console.log(err);
            console.log('postbuy file saved');
        });
        fs.writeFile('public/lib/CSVData/Google_Analytics_benchmarks_upload.csv', GACSV, function (err) {
            if (err) console.log(err);
            console.log('GA file saved');
        });
        fs.writeFile('public/lib/CSVData/Yandex_Metrika_benchmarks_upload.csv', YMCSV, function (err) {
            if (err) console.log(err);
            console.log('YM file saved');
        });
    })
}

// Get dataset of table in BQ
let getTableId = (webAnal) => {
    return new Promise((resolve, reject) => {
        let answ = [];
        bigquery.dataset(webAnal).getTables().then((data) => {
            for (let j in data[0]) {
                answ.push({
                    'id': data[0][j].metadata.tableReference.tableId,
                    'dataset': webAnal
                });
            }
            resolve(answ);
        });
    });
};

// Get id and fields of table in BQ
let getSchemaById = (obj) => {
    return new Promise((resolve, reject) => {
        bigquery.dataset(obj.dataset).table(obj.id).getMetadata().then((data) => {
            let schemaArr = {
                'id': obj.id,
                'fields': []
            };
            let apiResponse = data[1];
            for (let k in apiResponse.schema.fields) {
                schemaArr.fields.push(apiResponse.schema.fields[k].name)
            }
            resolve(schemaArr);
        });
    });
};

let checkDataSources = () => {
    return new Promise((resolve, reject) => {
        let tablesArr = [];
        let splittedObjArr = []
        let webAnalArr = ['google_analytics', 'yandex_metrika'];
        let answ = [];
        webAnalArr.forEach((elem) => {
            /*  getTableId(elem).then((data)=>{
                 answ.push(data);
             }); */
            answ.push(getTableId(elem));

        });

        Promise.all(answ).then((data) => {
            let unpackedData = [];
            data.forEach((d) => {
                d.forEach((innerD) => {
                    unpackedData.push(innerD);
                })
            })
            // var reg = new RegExp(".*_(" + industryResFunc() + ")_(" + clientResFunc() + ")_(" + siteResFunc() + ")", "i")
            let reg = new RegExp(".*_(" + paramResFunc('industry') + ")_(" + paramResFunc('client') + ")_(" + paramResFunc('site') + ")", "i")
            for (let key of unpackedData) {
                if (key.id.match(reg)) {
                    splittedObjArr.push(key);
                }
            }

            console.log('splittedObjArr');
            console.log(splittedObjArr);


            let answ2 = []; //Надо переименовать (хранение результата второго промиса)

            splittedObjArr.forEach((elem) => {
                answ2.push(getSchemaById(elem));
            })

            Promise.all(answ2).then((data2) => {
                data2.forEach((element) => {
                    splittedObjArr.forEach((a) => {
                        if (a.id == element.id) {
                            a['schema'] = element.fields;
                        }
                    })
                });
                for (let i in splittedObjArr) {
                    splittedObjArr[i]['goals'] = [];
                    splittedObjArr[i]['transactions'] = 0;
                    for (let k in splittedObjArr[i].schema) {
                        if (splittedObjArr[i].schema[k].indexOf('goal') != -1) {
                            splittedObjArr[i]['goals'].push(splittedObjArr[i].schema[k])
                        } else if (splittedObjArr[i].schema[k].indexOf('transactions') != -1) {
                            splittedObjArr[i]['transactions']++
                        }
                    }
                }
                resolve(splittedObjArr);
            });
        });
    });

};