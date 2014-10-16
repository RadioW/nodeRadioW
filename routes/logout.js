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

	req.session.destroy(function (err) {
	
	var clients = io.of('/main').connected;
    for (var key in clients) {
      if (clients[key].request.session.id == sid) {
		loadSession(sid, function(err, session) {
			if (err) {
			clients[key].emit("error", "server error");
			}
			if (!session) {
				if (!clients[key]) return;
			clients[key].emit("event", {
                    route: "main",
                    event: "logout"
                });
			}
			clients[key].request.session = session;
		});
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

function loadSession(sid, callback) {
	sessionStore.load(sid, function(err, session) {
		if (arguments.length == 0) {
			return callback (null, null);
		} else {
			return callback (null, session);
		}
	});
}