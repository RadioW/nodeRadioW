var User = require('../models/user').User;
var Guest = require ('../models/guest').Guest;
var HttpError = require ('../error').HttpError;
var AuthError = require ('../models/user').AuthError;
var RegError = require ('../models/user').RegError;
var async = require('async');

exports.get = function (req, res) {
	var ajax = false;
	if (req.xhr) ajax = true;
	res.render('registration', {ajax:ajax});
};

exports.post = function (req, res, next) {
	if (!req.body.username) return next (new HttpError (403, "Не получено имя пользователя"));
	if (!req.body.password1) return next (new HttpError (403, "Не получен пароль"));
	if (!req.body.password2) return next (new HttpError (403, "Не получено подстверждение пароля"));
	if (req.body.password1 !== req.body.password2) return next(new HttpError(403, "Введенные пароли не совпадают"));
	
	var username = req.body.username;
	var password = req.body.password1;
	
	User.registrate (username, password, function (err, user) {
		if (err) {
			if (err instanceof RegError) {
				return next(new HttpError (403, err.message));
			} else {
				return next(err);
			}
		}
		
		Guest.authorize (req.session.gid, function (err, guest) {
			if (err) return next(err);
				req.session.gid = null;
				req.session.user = user._id;
				res.send({});
		})
	});
};