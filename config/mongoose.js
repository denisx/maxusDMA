'use strict';

const config = require('./config'),
    mongoose = require('mongoose');

module.exports = () => {
    mongoose.Promise = global.Promise;
    const db = mongoose.connect(config.db);

    require('../app/models/user.server.model');

    return db;
};