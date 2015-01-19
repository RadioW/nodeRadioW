"use strict";

var fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
var HttpError = require('../error').HttpError;
var log = require ('./logs')(module);
var path = require('path');
var async = require('async');

exports.convertDate = function(date) {
	return date.getFullYear()+'-'+(date.getMonth()+1 > 9 ? date.getMonth()+1 : '0' + (date.getMonth() + 1))+'-'+(date.getDate() > 9 ? date.getDate() : '0'+date.getDate());
};

exports.checkDir = function(req, dirName, callback) {
	
		fs.exists('./public/data/'+req.session.user, function(exists) {
			if (exists) {
				fs.exists('./public/data/'+req.session.user+'/'+dirName, function(pExists) {
					if (pExists) {
						return callback();
					} else {
						fs.mkdir('./public/data/'+req.session.user+'/'+dirName, function(err) {
							if (err) {
								log.error('can\'t create '+dirName+' in ./public/'+req.session.user);
								return callback(new Error('Can\'t create '+dirName+' in ./public/'+req.session.user));
							}
							return callback();
						});
					}
				});
			} else {
				fs.mkdir('./public/data/'+req.session.user, function(err) {
					if (err) {
						log.error('can\'t create /'+req.session.user+' in ./public/');
						return callback(new Error('can\'t create /'+req.session.user+' in ./public/'));
					}
					fs.mkdir('./public/data/'+req.session.user+'/'+dirName, function(err) {
						if (err) {
							log.error('can\'t create '+dirName+' in ./public/'+req.session.user);
							return callback(new Error('Can\'t create '+dirName+' in ./public/'+req.session.user));
						}
						return callback();
					});
				});
			}
		});
		
};

exports.checkObjectID = function(id, callback) {
	try {
		var cid = new ObjectID(id);
	} catch (e) {
		return callback(new HttpError(404, 'Wrong ID'));
	}
	return callback(null);
};

exports.dirSize = recursiveRead;

function recursiveRead(iPath, callback) {
	fs.lstat(iPath, function(err, stats) {
		if (err) return callback(err);
		var size = stats.size;
		if (stats.isDirectory()) {
			fs.readdir(iPath, function (err, files) {
				if (err) return callback(err);
				async.forEach(files, function(item, callback) {
						recursiveRead(path.join(iPath, item), function (err, dSize) {
							if (err) return callback(err);
							size+=dSize;
							callback(null);
						})
					},
					function(err) {
						callback(err, size);
					}
				);
			});
		} else {
			callback(err, size);
		}
	});

}