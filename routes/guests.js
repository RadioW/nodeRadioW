var Guest = require ('../models/guest').Guest;

exports.get = function (req, res) {
	Guest.find({}, function(err, guest){
		res.send(guest);
	});
}

exports.del = function (req, res) {
	Guest.remove({}, function (err) {
		if (err) return next(err);
		res.redirect('/guests');
	})
}