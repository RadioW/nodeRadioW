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
	async.waterfall([
		function(callback) {
			tool.checkDir(req, 'photo', function (err) {
				if (err) {
                    return callback({'err': err, 'fm': 'Failed to check directory'});
                } //fm - это свойство ошибки, по которому я в конце понимаю, где процесс пошел неверно
				callback(null);
			});
		},
		function(callback) {
			var user = req.self;
			var files = [];
			for (var i in req.files) {
				files.push(req.files[i]);
			}
			async.map(files, function(file, callback) {
				var oID = new ObjectID();
				gm(file.path)
					.resize(130, 260)
					.noProfile()
					.write('./public/data/'+user._id+'/photo/'+oID+'prev.jpg', function(err) {
						if (err) {
                            return callback({'err': err, 'fm': 'Failed to write preview'});
                        }
						user.data.photo.push({_id: oID,
										type: 'photo',
										link: '/data/'+user._id+'/photo/'+oID,
										message: ''
										});
						gm(file.path)
							.quality(100)
							.noProfile()
							.write('./public/data/'+user._id+'/photo/'+oID+'.jpg', function(err) {
								if (err) {
                                    return callback({'err': err, 'fm': 'Failed to write fullsize'});
                                }
								fs.unlink(file.path, function(err) {
									if (err) {
                                        return callback({'err': err, 'fm': 'Failed to unlnk temp'});
                                    }
									callback(null, oID);
								});
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
	], function(err, user, files) {
		if (err) {
			log.error(err.fm+'\n'+err.err);  //в этом логгере как раз читается свойство fm
			return next(new HttpError(500));
		}
		var io = req.app.get('io');
		io.of('/main').to(user._id).emit('event', {
            event: "new photo",
            route: "user",
            data: files
        });
		req.files = files;
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

/*exports.photo = function (req, res, next) {
	var ajax = false;
	var objectToRender = {};
    var toRender;
	if (req.xhr) {
		ajax = true;
		toRender = 'photo';
	} else {
		objectToRender.special = true;
		toRender = 'user';
	}
	objectToRender.ajax = ajax;
	tool.checkObjectID(req.params.id, function(err) {
		if (err) {
            return next(new HttpError(404, 'Wrong user ID'));
        }
		tool.checkObjectID(req.params.pid, function(err) {
			if (err) {
                return next(new HttpError(404, 'Wrong photo ID'));
            }
			User.findById(req.params.id, function(err, user) {
				if (err) {
                    return next(err);
                }
				if (!user) {
                    return next(new HttpError(404, 'There is no user with same id in my base!'));
                }
				var index = user.data.photo.indexOf(user.data.photo.id(req.params.pid));
				if (index === -1) {
                    return next(new HttpError(404, 'There is no such photo in that collection!'));
                }
				User.populate(user.data.photo, {path: 'comments.author'}, function(err, photo) {  
					if (err) {
                        return next(err);
                    }                                           // Я буду гореть на священном костре
													            // инквизиции за это! Это пиздец какая дорогостоящая операция!
					objectToRender.photo = photo;				// Теоретически... мне даже представить себе сложно, как долго все это
					objectToRender.index = index;				// будет отрабатывать, ведь он заполняет каждый комменты к каждой фотке
					objectToRender.user = user;					// гигантскими объектами пользователя
																// просто для того, что бы динамически подтягивалось имя.
					objectToRender.User = User;
					res.render(toRender, objectToRender);
				});
			});
		});
	});
};*/

/*exports.photo = function (req, res, next) {
    var objectToRender = {};
    tool.checkObjectID(req.params.id, function(err) {
        if (err) {
            return next(new HttpError(404, 'Wrong user ID'));
        }
        tool.checkObjectID(req.params.pid, function(err) {
            if (err) {
                return next(new HttpError(404, 'Wrong photo ID'));
            }
            User.findById(req.params.id, function(err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return next(new HttpError(404, 'There is no user with such id in my base!'));
                }
                var photo = user.data.photo.id(req.params.pid);
                if (!photo)
                    return next(new HttpError(404, 'There is no such photo in that collection!'));
                objectToRender.photo = photo;
                objectToRender.user = user;
                objectToRender.type = 'photo';
                objectToRender.ajax = req.xhr;
                objectToRender.special = true;
                res.render('user', objectToRender);
            });
        });
    });
};*/

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
