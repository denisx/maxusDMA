'use strict';

const path = require('path');
var fs = require('fs');

// Paths to datasets and tables

const projectId = 'mdma-175510';

// Methods init
const request = require('request');

// JSON-token path
const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
});

// Function to list all files in necessary directory
let getFiles = function (dir, files_) {

    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (var i in files) {
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
};

/*------------------------------------------------------*/
// API to delete tables from selected BQ dataset
/*------------------------------------------------------*/
exports.deleteDataFromBQ = (req, res) => {

    // Define dataset object
    let dataset = bigquery.dataset('google_analytics');

    // Define table object if needed to delete only one table
    // let table = dataset.table('Analytics_bankingFinance_renins_renins');

    // Get all csv tables from selected dir
    let dir = './config/CSVdata/google_analytics/renins/renins'
    let csvFilesArr = getFiles(dir)

    // Call delete method to delete selected tables from selected dataset

    csvFilesArr.forEach(function (element, i) {
        // Name table with the selected filename (split by previous path name)
        let tableId = element.split('renins/renins/')[1].split('.')[0];
        console.log('result table: ' + tableId);

        // Init table object
        let table = dataset.table(tableId);

        // Send data to BQ
        table.delete().then(function (data) {
            let apiResponse = data[0];
            res.send(apiResponse);
            console.log(apiResponse);
        });
    });
}

exports.getTablesFromBQDataset = (req, res) => {
    let dataset = bigquery.dataset('google_analytics');
    //let query = "select * from  'wr_live.__TABLES_SUMMARY__'"

    /*dataset.getTables().then(function(data) {
        let tables = data[0];
        let result = [];
        for (var i=0;i<tables.length;i++) {
            let row = [];
            for (var key in tables[i].) {
                row.push(key); //metadata.id.split('mdma-175510:google_analytics.')[1]);
            }
            result.push(row);
        }
        let csvContent = result.join("\n");
        res.send(csvContent);
        console.log(csvContent)
    })*/

    /*dataset.getTables(function (err, tables) {
        let result = [];

        for (let key in tables) {
            result.push(tables[key].id);
        }
        console.log(result);
        res.send(result);
    });*/
    let metrika = 'metrika';
    let test = 'SELECT DISTINCT SPLIT(table_id,"_20")[ORDINAL(1)] as tableName FROM `' + metrika + '.__TABLES_SUMMARY__`;'
    bigquery.query({
        query: test, params: []
    }, function (err, rows) {
        let result = [];

        for (let row of rows) {
            result.push(row.tableName);
        }
        console.log(result);
        res.send(result);
    });
}