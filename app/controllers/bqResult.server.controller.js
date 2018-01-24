'use strict'

// Require export packages
let json2csv = require('json2csv');
let fs = require('fs');
const iconv = require('iconv-lite');

// Paths project, datasets, tables
const projectId = 'mdma-175510';

// Methods init
const request = require('request');
const app = require('express');

// JSON-token path
const bigquery = require('@google-cloud/bigquery')({
    projectId: projectId,
    keyFilename: 'config/keys/mdma-17fcdb829378.json'
});

let startTime;


class Data {
    constructor(type, data, datasets, startDate, endDate, filters, id) {
        this.type = type;
        this.data = data;
        this.datasets = datasets;
        this.startDate = startDate;
        this.endDate = endDate;
        this.filters = filters;
        this.id = id;
    }

    selectConfig() {
        if (this.type == 'postbuy') {
            return "SELECT " + this.data.join(', ');
        }
        let selectClause = "SELECT industry, client, site, ";
        let datasource = this.data;
        selectClause += datasource.dimension.join(', ');
        selectClause += ', ';
        for (let key in datasource.metrics) {
            selectClause += "SUM(" + datasource.metrics[key] + ") AS " + datasource.metrics[key] + ", ";
        }
        if (datasource.goals == true) {
            for (let i in this.datasets) {
                let goalsArray = "";
                if (this.datasets[i].goals.length > 0 && this.datasets[i].dataset == datasource.name) {
                    for (let k in this.datasets[i].goals) {
                        goalsArray += "SUM(" + this.datasets[i].goals[k] + ") AS " + this.datasets[i].goals[k] + ", ";
                    }
                    if (this.datasets[i].transactions == 1 && selectClause.indexOf('transactions') == -1 && this.datasets[i].dataset == datasource.name) {
                        goalsArray += "SUM(transactions) AS transactions, ";
                    }
                }
                selectClause += goalsArray;
            }

        }
        return selectClause.replace(/\, $/, ' ');
    };

    fromConfigSplitted() {
        switch (this.type) {
            case "postbuy":
                return " FROM [mdma-175510:postbuy.all] ";
                break;
            case "google_analytics":
            case "yandex_metrika":
                let answ = " FROM "
                for (let key in this.datasets) {
                    if (this.datasets[key].dataset === this.type) {
                        answ += '[mdma-175510:' + this.type + '.' + this.datasets[key].id + '], '
                    }
                }
                return answ.replace(/\, $/, ' ');
                break;
        };
    };

    whereConfig() {
        let whereClause = "";
        switch (this.type) {
            case 'postbuy':
                whereClause += "WHERE CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_start AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) > " + this.startDate + " AND CAST(STRFTIME_UTC_USEC(TIMESTAMP_TO_USEC(CAST(CONCAT(CAST(date_end AS STRING), ' 00:00:00 UTC') AS TIMESTAMP)), '%Y%m%d') AS INTEGER) < " + this.endDate + " "
                for (let key in this.filters) {
                    for (let i = 0; i < this.filters[key].length; i++) {
                        if (i != 0) {
                            whereClause += 'OR ';
                        } else {
                            whereClause += 'AND (';
                        }
                        whereClause += key + ' CONTAINS "' + this.filters[key][i];
                        if (i == this.filters[key].length - 1) {
                            whereClause += '") ';
                        } else {
                            whereClause += '" ';
                        }
                    };
                };
                return whereClause;
            case 'yandex_metrika':
            case 'google_analytics':
                whereClause += "WHERE date > " + this.startDate + " AND date < " + this.endDate + " "
                return whereClause;
        }
    };

    groupByConfig() {
        return "GROUP BY industry, client, site, " + this.data.dimension.join(', ');
    };

    getData() {
        let query = this.selectConfig() + this.fromConfigSplitted() + this.whereConfig();
        if (this.type != 'postbuy') {
            query += this.groupByConfig();
        }
        return new Promise(async(resolve, reject) => {
            let answ = {
                name: this.type,
                data: []
            };
            console.info((new Date()).getTime() - startTime.getTime());
            console.info('Начал запрос в bq для ' + this.type);
            let table = new FileWork(this.id, this.type);
            table.stream
                .on('open', () => {
                    let trig = true;
                    bigquery.createQueryStream(query)
                        .on('error', (err) => {
                            console.error(err);
                            table.writeEmpty();
                            reject({
                                name: this.type,
                                data: []
                            });
                        })
                        .on('data', (row) => {
                            if (this.type == 'postbuy') {
                                if (row.date_start != undefined) {
                                    row.date_start = row.date_start.value;
                                }
                                if (row.date_end != undefined) {
                                    row.date_end = row.date_end.value;
                                }
                            }
                            if (trig) {
                                table.writeFile(table.csvStringHeader(row));
                                trig = false;
                            }
                            table.writeFile(table.csvString(row));
                            if (answ.data.length < 5000) {
                                answ.data.push(row);
                            };
                        })
                        .on('end', () => {
                            console.info((new Date()).getTime() - startTime.getTime());
                            console.info('Записал данные из bq для ' + this.type);
                            table.endWriting();
                        })
                })
                .on('finish', () => {
                    console.log('finish');
                    resolve(answ);
                })
                .on('error', (e) => {
                    console.error(e)
                })
        });
    };

}

class Datasources {
    constructor(filters, datasource) {
        this.filters = filters;
        this.datasource = datasource;
    }


    getTableId(webAnal) {
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

    paramResFunc(param) {
        let filters = this.filters;
        let answ = "";
        if (filters == undefined || filters[param] == undefined) {
            answ = '.*';
            return answ;
        }
        if (param == 'source') {
            answ = (this.datasource.length != 0) ? this.datasource.join('|') : "";
        }
        answ += (filters[param].length != 0) ? filters[param].join('|') : ".*";
        return answ;
    }

    siteSplitter(site) {
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

    get reg() {
        return this.regFunc();
    }

    regFunc() {
        return new RegExp(".*" /* ("+this.paramResFunc('source')+") */ + "_(" + this.paramResFunc('industry') + ")_(" + this.paramResFunc('client') + ")_(" + this.paramResFunc('site') + ")", "i");
    }

    getSchemaById(obj) {
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
}

class FileWork {
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.stream = this.createDownloadFile();
    }

    createDownloadFile() {
        let rand = this.id;
        let adr = './public/lib/CSVData/';
        let filesObj = {
            "postbuy": {
                address: rand + "_Postbuy_benchmarks_upload.csv",
                file: undefined
            },
            "yandex_metrika": {
                address: rand + "_Yandex_Metrika_benchmarks_upload.csv",
                file: undefined
            },
            "google_analytics": {
                address: rand + "_Google_Analytics_benchmarks_upload.csv",
                file: undefined
            }
        };
        console.info((new Date()).getTime() - startTime.getTime());
        console.info('Начал создавать данные для загрузки ' + this.type);
        return fs.createWriteStream(adr + filesObj[this.type].address);
    }

    writeFile(str) {
        this.stream.write(iconv.encode(str,'win1251'));
    }

    csvString(obj) {
        return json2csv({
            data: obj,
            fields: Object.keys(obj),
            del: ';'
        }).split('\n')[1] + ('\n');
    }

    csvStringHeader(obj) {
        return json2csv({
            data: obj,
            fields: Object.keys(obj),
            del: ';'
        }).split('\n')[0] + ('\n');
    }

    endWriting() {
        this.stream.end('');
        console.info((new Date()).getTime() - startTime.getTime());
        console.info('Отдаю для загрузки ' + this.type);
    }

    writeEmpty() {
        this.stream.write(json2csv({
            data: [{
                'Зачем': 'было это скачивать?'
            }],
            fields: ['Зачем'],
            del: ';'
        }));
        console.info((new Date()).getTime() - startTime.getTime());
        console.info('Отдаю для загрузки пустой ' + this.type);
        this.stream.end('');
    }
}

let checkDataSources = (answer) => {
    return new Promise((resolve, reject) => {
        let sourcesArr = [];
        if (answer.google_analytics.dimension.length != 0 || answer.google_analytics.metrics.length != 0 || answer.google_analytics.goals == true) {
            sourcesArr.push('google_analytics')
        };
        if (answer.yandex_metrika.dimension.length != 0 || answer.yandex_metrika.metrics.length != 0 || answer.yandex_metrika.goals == true) {
            sourcesArr.push('yandex_metrika')
        };
        let datasources = new Datasources(answer.filters);
        let splittedObjArr = [];
        let answ = [];
        sourcesArr.forEach((elem) => {
            answ.push(datasources.getTableId(elem));
        });

        Promise.all(answ).then((data) => {
            let unpackedData = [];
            data.forEach((d) => {
                d.forEach((innerD) => {
                    unpackedData.push(innerD);
                })
            });
            data = null;

            let reg = datasources.reg;
            for (let key of unpackedData) {
                if (key.id.match(reg)) {
                    splittedObjArr.push(key);
                }
            }

            let answ2 = []; //Надо переименовать (хранение результата второго промиса)

            splittedObjArr.forEach((elem) => {
                answ2.push(datasources.getSchemaById(elem));
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



let resultQuery = (a, id) => {
    startTime = new Date();
    let sqlArrFunc = (answer) => {
        let answ = [];
        if (answer.postbuy != undefined && answer.postbuy.length > 0) {
            answ.push('postbuy');
        }
        answer.datasets.forEach((obj) => {
            if (!answ.includes(obj.dataset)) {
                answ.push(obj.dataset);
            }
        })
        return answ;
    }
    return new Promise(async(resolve, reject) => {
        let answer = a;
        let promAnsw = [];
        answer.datasets = await checkDataSources(answer);
        let sqlArr = sqlArrFunc(answer);
        for (let key in sqlArr) {
            let query = new Data(sqlArr[key], answer[sqlArr[key]], answer.datasets, answer.startDate, answer.endDate, answer.filters, id);
            promAnsw.push(query.getData());
        }
        Promise.all(promAnsw).then(async(data) => {
            let queryResult = {
                "postbuy":undefined,
                "yandex_metrika":undefined,
                "google_analytics":undefined
            }
            if (data.length == 0) {
                Object.keys(queryResult).forEach((content) => {
                    queryResult[content] = false;
                    let emptyFile = new FileWork(id, content);
                    emptyFile.writeEmpty();
                })
            } else {
                let obj = {};
                data.forEach((d) => {
                    obj[d.name] = d.data;
                })
                data = null;
                Object.keys(queryResult).forEach((result) => {
                    if (obj[result] == undefined) {
                        queryResult[result] = false;
                        let emptyFile = new FileWork(id, result);
                        emptyFile.writeEmpty();
                    } else {
                        queryResult[result] = obj[result];
                        obj[result] = null;
                    }
                })
            }
            console.info('Отправляю на фронт');
            resolve(queryResult);
        });
    })
};

exports.sendResult = async(req, res) => {
    let id = req.user.id;
/*     if (req.body.id == undefined) {
        id = parseInt(Math.random() * 10000);
        res.cookie('id', id, {
            path: '/result'
        });
    } else {
        id = req.body.id;
    }
    delete req.body.id; */
    res.send(await resultQuery(req.body, id));
};

exports.sendTable = (req, res) => {
    let fileSend = () => {
        let id = req.user.id;
        let type = req.query.type;
        fs.access('./public/lib/CSVData/' + id + '_' + type + '_benchmarks_upload.csv', (err) => {
            if (err) {
                setTimeout(() => {
                    return fileSend()
                }, 1000);
            } else {
                res.download('./public/lib/CSVData/' + id + '_' + type + '_benchmarks_upload.csv', type + '_benchmarks_upload.csv', (err) => {
                    if (err) {
                        console.info(err);
                    }
                });
            }
        })
    }
    fileSend();
}

exports.unlinkFiles = (req, res) => {
    let id = req.sessionID;
    let arr = ['Postbuy', 'Google_Analytics', 'Yandex_Metrika'];
    arr.forEach((elem) => {
        fs.unlink('./public/lib/CSVData/' + id + '_' + elem + '_benchmarks_upload.csv', (err) => {
            if (err) {
                console.log(err);
            }
        })
    })
}