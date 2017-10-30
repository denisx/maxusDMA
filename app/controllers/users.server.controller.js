'use strict';

// Load the module dependencies
const User = require('mongoose').model('User'),
	Campaign = require('mongoose').model('Campaign'),
	passport = require('passport'),
	config = require('../../config/config'),
	local = require('../../config/strategies/local'),
	url = require('url'),
	path = require('path'),
	mailjet = require ('node-mailjet').connect(config.mailJetsecret0, config.mailJetsecret1);

	
// Create a new error handling controller method
let getErrorMessage = function(err) {
	// Define the error message variable
	var message = '';

	// If an internal MongoDB error occurs get the error message
	if (err.code) {
		switch (err.code) {
			// If a unique index error occurs set the message error
			case 11000:
			case 11001:
				message = 'Пользователь уже существует';
				break;
			// If a general error occurs set the message error
			default:
				message = 'Something went wrong';
		}
	} else {
		// Grab the first error message from a list of possible errors
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	// Return the message error
	return message;
};

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}

let sendEmailVerification = function(sendEmail, verParam, webSite){
	const request = mailjet
    .post("send")
    .request({
        "FromEmail":"tech.maxus.ru@gmail.com",
        "FromName":"MaxusTech",
        "Subject":"E-mail verification",
		"Text-part":"This message is automatically sent by server. Mdma project opening soon. Пройдите по ссылке для подтверждения аккаунта:",
        "Html-part":"<h3>This message is automatically sent by server.</h3><br />Mdma project opening soon!<br />Пройдите по ссылке для подтверждения аккаунта: <a href='"+ webSite +'/'+ verParam+"'>",
        "Recipients":[{"Email":sendEmail}]
	});
	request
    .then(result => {
        console.log(result.body)
    })
    .catch(err => {
        console.log(err.statusCode)
    })
};

exports.giveUserName = (req, res, next) => {
	let name;
	if (req.user) {
		name = req.user.name;
	}
	else {
		name = '';
	}
	res.json({'username' : name});
};

//signup controller
exports.signup = function(req, res, next) {
	//Login check. If logged in, redir to main
	if (!req.user) {
		// Create a new 'User' model instance

		if (req.body.password == null || req.body.email == null || req.body.name == null){
			res.status('403');
			res.json({'status':'falied'});
			return false
		} else {
			let regMail = /^[a-z]+\.[a-z]+\@(maxusglobal|wavemaker)\.com/;
			let regName = /[А-я]+/;
			if(regMail.exec(req.body.email) == null || regName.exec(req.body.name) == null || req.body.password.length <8){
				res.status('403');
				res.json({'status':'falied'});
				return false
			}
		}
		var user = new User(req.body);
		var message = null;
		// Set the user provider property
		user.provider = 'local';

		user.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
				res.status('403');
				return res.json({'message':message});
			}
			else{
				sendEmailVerification(user.email, user.verHash, fullUrl(req));
				return res.json({'message':'На вашу почту было выслано письмо для подтверждения регистрации'})
			}
		});
	} else {
		return res.redirect('/login');
	}
};

//signout controller
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

//email verification controller
exports.authByHash = function(req,res,next,h){
	User.findOne({
		verHash : h
	}, (err, user) => {
		if (err || user == null){
			res.json('error: Пользователь уже существует').redirect('/');
		} else {
			req.user = user;
			next();
		}
	})
};

exports.verificationSuccess = function(req, res, next) {
	 User.findByIdAndUpdate(req.user.id, {$set:{verificated : true, verHash : ''}},  function(err, user) {
		if (err) {
			res.redirect('/login');
			return next(err);
		} else {
			res.redirect('/login');
		}
	}) 
}; 

exports.checkAuthentication = function(req,res,next){
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/");
    }
}



exports.login = (req, res, next) =>{
	res.sendFile(path.join(__dirname, '../../public/', 'login.html'));
}

exports.checkLogin = (req, res, next) => {
	passport.authenticate('local', (err, user, info)=>{
		console.log(info);
		if (!user){
			res.status('403');
			res.json(info);
			return false;
		}
		res.json(info);
	})(req, res, next);
}

