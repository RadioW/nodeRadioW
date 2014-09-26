var async = require('async');

var mongoose = require('../libs/mongoose'),
  Schema = mongoose.Schema;
  
var schema = new Schema({
	guestID: Number,
	sessionID: String
});

schema.statics.create = function (sid, callback) {
	var Guest = this;
	
	async.waterfall ([
		function (callback) {
			Guest.find({}, callback);
		}, function (guests, callback) {
			var buzy = [];
			guests.forEach(function (guest) {
			buzy.push (guest.guestID);
			});
			var i = 1;
			while (buzy.some(function (x) {return x == i} )) {
				i++;
			}
			callback(null, i);
		}, function (i, callback) {
			var guest = new Guest({guestID:i, sessionID:sid});
			guest.save(function (err) {
				if (err) return callback(err);
				callback (null, guest);
			});
		}
	], callback);
}

schema.statics.authorize = function (gid, callback) {
	var Guest = this;
	Guest.findOneAndRemove({guestID:gid}, callback);}

exports.Guest = mongoose.model('Guest', schema);