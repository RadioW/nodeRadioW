"use strict";
var mongoose = require('./libs/mongoose');
var async = require('async');

async.series ([
	open,
	dropCollections,
	requireModels,
	registerSongs
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

function dropCollections(callback) {
	var db = mongoose.connection.db;
	var cols = ["artists", "albums", "sounds"];

	async.each(cols, function(collection, callback) {
		db.dropCollection(collection, function(err) {
			if (err && err.message !== "ns not found") callback(err);
			callback(null);
		});
	},
	callback);
}

function registerSongs (callback) {
	var songs = [
		{
			name: "Hello",
			album: "Node",
			artist: "javaScript",
			path: "here/is/the/path"
		}
	];

	async.map (songs, function (song, callback) {
		mongoose.models.Sound.register(song, callback);
	}, function (err, songs) {
		console.log(songs);
	});
}

function requireModels (callback) {
	require('./models/sound');
	
	async.each(Object.keys(mongoose.models), function (modelName, callback){
		mongoose.models[modelName].ensureIndexes(callback);
	}, callback)
}
