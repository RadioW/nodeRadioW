var mongoose = require('./libs/mongoose');
var async = require('async');

async.series ([
	open,
	dropDatabase,
	requireModels,
	createUsers,
	firstBlog
], 
	function (err, results) {
		console.log(arguments);
		mongoose.disconnect();
		process.exit(err ? 255 : 0);
	}
);

function open (callback) {
	mongoose.connection.on('open', callback);
}
 function dropDatabase (callback) {
	var db = mongoose.connection.db;
	db.dropDatabase(callback);
 }
 
function createUsers (callback) {
	var users = [
		{username: 'Arch', password: 'ExilE2001'}
	];
	async.each (users, function (userData, callback) {
		mongoose.models.User.registrate(userData.username, userData.password, callback);
	}, callback);
}

function requireModels (callback) {
	require('./models/user');
	
	async.each(Object.keys(mongoose.models), function (modelName, callback){
		mongoose.models[modelName].ensureIndexes(callback);
	}, callback)
}

function firstBlog (callback) {
	mongoose.models.User.findOne({username: "Arch"}, function(err, user) {
		user.newBlog("Привет мир! Эта база данных создана " + user.datify(new Date()) + "", callback);
	});
}
