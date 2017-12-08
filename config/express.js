'use strict';

const config = require('./config'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    express = require('express'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    timeout = require('connect-timeout'),
    session = require('express-session');

module.exports = function() {
    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    // app.use(timeout('240s'));
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }));

    app.use(passport.initialize());
    app.use(passport.session());

//    app.set('views', './app/views');

    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/users.server.routes.js')(app);
    require('../app/routes/campaign.server.routes.js')(app);
    require('../app/routes/bq.server.routes.js')(app);
    require('../app/routes/bqUploader.server.routes.js')(app);
    require('../app/routes/bqDelete.server.routes.js')(app);
    require('../app/routes/bqResult.server.routes.js')(app);

    app.use(express.static('./public'));

    return app;
};