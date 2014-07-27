var Admin = require('../models/admin').Admin;
var HttpError = require('../error').HttpError;

module.exports = function(req, res, next) {
	Admin.findOne({}, function(err, admin) {
		if (err) return next(err);
		if (!admin) return next();
		Admin.findOne({user: req.session.user}, function(err, admin) {
			if (err) return next(err);
			if (!admin) return next(new HttpError(403, 'Permission denied!'));
			return next();
		});
	});
}