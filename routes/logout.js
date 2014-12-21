var User = require('../models/user').User;
var HttpError = require ('../error').HttpError;
var AuthError = require ('../models/user').AuthError;
var async = require('async');
var log = require('../libs/logs')(module);
var sessionStore = require('../libs/sessionStore');


exports.post = function (req, res, next) {
	var sid = req.session.id;
	var uid = req.session.user;
	var io = req.app.get('io');
	log.info('user ' + uid + ' logging out');

	req.session.destroy(function (err) {
	
		var clients = io.of('/main').connected;
		var count = 0;
    	for (var key in clients) {
			if (clients[key].request.session.id == sid) {
				log.info('Refreshing session of '+clients[key].request.user.username+' (id='+clients[key].request.session.user+')');
				++count;
				loadSession(sid, function (err, session, socket) {
					if (err) {
						socket.emit("error", "server error");
					}
					if (!session) {
						if (!socket) return;
						socket.emit("event", {
							route: "main",
							event: "logout"
						});
						log.info(socket.request.user.username+' kicked by logout');
					}
					clients[key].request.session = session;
				}, clients[key]);
			}
		}
	
		if (err) return next(err);
		User.logout(uid, function (err, user) {
			if (err) {
				if (err instanceof AuthError) {
					return next(new HttpError (403, err.message));
				} else {
					return next(err);
				}
			}
			console.log(user.username + " had gone");
			res.redirect('/');
		});
	});
};

function loadSession(sid, callback, socket) {
	sessionStore.load(sid, function(err, session) {
		if (arguments.length == 0) {
			return callback (null, null, socket);
		} else {
			return callback (null, session, socket);
		}
	});
}