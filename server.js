'use strict'

require('@google-cloud/debug-agent').start({allowExpressions:true});

const mongoose = require('./config/mongoose'),
    express = require('./config/express'),
    pass = require('./config/passport');

const db = mongoose(),
    app = express(),
    passport = pass(); 

const PORT = process.env.PORT || 8080;

let server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
server.timeout = 500000;

module.exports = app;


