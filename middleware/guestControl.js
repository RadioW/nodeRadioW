var Guest = require('../models/guest').Guest
var log = require ('../libs/logs')(module);

module.exports = function (req, res, next) {
	if (req.session.user) return next();
	if (req.session.gid) return next();
	Guest.create(req.session.id, function (err, guest) {
		if (err) return next (err);
		req.session.gid = guest.guestID;
		log.info (req.session.gid + ' registred as guest');
		return next();
	});
}