'use strict';

let bq = require('../controllers/bqResult.server.controller'),
  index = require('../controllers/index.server.controller');

module.exports = (app) => {
  app.route('/filters/answer')
    .get(bq.sendResult);

  app.route('/filters/answer')
    .post(bq.getFiltersAnsw);

};