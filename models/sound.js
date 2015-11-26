/**
 * Created by betrayer on 28.08.15.
 */
"use strict";
var mongoose = require('../libs/mongoose');
var Album = require('./album').Album;
var async = require('async');
var Schema = mongoose.Schema;
var log = require('../libs/logs')(module);

var schema = new Schema({
	name: {
        required: true,
        type: String
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist"
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: "Album"
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "Artist"
    }],
    genre: {
        type: String
    },
    path: {
        type: String,
        required: true
    },
    lyrics: {
        type: String
    },
    index: {
        type: Number
    },
    duration: {
        type: Number
    }
});

schema.statics.register = function(proto, callback) {
    var Sound = this;

    async.waterfall([
        function (callback) {
            Album
                .find({name: proto.album})
                .populate('artist')
                .exec(callback);
        }, function(albums, callback) {
            var toRemove = [];
            for (var i = 0; i < albums.length; ++i) {
                if (albums[i].artist.name !== proto.artist) {
                    toRemove.push(albums[i]);
                }
            }
            for (var j = 0; j < toRemove.length; ++j) {
                albums.splice(albums.indexOf(toRemove[j]));
            }
            callback(null, albums);
        }, function(albums, callback) {
            if (albums.length == 0) {
                Album.register({name: proto.album, artist: proto.artist}, function(err, album) {
                    if (err) return callback(err);
                    callback(null, [album]);
                });
            } else {
                callback(null, albums);
            }
        },function(albums, callback) {
            var album = albums[0];
            var sound = new Sound(proto);
                sound.album = album;
                sound.artist = album.artist;
            async.map(albums, function(album, callback) {
                album.addSong(sound);
                album.save(callback);
            }, function(err, albums) {
                if (err) return callback(err);
                for (var i = 0; i < albums.length; ++i) {
                    log.info("Song " + sound.name + " registered at album " + albums[i].name + " (" + albums[i]._id + ")");
                }
                sound.save(callback);
            });
        }
    ], callback);
};

schema.methods.addTo = function(album) {
    this.album = album;
    album.addSong(this)
};

exports.Sound = mongoose.model('Sound', schema);