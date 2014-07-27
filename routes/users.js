var User = require ('../models/user').User;

exports.get = function (req, res, next) {
	var ajax = false;
	if (req.xhr) ajax = true;
	User.find({}) 
	.sort('created')
	.exec(function(err, users) {
		if (err) return next(err);
		res.render('users', {ajax:ajax, users:users});
	});
}
