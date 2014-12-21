var async = require('async');
var log = require ('../../libs/logs')(module);
var cookie = require('cookie');
var sessionStore = require('../../libs/sessionStore');
var HttpError = require('../../error').HttpError;
var User = require('../../models/user').User;
var config = require('../../config');
var cParser = require('cookie-parser');

module.exports = function(socket, next) {
		var handshake = socket.request;
		async.waterfall ([
			function (callback) {
				handshake.cookies = cookie.parse(handshake.headers.cookie || '');
				var sidCookie = handshake.cookies[config.get('session:key')] || '';
				var sid = cParser.signedCookie(sidCookie, config.get('session:secret'));
				
				loadSession(sid, callback);
			},
			function (session, callback) {
				if (!session || session == null) {
					callback(new HttpError(401, "No session"));
				}
				handshake.session = session;
				loadUser(session, callback);
			},
			function (user, callback) {
				if (!user) {
					callback (new HttpError(403, "Anonymus users may not connect"));
				}
				handshake.user = user;
				callback(null);
			}
		], function (err) {
			if (!err) {
				return next();
			}
			if (err instanceof HttpError) {
				return next(new Error('Not authorized'));
			}
			return next(err);
		}
		);
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

function loadUser(session, callback) {

  if (!session.user) {
	if (!session.gid) {	
		//log.debug("Session %s is anonymous", session.id);
		return callback(null, null);
	}
	var username = "Guest " + session.gid;
	var user = new User({username: username, password: "123"});
	return callback(null, user); 
  }

  //log.debug("retrieving user ", session.user);

  User.findById(session.user, function(err, user) {
    if (err) return callback(err);

    if (!user) {
      return callback(null, null);
    }
    //log.debug("user findbyId result: " + user);
    callback(null, user);
  });
}