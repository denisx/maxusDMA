'use strict';

// Путь к табличке

const projectId = 'mdma-175510';
const datasetId = 'postbuy';
const tableId = 'all';

// Request просто нужен)

const request = require('request'),
    Campaign = require('mongoose').model('Campaign');

// Прописываем путь к json-токену

const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
})

// Массив с названиями таблиц

let idArr = [];

// Массив в названиями датасетов

let datasetsArr = [];

// Запрос в BQ 
let query = {};

// Цикл по объекту с данными из формы (query), который формирует содержимое оператора WHERE 
let showFiltersAnswer = () => {
    return new Promise((resolve,reject)=>{
        let whereData = "";
        for (let key in query) {
            whereData+=(whereData==="")?' WHERE (':'AND (';
            for (let i = 0; i < query[key].length; i++) {
                if (i != 0) {
                    whereData += 'OR ';
                }
                whereData += key + ' CONTAINS "' + query[key][i];
                whereData += (i == query[key].length - 1)?'") ':'" ';
            }
        }

        let queryReq = 'SELECT ' +
            'industry AS Industry, client AS Client, site AS Site, campaign AS Campaign, successful AS Successful, date_start AS Date_start, date_end AS Date_end, duration as Duration, GROUP_CONCAT(UNIQUE(Placement)) AS Placement, GROUP_CONCAT(UNIQUE(Medium)) AS Medium, GROUP_CONCAT(UNIQUE(Format)) AS Format, "+" AS Postbuy_data FROM [mdma-175510:postbuy.all]' +
            whereData +
            'GROUP BY ' +
            'Industry, Client, Site, Campaign, Successful, Date_start, Date_end, Duration, Postbuy_data';
        let resultsToChangeArr = [];
        resultsToChangeArr.push(bqInvocation(queryReq));
        resultsToChangeArr.push(datasetsInvocation());

        Promise.all(resultsToChangeArr).then((data) => {
            resolve(matchMetrics(data[0], data[1]));
        });
    });
}

let resultToTable;
let trigSendReq = false; // trigger for sending request

// Запишем в переменную queryResults ответ bigquery на sql-запрос (queryreq) в формате JSON
let bqInvocation = (bqQuery) => {
    let queryResult = []; // Массив для результатов SQL-запроса
    let bqInvocationPromise = new Promise((resolve, reject) => {
             bigquery.query(bqQuery)
                .then((data)=>{
                    resolve(data[0]);
                })
                .catch((err)=>{
                    console.log(err.message);
                    reject(queryResult);
                })
            ;
             
    });
    return bqInvocationPromise;
};

let resultToJson = (inputArray) => {
    let output = [];
    let contentOfTable = inputArray.slice(1);
    contentOfTable.forEach((row) => {
        let rowObj = {};
        for (let i = 0; i < row.length; i++) {
            rowObj[inputArray[0][i]] = row[i];
        }
        output.push(rowObj);
    });
    return output;
}

// Запишем в массив datasetArr все датасеты в аккаунте
let datasetsInvocation = () => {
    let tablesObj = {}; // Объект с массивами с таблицами из датасетов

    let getDatasetsPromise = new Promise((resolve, reject) => {
        bigquery.getDatasets(async (err, datasets) => {

            // Массив для списка датасетов

            if (!err) {
                // datasets is an array of Dataset objects.
                for (let i = 0; i < datasets.length; i++) {
                    let currentDatasetId = datasets[i].metadata.datasetReference.datasetId;

                    datasetsArr.push(currentDatasetId)
                    let dataset = bigquery.dataset(currentDatasetId); // Запишем в массив tablesArr все таблицы из датасетов  
                    let tables1 = await dataset.getTables();
                    let tables = tables1[0];
                    for (let k = 0; k < tables.length; k++) {
                            let nameOfId = tables[k].id;
                            if (idArr.indexOf(nameOfId) == -1) {
                                idArr.push(nameOfId);
                            }
                        }
                        tablesObj[currentDatasetId] = idArr;
                        if (Object.keys(tablesObj).length == datasets.length) {
                            resolve(tablesObj);
                        }
                    let tablesQuery = 'SELECT DISTINCT SPLIT(table_id,"_20")[ORDINAL(1)] as tableName FROM `' + currentDatasetId + '.__TABLES_SUMMARY__`;'
                    let rows = await bigquery.query({query: tablesQuery, params:[]});
                    rows = rows[0];
                    let tablesArr = [];

                    for (let j = 0; j < rows.length; j++) {
                        tablesArr.push(rows[j].tableName);
                    }
                }
                resolve(tablesObj);
            }
        })
    });
    return getDatasetsPromise;
};

let matchMetrics = (resultsArr, metricsArr) => {
    let returnArr = [];
    resultsArr.forEach((elem) => {
        let typeClient = elem.Industry.toLowerCase() + '_' + elem.Client.toLowerCase() + '_' + siteSplitter(elem.Site).toLowerCase();
        let elemValues = [];
        Object.keys(metricsArr).forEach((k) => {
            if (k != 'postbuy') {
                elem[k] = '-';
                metricsArr[k].forEach((typeMetrics) => {
                    if (typeMetrics.toLowerCase().split(k.split('_')[1] + '_')[1] == typeClient) {
                        elem[k] = '+';
                        return true;
                    }
                })
            }
        });
        Object.keys(elem).forEach((k) => {
            if (returnArr.length == 0) {
                returnArr.push(Object.keys(resultsArr[0]));
            }
            elemValues.push(elem[k]);
        })
        returnArr.push(elemValues);
    });
    return resultToJson(returnArr);
}

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

let mongoDeleteAndUpdate = async () => {
    await Campaign.remove({});
    let query = 'SELECT industry, client, ad_goal, medium, placement, brand, device, format, successful FROM [mdma-175510:postbuy.all]';
    let info = await bigquery.query(query);
    info.forEach((obj)=>{
        Campaign.create(obj,(err,res)=>{
        })
    });
}

exports.sendData = async (req,res) => {
    res.send(await showFiltersAnswer());
}

exports.getQuery = (req,res) => {
    query = req.body;
    res.status(200);
    res.send('');
}

exports.updateMongo = (req,res) => {
    mongoDeleteAndUpdate();
    res.send('ok');
}