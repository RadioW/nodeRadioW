"use strict";
var crypto = require('crypto');
var async = require('async');
var HttpError = require('../error').HttpError;
var util = require ('util');
var fs = require('fs');

var mongoose = require('../libs/mongoose'),
  Schema = mongoose.Schema;

var widgetSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    options: {
        size: {
            width: Number,
            height: Number
        },
        position: {
            x: Number,
            y: Number
        },
        public: {
            type: Boolean,
            default: true
        }
    }
});

var userData = new Schema ({
	date: {
		type: Date,
		default: Date.now
	},
	name: String,
	size: Number,
	link: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	message: String,
	comments: [],
	meta: [{
        status: String,
        date: Date
    }]
});

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  info: {
	name: {
		first: String,
		last: String,
		middle: String
	},
	gender: String,
	birth: {
		town: String,
		country: String,
		date: Date
	},
	karma: Number,
	contacts: {
		phone: String,
		email: String,
		site: String,
		VK: String,
		FB: String,
		Twitter: String,
		Skype: String
	},
	online: Boolean,
	avatar: {
			type: String,
			default: '/images/i'
	}
  },
  data: {
	blog:[userData],
	photo:[userData],
	file:[userData],
	comments:[userData],
    dialogues: {}
  },
  widgetSettings: [widgetSchema]
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.methods.getISODate = function(date) {
	var date = date || this.info.birth.date;
	if (!date) return;
	return date.getFullYear()+'-'+(date.getMonth()+1 > 9 ? date.getMonth()+1 : '0' + (date.getMonth() + 1))+'-'+(date.getDate() > 9 ? date.getDate() : '0'+date.getDate());
};

schema.methods.datify = function(timestamp, options) {
	var t = true;
	var y = true;
	if (options) {
		if (options.time === false) t = false;
		if (options.year === false) y = false;
	}
	var date = new Date(timestamp);
	var year = date.getFullYear();
	var month = date.getMonth();
	switch (month) {
		case 0:
			month = "января";
			break;
		case 1:
			month = "февраля";
			break;
		case 2:
			month = "марта";
			break;
		case 3:
			month = "апреля";
			break;
		case 4:
			month = "мая";
			break;
		case 5:
			month = "июня";
			break;
		case 6:
			month = "июля";
			break;
		case 7:
			month = "августа";
			break;
		case 8:
			month = "сентября";
			break;
		case 9:
			month = "октября";
			break;
		case 10:
			month = "ноября";
			break;
		case 11:
			month = "декабря";
			break;
	}
	var day = date.getDate();
	var minute = date.getMinutes() > 9 ? date.getMinutes() : '0'+date.getMinutes();
	var hour = date.getHours() > 9 ? date.getHours() : '0'+date.getHours();
	var summary = day+" "+month;
	if (y) summary = summary+" "+year;
	if (t) summary = summary+" в "+hour+":"+minute;
	return summary;
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
		return this.encryptPassword(password) === this.hashedPassword;
	};
	
schema.methods.changeInfo = function(info, callback) {
		var user = this;
		
		user.info.username = info['username'];
		user.info.name.first = info['info.name.first'];
		user.info.name.last = info['info.name.last'];
		user.info.name.middle = info['info.name.middle'];
		user.info.birth.town = info['info.birth.town'];
		user.info.birth.date = info['info.birth.date'];
		user.info.birth.country = info['info.birth.country'];
		user.info.contacts.phone = info['info.contacts.phone'];
		user.info.contacts.email = info['info.contacts.email'];
		user.info.contacts.site = info['info.contacts.site'];
		user.info.contacts.VK = info['info.contacts.VK'];
		user.info.contacts.FB = info['info.contacts.FB'];
		user.info.contacts.Twitter = info['info.contacts.Twitter'];
		user.info.contacts.Skype = info['info.contacts.Skype'];
		
		user.save(function(err) {
			if (err) return callback(err);
			return callback(null, user);
		})
	};

schema.methods.newBlog = function(message,callback) {
	this.data.blog.push({
		link: 'none',
		message: message,
		author: this._id,
		meta: [
			{
				status: "normal",
				date: Date.now()
			}
		]
	});
	this.save(callback);
};

schema.statics.registrate = function (username, password, callback) {
	var User = this;
	
	async.waterfall ([
		function(callback) {
			User.findOne({username: username}, callback)
		},
		function (user, callback) {
			if (!user) {
				user = new User({username: username, password: password});
				user.info.online = true;
                user.data.dialogues = {test: "test"};

                user.widgetSettings.push({
                    title: "info"
                });
                user.widgetSettings.push({
                    title: "blog"
                });
                user.widgetSettings.push({
                    title: "photo"
                });
                user.widgetSettings.push({
                    title: "messages"
                });
				user.widgetSettings.push({
					title: "file"
				});

				fs.mkdir('./public/data/'+user._id, function(err) {
					if (err) return callback(err);
					async.each(["photo", "file"], function(name, callback) { //initializing directories
						fs.mkdir('./public/data/'+user._id+'/' + name, function(err) {
							callback(err, user);
						});
					}, function(err) {
						if (err) return callback(err);
						user.save(function(err) {
							callback (err, user);
						});
					});
				})
			} else {
				callback (new RegError('Пользователь с таким именем уже существует'))
			}
		}
	], callback);
};

schema.statics.authorize = function (username, password, callback) {
	var User = this;
	
	async.waterfall ([
		function (callback) {
			User.findOne({username: username}, callback);
		},
		function (user, callback) {
			if (user) {
				if (user.checkPassword(password)) {
					user.info.online = true;
					user.save(function (err) {
						if (err) return callback(err);
						
						callback (null, user);
					});
				} else {
					callback(new AuthError("Пароль неверен"));
				}
			} else {
				callback(new AuthError("Пользователь с таким именем не зарегистрирован"));
			}
		}
	], callback);
};

schema.statics.logout = function (id, callback) {
	var User = this;
	
	async.waterfall([
		function (callback) {
			User.findById(id, callback)
		}, function (user, callback) {
			if (user) {
				user.info.online = false;
				user.save (function (err) {
					if (err) return callback(err);
					callback (null, user);
				});
			} else {
				callback(new AuthError("Такого пользователя не существует"));
			}
		}
	], callback);
};
var User = mongoose.model('User', schema);

exports.User = User;

function AuthError (message) {
	Error.apply (this, arguments);
	Error.captureStackTrace(this, AuthError);
	
	this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = "AuthError";

exports.AuthError = AuthError;

function RegError (message) {
	Error.apply (this, arguments);
	Error.captureStackTrace(this, RegError);
	
	this.message = message;
}

util.inherits(RegError, Error);

RegError.prototype.name = "RegError";

exports.RegError = RegError;