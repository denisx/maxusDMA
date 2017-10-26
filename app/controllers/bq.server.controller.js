'use strict';

// Путь к табличке

const projectId = 'mdma-175510';
const datasetId = 'postbuy';
const tableId = 'all';

// Request просто нужен)

const request = require('request');

// Прописываем путь к json-токену

const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
})

// Массив с названиями таблиц

let idArr = [];

// Массив в названиями датасетов

let datasetsArr = [];

// Цикл по объекту с данными из формы (queryObj), который формирует содержимое оператора WHERE 
exports.showFiltersAnswer = (req, res) => {
    trigSendReq = false;
    let queryObj = req.body;
    let whereData = "";
    for (let key in queryObj) {
        if (whereData === "") {
            whereData += ' WHERE (';
        } else {
            whereData += 'AND (';
        }
        for (let i = 0; i < queryObj[key].length; i++) {
            if (i != 0) {
                whereData += 'OR ';
            }
            whereData += key + ' CONTAINS "' + queryObj[key][i];
            if (i == queryObj[key].length - 1) {
                whereData += '") ';
            } else {
                whereData += '" ';
            }
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
        matchMetrics(data[0], data[1]);
    });
    return res.send('success');
}

let resultToTable;
let trigSendReq = false; // trigger for sending request

// Запишем в переменную queryResults ответ bigquery на sql-запрос (queryreq) в формате JSON
let bqInvocation = (query) => {
    let queryResult = []; // Массив для результатов SQL-запроса
    let bqInvocationPromise = new Promise((resolve, reject) => {
        bigquery.createQueryStream(query)
            .on('error', console.error)
            .on('data', function (row) {
                queryResult.push(row);
                // row is a result from your query.
            })
            .on('end', function () {
                resolve(queryResult);
                // All rows retrieved.
            });
    });
    return bqInvocationPromise;
};

// let resultToJson = (inputArray) => {
//     let output = {};
//     let contentOfTable = inputArray.slice(1);
//     inputArray[0].forEach((elem)=>{
//         output[elem] = [];
//     });
//     contentOfTable.forEach((row)=>{
//         for (let i = 0; i<row.length; i++) {
//             output[Object.keys(output)[i]].push(row[i]);
//         }
//     });
//     return output;
// }

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
        bigquery.getDatasets((err, datasets) => {

            // Массив для списка датасетов

            if (!err) {
                // datasets is an array of Dataset objects.
                for (let i = 0; i < datasets.length; i++) {
                    let currentDatasetId = datasets[i].metadata.datasetReference.datasetId;

                    datasetsArr.push(currentDatasetId)
                    let dataset = bigquery.dataset(currentDatasetId); // Запишем в массив tablesArr все таблицы из датасетов  
                    dataset.getTables((err, tables) => {
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
                    });
                    let tablesQuery = 'SELECT DISTINCT SPLIT(table_id,"_20")[ORDINAL(1)] as tableName FROM `' + currentDatasetId + '.__TABLES_SUMMARY__`;'
                    bigquery.query({
                        query: tablesQuery,
                        params: []
                    }, function (err, rows) {
                        let tablesArr = [];

                        for (i = 0; i < rows.length; i++) {
                            tablesArr.push(rows[i].tableName);
                        }

                        tablesObj[currentDatasetId] = tablesArr;
                        if (Object.keys(tablesObj).length == datasets.length) {
                            resolve(tablesObj);
                        }
                    });
                }
            }
        })
    });
    return getDatasetsPromise;
};

let matchMetrics = (resultsArr, metricsArr) => {
    let returnArr = [];
    resultsArr.forEach((elem) => {
        let typeClient = elem.Industry.toLowerCase() + '_' + elem.Client.toLowerCase();
        let elemValues = [];
        Object.keys(metricsArr).forEach((k) => {
            if (k != 'postbuy') {
                elem[k] = '-';
                metricsArr[k].forEach((typeMetrics) => {
                    if (typeMetrics.split(k + '_')[1] == typeClient) {
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
    resultToTable = resultToJson(returnArr);
    console.log(resultToTable);
    trigSendReq = true;
}

exports.getTablesObj = (req, res) => {
    let sendRes = setInterval(() => {
        if (trigSendReq) {
            res.send(resultToTable);
            clearInterval(sendRes);
        }
    }, 2000);
};