/**
 * Created by betrayer on 28.08.15.
 */
"use strict";
var mongoose = require('../libs/mongoose');
var Artist = require('./artist').Artist;
var log = require('../libs/logs')(module);
var async = require('async');
var Schema = mongoose.Schema;

var schema = new Schema({
	name: {
        required: true,
        type: String
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist"
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: "Sound"
    }],
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "Artist"
    }],
    description: {
        type: String
    },
    label: {
        type: String
    },
    release: {
        type: Date
    }
});

schema.statics.register = function(proto, callback) {
    var Album = this;

    async.waterfall([
        function(callback) {
            Artist.find({name: proto.artist}, callback);
        },
        function (artists, callback) {
            if (artists.length == 0) {
                Artist.register({name: proto.artist}, function(err, artist) {
                    if (err) return callback(err);
                    callback(null, [artist]);
                });
            } else {
                callback(null, artists);
            }
        },
        function(artists, callback) {
            var artist = artists[0];
            var album = new Album(proto);
                album.artist = artist;
            async.map(artists, function(artist, callback) {
                artist.addAlbum(album);
                artist.save(callback);
            }, function(err, artists) {
                if (err) return callback(err);
                for (var i = 0; i < artists.length; ++i) {
                    log.info("Album " + album.name + " registered at album " + artists[i].name + " (" + artists[i]._id + ")");
                }
                album.save(callback);
            });
        }
    ], callback);
};

schema.methods.addSong = function(song) {
    this.songs.push(song);
};

schema.methods.addTo = function(artist) {
    this.artist = artist;
    artist.addAlbum(this);
};

exports.Album = mongoose.model('Album', schema);