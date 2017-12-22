'use strict';

let bq = require('../controllers/bqResult.server.controller'),
  index = require('../controllers/index.server.controller');

module.exports = (app) => {
  app.route('/filters/answer')
    .post(bq.sendResult);

  app.route('/filedownload')
    .get(bq.sendTable);  

  app.route('/filesunload')
    .post(bq.unlinkFiles);

};