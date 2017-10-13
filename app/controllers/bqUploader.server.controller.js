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
let getFiles = function (dir, files_){
    
  files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (var i in files){
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
};

// Interface to upload data
exports.showForm = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/', 'index.html'));
};

/*------------------------------------------------------*/
// API to upload data from tables from selected dir to BQ
/*------------------------------------------------------*/
exports.uploadDataToBQ = (req, res) => {
    console.log('test data ready');

    // Get all csv tables from selected dir
    let dir = './config/CSVdata/google_analytics/renins/renins'
    let csvFilesArr = getFiles(dir)
    console.log(csvFilesArr);

    // Init necessary dataset    
    let dataset = bigquery.dataset('google_analytics');

    csvFilesArr.forEach(function (element, i) {
        // Name table with the selected filename (split by previous path name)
        let tableId = element.split('renins/renins/')[1].split('.')[0];
        console.log('result table: ' + tableId);

        // Init metadata for selected table
        let metadata = {
            allowJaggedRows: true,
            skipLeadingRows: 1,
            sourceFormat: 'CSV',
            autodetect: true
        };

        // Init table object
        let table = dataset.table(tableId);

        // Send data to BQ
        table.import(element, metadata).then((answ) => {
            console.log("result: " + answ[0].metadata.configuration);
            res.send(answ[0].metadata.configuration);
        });
    });
}