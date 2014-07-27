var Admin = require ('../models/admin').Admin;
var tool = require('../libs/tools');
var User = require ('../models/user').User;
var HttpError = require('../error').HttpError;
var fs = require('fs');
var async = require('async');
var rimraf = require('rimraf');

exports.get = function (req, res, next) {
	Admin.find({})
	.populate('user')
	.exec(function(err, admin){
		if (err) return next(err);
		User.find({})
		.exec(function(err, users) {
			if (err) return next(err);
			res.render('conclave', {admin:admin, users:users});
		});
	});
}

exports.give = function(req, res, next) {
	tool.checkObjectID(req.body.id, function(err) {
		if (err) return next(err);
		User.findById(req.body.id, function(err, user) {
			if (err) return next(err);
			if (!user) return next(new HttpError(404, 'User is not found!'));
			admin = new Admin ({user: user._id});
			admin.save(function(err) {
				if (err) next(err);
				res.send('ok');
			});
		});
	});
}

exports.del = function(req, res, next) {
	tool.checkObjectID(req.body.uid, function(err) {
		if (err) return next(err);
		User.findById(req.body.uid, function(err, user) {
			if (err) return next(err);
			if (!user) return next(new HttpError(404, 'User is not found!'));
			user.data.photo.splice(req.body.index, 1);
			user.save(function(err) {
				if (err) return next(err);
				res.send('ok')
			});
		});
	});
}

exports.kill = function(req, res, next) {
	async.waterfall([
		function(callback) {
			console.log(req.body.id);
			User.findById(req.body.id, callback); 
		}, 
		function(user, callback) {
			if (!user) return callback(new HttpError(404, "User is not found!"));
			fs.exists('./public/data/'+req.body.id, function(exist) {
				if (exist) {
					rimraf('./public/data/'+req.body.id, function(err, files) {
						if (err) return callback(err);
						callback(null, user);
					});
				} else {
					callback(null, user);
				}
			});
		},
		function(user, callback) {
			console.log('folder dead, admin');
			user.remove(callback)
		},
		function(callback) {
			console.log('user dead, admin');
			Admin.findById(req.body.id, callback)
		},
		function(admin, callback) {
			console.log('user was admin');
			if (admin)	{ 
				admin.remove(function(err) {
					if (err) return callback(err);
					admin.save(function(err) {
						if (err) return callback(err);
						return callback(null);
					});
				});
			}
			callback(null);
		}
	], function(err) {
		if (err) return next(err);
		console.log('ok!');
		return next();
	});
}
