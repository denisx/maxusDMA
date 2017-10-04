// Invoke 'strict' JavaScript mode
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
				message = 'Username already exists';
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
	console.log();
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
		name = req.user.email;
	}
	else {
		name = '';
	}
	res.json({'username' : name});
};

//signUp page sender
exports.showSignup = function(req, res, next) {
	//Login check. If logged in, redir to main
	if (!req.user) {
		res.sendFile(path.join(__dirname, '../../public/', 'signup.html'));
	} else {
		return res.redirect('/');
	}
};

//signup controller
exports.signup = function(req, res, next) {
	//Login check. If logged in, redir to main
	if (!req.user) {
		// Create a new 'User' model instance
		var user = new User(req.body);
		var message = null;
		// Set the user provider property
		user.provider = 'local';

		user.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
				console.log(message);
				return res.redirect('/');
			}
			else{
				sendEmailVerification(user.email, user.verHash, fullUrl(req));
			}
		});
		res.redirect('/');
	} else {
		return res.redirect('/');
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
			/* res.redirect('/'); */
		} else {
			req.user = user;
			next();
		}
	})
};

exports.verificationSuccess = function(req, res, next) {
	 User.findByIdAndUpdate(req.user.id, {$set:{verificated : true, verHash : ''}},  function(err, user) {
		if (err) {
			res.redirect('/');
			return next(err);
		} else {
			res.redirect('/custom');
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

exports.campaignCreate = function(req, res, next) {
	var campaign = new Campaign(req.body);
	var message = null;
	campaign.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
				console.log(message);
				return 'message: success';
			}
		else{
			//res.json('msg:scs');
			res.redirect('/campaign');
		}});
	//res.redirect('/campaign');
};

exports.campaign = (req, res) => {
	res.sendFile(path.join(__dirname, '../../public/', 'campaign.html'));
}

exports.campaignGetUnique = (req,res,next) => {
	let query = req.body;
	console.log(query);
	Campaign.find(query, (err, campaign) => {
		if (err){
			console.log(err);
			res.json(error);
		} else {
			console.log(campaign);
			res.json(campaign);
			next();
		}
	})
};

