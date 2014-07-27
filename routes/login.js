var User = require('../models/user').User;
var Guest = require ('../models/guest').Guest;
var HttpError = require ('../error').HttpError;
var AuthError = require ('../models/user').AuthError;
var async = require('async');

exports.get = function (req, res) {
	var ajax = false;
	if (req.xhr) ajax = true;
	res.render('login', {ajax:ajax});
}

exports.post = function (req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	
	User.authorize (username, password, function (err, user) {
		if (err) {
			if (err instanceof AuthError) {
				return next(new HttpError (403, err.message));
			} else {
				return next(err);
			}
		}
		
		Guest.authorize (req.session.gid, function (err, guest) {
			if (err) return next(err);
				delete req.session.gid
				req.session.user = user._id;
				
				var io = req.app.get('io');
				var clients = io.of('/main').connected;
				for (var key in clients) {
					if (clients[key].request.session.id == req.session.id) {
						if (clients[key]) {
							clients[key].emit('login');
						}
					}
				}
				
				res.send({});
		})
	});
}