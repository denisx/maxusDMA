'use strict'

/* require('@google-cloud/debug-agent').start(); */

const mongoose = require('./config/mongoose'),
    express = require('./config/express'),
    pass = require('./config/passport');

const db = mongoose(),
    app = express(),
    passport = pass(); 

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
}); 

module.exports = app;


