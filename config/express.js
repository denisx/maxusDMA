'use strict';

const config = require('./config'),
    bodyParser = require('body-parser'),
    directory = require('serve-index'),
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
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        cookie: {
            maxAge: new Date(Date.now()+3600000)
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/users.server.routes.js')(app);
    require('../app/routes/campaign.server.routes.js')(app);
    require('../app/routes/bq.server.routes.js')(app);
    require('../app/routes/bqUploader.server.routes.js')(app);
    require('../app/routes/bqDelete.server.routes.js')(app);
    require('../app/routes/bqResult.server.routes.js')(app);

    app.use(express.static('./public'));
    app.use('/csv', express.static('./public/lib/CSVData/'), directory('./public/lib/CSVData/', {'icons':true}));

    return app;
};