"use strict";

var User = require ('../models/user').User;
var ObjectID = require('mongodb').ObjectID;
var HttpError = require('../error').HttpError;
var log = require ('../libs/logs')(module);
var fs = require('fs');
var gm = require('gm');
var tool = require('../libs/tools');
var async = require('async');

exports.get = function (req, res, next) {
	var ajax = false;
	if (req.xhr) {
        ajax = true;
    }
	
	tool.checkObjectID(req.params.id, function(err) {
		if (err) {
            return next(new HttpError(404, 'Wrong user ID'));
        }
		User.findById(req.params.id, function(err, user) {
			if (err) {
                return next(err);
            }
			if (!user) {
                return next(new HttpError(404, 'There is no user with same id in my base!'));
            }
			res.render('user', {ajax:ajax, user:user});
		});
	});
};

exports.saveInfo = function(req, res, next) {
    var io = req.app.get('io');
	if (req.body.username === req.self.username) {  //если пользователь меняет о себе инфу, не меняя username
		req.self.changeInfo(req.body, function(err, user) {
			if (err) {
                return next(err);
            }
            io.of('/main').to(user._id).emit('event', {
                "route": "user",
                "event": "responseInfoShort",
                "data": {
                    "info": user.info,
                    "username": user.username
                }
            });
			res.send('Done!');
		});
	} else {
		User.findOne({'username':req.body.username}, function(err, id) { //проверка, не взял ли пользователь чужой username
			if (err) {
                return next(err);
            }
			if (id) {
                return next(new HttpError(403, 'Извините, но это имя пользователя уже кем-то занято'));
            }
			req.self.username = req.body.username;
			req.self.changeInfo(req.body, function(err, user) {
				if (err) {
                    return next(err);
                }
                io.of('/main').to(user._id).emit('event', {
                    "route": "user",
                    "event": "responseInfoShort",
                    "data": {
                        "info": user.info,
                        "username": user.username
                    }
                });
				res.send('Done!');
			});
		});
	}
};

exports.savePhoto = function(req, res, next) {
	var size = 0;
	var files = [];
	for (var key in req.files) {
		if (req.files.hasOwnProperty(key)) {
			files.push(req.files[key]);
			size += req.files[key].size;
		}
	}
	async.waterfall([
		function (callback) {
			tool.dirSize('./public/data/'+req.self._id, function(err, dSize) {
				if (err) return callback({'err': err, 'fm': 'Failed to read user directory stats'});
				if (req.serverInfo.userSpace - dSize > size) {
					callback(null, files);
				} else {
					log.error('Not enough memory for '+ req.self.username + ' to upload ' + size + ' bytes');
					callback({'err': new Error("Out of memory"), 'fm': 'Not enough memory'})
				}
			});
		},
		function(files, callback) {
			var user = req.self;
			async.map(files, function(file, callback) {
				var oID = new ObjectID();
				gm(file.path).resize(130, 260).noProfile().write('./public/data/'+user._id+'/photo/'+oID+'prev.jpg', function(err) {
					if (err) {
						return callback({'err': err, 'fm': 'Failed to write preview'});
					}
					user.data.photo.push({_id: oID,
						type: 'photo',
						link: '/data/'+user._id+'/photo/'+oID,
						message: '',
						author: user._id
					});
					gm(file.path)
						.quality(100)
						.noProfile()
						.write('./public/data/'+user._id+'/photo/'+oID+'.jpg', function(err) {
							if (err) return callback({'err': err, 'fm': 'Failed to write fullsize'});
							fs.unlink(file.path, function(err) {
								if (err) return callback({'err': err, 'fm': 'Failed to unlnk temp'});
								callback(null, oID);
							});
						});
				});
			}, function(err, files) {
				if (err) return callback(err);
				user.save(function(err) {
					if (err) {
                        return callback({'err': err, 'fm': 'Failed to save user'});
                    }
					callback(null, user, files);
				});
			});		
		}
	], function(err, user, oids) {
		var count = 0;
		async.each(files, function(item, callback) {
			fs.exists(item.path, function(exist) {
				if (exist) {
					fs.unlink(item.path, function(err) {
						if (err) {
							log.error(err.message);
						}
					});
					++count;
				}
				callback();
			})
		}, function(){
			log.info("Removed " + count +  " temp files, after " + req.self.username + "'s photo upload");
		});
		if (err) {
			log.error(err.fm+'\n'+err.err);  //в этом логгере как раз читается свойство fm
			if (err.fm == "Not enough memory") {
				return next(new HttpError(403, err.message));
			} else {
				return next(new HttpError(500));
			}
		}
		var io = req.app.get('io');
		io.of('/main').to(user._id).emit('event', {
            event: "new photo",
            route: "user",
            data: oids
        });
		tool.dirSize("./public/data/"+user._id, function(err, size) {
			if (err) return log.error("Error of dirSize function after " + user.username + " photo upload");
			io.of("/main").to(user._id).emit("event", {
			event: "sizeResponse",
			route: "user",
			data: {total: req.serverInfo.userSpace, used:size}
			});
		});
		req.files = oids;
		next();
	});
};

exports.tool = function (req, res, next) {
	var ajax = false;
	if (req.xhr) {
        ajax = true;
    }

	tool.checkObjectID(req.params.id, function(err) {
		if (err) {
            return next(new HttpError(404, 'Wrong user ID'));
        }
		User.findById(req.params.id, function(err, user) {
			if (err) {
                return next(err);
            }
            res.render('user', {ajax:ajax, user:user});
		});
	});
};

exports.photoDescription = function (req, res, next) {
	tool.checkObjectID(req.params.id, function(err) {
		if (err) {
            return next(err);
        }
		if (!req.body.description) {
            req.body.description = null;
        }
		if (typeof req.body.description === "string") {
			req.body.description = req.body.description.replace(/(^\s+|\s+$)/g,'');
			req.body.description = req.body.description.replace(/\n/g, "<br/>");
		}
		var photo = req.self.data.photo.id(req.params.id);
		if (!photo) {
            return next(new HttpError(404, 'There is no such photo in that collection!'));
        }
		req.self.data.photo[req.self.data.photo.indexOf(photo)].message = req.body.description;
		req.self.save(function(err) {
			if (err) {
                return next(err);
            }
			res.send(req.body.description);
		});
	});
};

exports.prepareAva = function(req, res, next) {
	tool.checkObjectID(req.params.id, function(err) {
		if (err) {
			log.error('Wrong photo ID');
			return next(err);
		}
		var photo = req.self.data.photo.id(req.params.id);
		if (!photo) {
            return next(new HttpError(404, "There is no such photo"));
        }
		req.files = [];
		req.files[0] = photo.link;
		return next();
	});
};

exports.makeAvatar = function(req, res, next) {
    if (req.files[0].toString().indexOf('/data/') == -1) {
        req.files[0] = '/data/' + req.self._id + '/photo/' + req.files[0]
    }
	gm('./public'+req.files[0]+'.jpg')
		.resize(140, 280)
		.write('./public/data/'+req.self._id+'/avatar-sm.jpg', function(err) {
			if (err) {
                return next(err);
            }
			gm('./public'+req.files[0]+'.jpg').size(function(err, size) {
				if (err) {
                    return next(err);
                }
				var crops = {};
				if (size.width > size.height) {
					crops.lh = 50;
					crops.bh = 150;
				} else {
					crops.lw = 50;
					crops.bw = 150;
				}
				gm('./public'+req.files[0]+'.jpg')
					.resize(crops.lw, crops.lh)
					.crop(50, 50, 0, 0)
					.write('./public/data/'+req.self._id+'/avatar-xs.jpg', function(err){
						if (err) {
                            return next(err);
                        }
						gm('./public'+req.files[0]+'.jpg')
							.resize(crops.bw, crops.bh)
							.crop(150, 150, 0, 0)
							.write('./public/data/'+req.self._id+'/avatar-md.jpg', function(err){
							if (err) {
                                return next(err);
                            }
								var io = req.app.get('io');
								if (size.width < 500 && size.height < 500) {
									gm('./public'+req.files[0]+'.jpg')
									.write('./public/data/'+req.self._id+'/avatar.jpg', function(err) {
										if (err) {
                                            return next(err);
                                        }
										req.self.info.avatar = req.files[0].slice(req.files[0].lastIndexOf('/')+1);
										req.self.save(function(err) {
											if (err) {
                                                return next(err);
                                            }
                                            io.of('/main').to(req.self._id).emit('event', {
                                                route: "user",
                                                event: "new avatar",
                                                data: req.self.info.avatar
                                            });
											return next();
										});
									});
								} else {
									gm('./public'+req.files[0]+'.jpg')
									.resize(500, 500)
									.write('./public/data/'+req.self._id+'/avatar.jpg', function(err) {
										if (err) {
                                            return next(err);
                                        }
										req.self.info.avatar = req.files[0].slice(req.files[0].lastIndexOf('/')+1);
										req.self.save(function(err) {
											if (err) {
                                                return next(err);
                                            }
											io.of('/main').to(req.self._id).emit('event', {
                                                route: "user",
                                                event: "new avatar",
                                                data: req.self.info.avatar
                                            });
											return next();
										});
									});
								}
							});
					});
			});
		});
};

exports.saveFile = function(req, res, next) {
	var size = 0;
	var files = [];
	for (var key in req.files) {
		if (req.files.hasOwnProperty(key)) {
			files.push(req.files[key]);
			size += req.files[key].size;
		}
	}
	async.waterfall([
		function (callback) {
			async.map (files, function(file, callback) {
					size += file.size;
					callback(null, file);
			}, function(err, files) {
				if (err) return callback(err);
				tool.dirSize('./public/data/'+req.self._id, function(err, dSize) {
					if (err) return callback({'err': err, 'fm': 'Failed to read user directory stats'});
					if (req.serverInfo.userSpace - dSize > size) {
						callback(null, files);
					} else {
						log.info('Not enough memory for '+ req.self.username + ' to upload ' + size + ' bytes');
						callback({'err': new Error("Out of memory"), 'fm': 'Not enough memory'})
					}
				});
			});
		},
		function(files, callback) {
			var user = req.self;
			async.map(files, function (file, callback) {
				var oID = new ObjectID();
				fs.exists("./public/data/" + req.self._id + "/file/" + file.name, function (exists) {
					if (exists) {
						var fileName = file.name.split('.');
						if (fileName.length === 1) {
							file.name = file.name + '(' + new Date().toString() + ')';
						} else {
							file.name = fileName[fileName.length - 2] + '(' + new Date().toString() + ').' + fileName[fileName.length - 1];
						}
					}
					var nfile = {
						_id: oID,
						type: 'file',
						link: '/data/' + user._id + '/file/' + file.name,
						message: '',
						author: user._id,
						name: file.name,
						size: file.size,
						date: new Date()
					};
					user.data.file.push(nfile);
					fs.rename(file.path, "./public/data/" + req.self._id + "/file/" + file.name, function (err) {
						if (err) {
							return callback({'err': err, 'fm': 'Failed to replace file'});
						}
						callback(null, nfile);
					});
				});
			}, function(err, files) {
				if (err) {
					return callback(err);
				}
				user.save(function(err) {
					if (err) {
						return callback({'err': err, 'fm': 'Failed to save user'});
					}
					callback(null, user, files);
				});
			});
		}
	], function(err, user, savedFiles) {
		var count = 0;
		async.each(files, function(item, callback) {
			fs.exists(item.path, function(exist) {
				if (exist) {
					fs.unlink(item.path, function(err) {
						if (err) {
							log.error(err.message);
						}
					});
					++count;
				}
				callback();
			})
		}, function(){
			log.info("Removed " + count +  " temp files, after " + req.self.username + "'s file upload");
		});
		if (err) {
			log.error(err.fm+'\n'+err.err);  //в этом логгере как раз читается свойство fm
			if (err.fm == "Not enough memory") {
				return next(new HttpError(403, err.message));
			} else {
				return next(new HttpError(500));
			}
		}
		var io = req.app.get('io');
		io.of('/main').to(user._id).emit('event', {
			event: "new file",
			route: "user",
			data: savedFiles
		});
		tool.dirSize("./public/data/"+user._id, function(err, size) {
			if (err) return log.error("Error of dirSize function after " + user.username + " file upload");
			io.of("/main").to(user._id).emit("event", {
				event: "sizeResponse",
				route: "user",
				data: {total: req.serverInfo.userSpace, used:size}
			});
		});
		req.files = savedFiles;
		next();
	});
};
