var User = require('../models/user').User;

module.exports = function(req, res, next) {
	req.self = res.locals.self = null;

	if (!req.session.user) return next();
	
	User.findById(req.session.user, function (err, user) {
		if (err) return next(err);
		if (!user) return next(err);
		
		req.self = res.locals.self = user;
		next();
	})
}