/**
 * Created by betrayer on 31.08.15.
 */
exports.get = function (req, res) {
	var ajax = false;
	if (req.xhr) ajax = true;
	res.render('music', {ajax:ajax});
};