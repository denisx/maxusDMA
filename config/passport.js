'use strict';

const passport = require('passport'),
    mongoose = require('mongoose');

module.exports = ()=>{
    const User = mongoose.model('User');

    require('./strategies/local.js')();

    passport.serializeUser((user,done)=>{
        done(null, user.id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id, '-password -salt', (err, user)=>{
            done(err,user);
        });
    });

    
};