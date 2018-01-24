'use strict';

const config = require('./config'),
    bodyParser = require('body-parser'),
    directory = require('serve-index'),
    morgan = require('morgan'),
    express = require('express'),
    socketio = require('socket.io'),
    methodOverride = require('method-override'),
    events = require('events'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    timeout = require('connect-timeout'),
    cookieParser = require('cookie-parser'),
    yes = require('yes-https');

module.exports = function() {
    const app = express();
    const server = require('http').createServer(app);
    const io = socketio.listen(server);
    // const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

    let streamMemUse = require('fs').createWriteStream('stream.log', {flags:'a'});
    /* setInterval(()=>{
        let d = new Date();
        streamMemUse.write(d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() + ' ' + require('process').memoryUsage().heapUsed / require('os').totalmem() * 100 + '\n');
        // console.log(global.COUNTER_HTTP_CLIENT_REQUEST);
    }, 1000) */
    
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
    // Redirect to https from http
    app.use(yes());
    // Uncomment code below to allow redirect
    // app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/login/]));

    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/users.server.routes.js')(app);
    require('../app/routes/campaign.server.routes.js')(app);
    require('../app/routes/bq.server.routes.js')(app);
    require('../app/routes/bqUploader.server.routes.js')(app);
    require('../app/routes/bqDelete.server.routes.js')(app);
    require('../app/routes/bqResult.server.routes.js')(app);

    app.use(express.static('./public'));
    app.use('/csv', express.static('./public/lib/CSVData/'), directory('./public/lib/CSVData/', {'icons':true}));

    let online = 0;
    io.on('connection', (socket)=>{
        online++;
        socket.emit('count', {count:online});
        socket.on('hello', function (data) {
            console.log('Connected ' + this.id + ' on ' + this.handshake.headers.referer.split('?')[0] + ' total ' + online);
          });
        socket.on('disconnect', ()=>{
            online--;
            console.log('Disconnect ' + socket.id + ' on ' + socket.handshake.headers.referer.split('?')[0] + ' total ' + online);
            socket.emit('count', {count:online});
        })
    })



    return server;

};