'use strict';

const mongoose = require('mongoose'),
	crypto = require('crypto'),
    Schema = mongoose.Schema;
   

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        match: [/.*\..*\@maxusglobal\.com/, 'Пожалуйста, укажите ваш рабочий e-mail'],
        unique: true,
        trim: true
    },
    password: {
		type: String,
		validate: [(password) => {return password && password.length >= 8;}, 'Пароль должен быть надежнее']
    },
    salt : String,
    role: {
        type: String,
        enum: ['Admin','User','Editor']
    },
    created: {
        type: Date,
        default: Date.now
    },
    verificated : {
        type: Boolean,
        default: false
    },
    verHash : {
        type: String,
        default: crypto.randomBytes(16).toString('base64').replace('/','0')
    }
});

// Middleware для сохранения пароля
UserSchema.pre('save', function(next) {
	if (this.password) {
		this.salt = new Buffer(crypto.randomBytes(64).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
	}
	next();
});

// Хэширование пароля перед сохранением
UserSchema.methods.hashPassword = function(password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'SHA1').toString('base64');
};

// Create an instance method for authenticating user
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('User', UserSchema);