'use strict';

let bq = require('../controllers/bqResult.server.controller'),
  index = require('../controllers/index.server.controller');

module.exports = (app) => {
  app.route('/query/result')
    .get(bq.resultQuery);

  // app.route('/query/tables')
  //   .get(bq.checkDataSources);

  app.route('/filters/answer')
    .post(bq.getFiltersAnsw);

  app.route('/filters/getanswer')
    .get(bq.resultQuery);

};