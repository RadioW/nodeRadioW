var HttpError = require('../error').HttpError;

module.exports = function(req, res, next) {
	if (!req.self) {
		return next(new HttpError(401, "Вы не авторизованы"));
	}
	next();
}