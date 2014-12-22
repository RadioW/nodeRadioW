var User = require('../models/user').User;

module.exports = function(req, res, next) {
	req.serverInfo = res.locals.serverInfo = req.app.get('serverInfo');
	if (!req.session.user) return next();

	User.findById(req.session.user, function (err, user) {
		if (err) return next(err);
		if (!user) return next(err);
		console.log('loaded user');

		req.self = res.locals.self = user;
		next();
	})
};