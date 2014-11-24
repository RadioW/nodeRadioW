var mongoose = require('./libs/mongoose');
var async = require('async');

async.series ([
	open,
	dropDatabase,
	requireModels,
	createUsers
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
		{username: 'Admin', password: '123'}
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
