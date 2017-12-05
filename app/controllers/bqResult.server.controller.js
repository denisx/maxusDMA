'use strict'

// Require export packages
let json2csv = require('json2csv');
let fs = require('fs');

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

let answer = {};

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
    if (answer.filters == undefined || answer.filters[param] == undefined ) {
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
    if (answer.yandex_metrika!= undefined && (answer.yandex_metrika.metrics.length > 0 || answer.yandex_metrika.dimension.length > 0 || answer.yandex_metrika.goals == true)) {
        answ.push('yandex_metrika');
    }
    if (answer.google_analytics!= undefined && (answer.google_analytics.metrics.length > 0 || answer.google_analytics.dimension.length > 0 || answer.google_analytics.goals == true)) {
        answ.push('google_analytics');
    }
    return answ;
}

// Funtion to configure SELECT clause for google_analytics or yandex_metrika datasources
let selectConfig = (type) => {
    if (type == 'postbuy') {
        return postbuySelectConfig();
    }
    let selectClause = "SELECT industry, client, site, ";
    let datasource = answer[type];
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
        case "google_analytics":
        case "yandex_metrika":
            let answ = " FROM "
            for (let key in answer.datasets) {
                if (answer.datasets[key].dataset === datasource) {
                    answ += '[mdma-175510:'+datasource+'.' + answer.datasets[key].id + '], '
                }
            }
            return answ.replace(/\, $/, ' ');
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
        case 'yandex_metrika':
        case 'google_analytics':
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
let groupByConfig = (type) => {
    let groupByClause = "GROUP BY industry, client, site, ";
    let datasource = answer[type];
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
            answ.push(getTableId(elem));
        });

        Promise.all(answ).then((data) => {
            let unpackedData = [];
            data.forEach((d) => {
                d.forEach((innerD) => {
                    unpackedData.push(innerD);
                })
            });
            let reg = new RegExp(".*_(" + paramResFunc('industry') + ")_(" + paramResFunc('client') + ")_(" + paramResFunc('site') + ")", "i")
            for (let key of unpackedData) {
                if (key.id.match(reg)) {
                    splittedObjArr.push(key);
                }
            }

            let answ2 = []; //Надо переименовать (хранение результата второго промиса)

            splittedObjArr.forEach((elem) => {
                answ2.push(getSchemaById(elem));
            })
            console.log('')
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

let createDownloadFiles = () => {
    return new Promise((res,rej)=>{
        let filesObjArr = [{
        name:"postbuy",
        address:"Postbuy_benchmarks_upload.csv",
        file:undefined,
        nameIndex:0
        }, {
            name:"yandex_metrika",
            address:"Yandex_Metrika_benchmarks_upload.csv",
            file:undefined,
            nameIndex:1
        }, {
            name:"google_analytics",
            address:"Google_Analytics_benchmarks_upload.csv",
            file:undefined,
            nameIndex:2
        }];
        let scsArr = [];

        filesObjArr.forEach((file)=>{
            scsArr.push(filePromise(file));
        });
        Promise.all(scsArr).then(()=>{res();})
    })
    

};

let filePromise = (filesObj) => {
    return new Promise((resolve,reject)=>{
        fs.accessSync('./public/lib/CSVData/'+filesObj.address, (err)=>{
            if(!err) fs.unlinkSync('./public/lib/CSVData/'+filesObj.address);
        });
        if (queryResultArr[filesObj.nameIndex].data){
            filesObj.file = json2csv({
                data: queryResultArr[filesObj.nameIndex].data,
                fields: Object.keys(queryResultArr[filesObj.nameIndex].data[0]),
                del: ';'
            });
        } else {
            filesObj.file = json2csv({
                data: [{'Зачем': 'было это скачивать?'}],
                fields: ['Зачем'],
                del: ';'
            });
        }
        fs.writeFile('public/lib/CSVData/'+filesObj.address, filesObj.file, (err) => {
            if (err) {
                console.log(err);
            } else {
                resolve();
            }
        });
    })
};

let bigQueryPromise = (param) => {
    let query = selectConfig(param) + fromConfigSplitted(param) + whereConfig(param);
    if(param!='postbuy'){
        query += groupByConfig(param);
    }
    return new Promise(async (resolve, reject) => {
        let answ = {
            name: param,
            data: undefined
        };
        answ.data = await bigquery.query(query);
        resolve(answ);
    });
};

let resultQuery = () => {
    return new Promise(async (resolve,reject)=>{
        queryResultArr = [{
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
        ];
        let promAnsw = [];
        let sqlArr = sqlArrFunc();
        answer.datasets = await checkDataSources();
        /* let pr = new Promise((resolve, reject) => {
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
                        if (fromConfigSplitted('yandex_metrika') != " FROM ") {
                            queryConfigObj.ymResultQuery = selectConfig(answer.ym) + fromConfigSplitted('yandex_metrika') + whereConfig('yandex_metrika') + groupByConfig(answer.ym);
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
                        } else {
                            console.log('no yandex metrika data')
                        }
                        break;
                    case 'google_analytics':
                        if (fromConfigSplitted('google_analytics') != " FROM ") {
                            queryConfigObj.gaResultQuery = selectConfig(answer.ga) + fromConfigSplitted('google_analytics') + whereConfig('google_analytics') + groupByConfig(answer.ga);
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
                        } else {
                            console.log('no google analytics data')
                        }
                        break;
                } 
                promAnsw.push(bigQueryPromise(sqlArr[key]));
            }
            resolve(Promise.all(promAnsw));
        }) */
        for (let key in sqlArr) {
            promAnsw.push(bigQueryPromise(sqlArr[key]));
        }
        // pr.then(async (data) => {
        Promise.all(promAnsw).then(async (data)=>{
            queryResultArr.forEach((content) => {
                data.forEach((answ) => {
                    if (content.name == answ.name) {
                        content.data = answ.data[0];
                    }
                })
                if (content.data.length == 0) {
                    content.data = false;
                }
            })
            await createDownloadFiles();
            resolve(queryResultArr);
        });
    })
}


exports.getFiltersAnsw = (req, res) => {
    answer = req.body;
    res.status = 200;
    res.send('');
};

exports.sendResult = async (req,res) => {
    res.send(await resultQuery());
};