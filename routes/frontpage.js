exports.get = function (req, res) {
	var ajax = false;
	if (req.xhr) ajax = true;
	res.render('frontpage', {ajax:ajax});
}