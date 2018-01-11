'use strict';

const config = require('./config'),
    bodyParser = require('body-parser'),
    directory = require('serve-index'),
    morgan = require('morgan'),
    express = require('express'),
    methodOverride = require('method-override'),
    // session = require('express-session'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    timeout = require('connect-timeout'),
    cookieParser = require('cookie-parser');

module.exports = function() {
    const app = express();
    app.use(morgan('dev'));
    app.use(cookieParser(config.sessionSecret));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    
    app.use(methodOverride());
    // app.use(session({
    //     saveUninitialized: true,
    //     resave: true,
    //     secret: config.sessionSecret,
    //     cookie: {
    //         maxAge: new Date(Date.now()+3600000),
    //         httpOnly: true,
    //         secure: true
    //     }
    // }));


    //httpOnly - на локалхост false, на сервер true
    app.use(cookieSession({
        secret: config.sessionSecret,
        overwrite: true,
        // httpOnly: false
        httpOnly: true
    }))

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