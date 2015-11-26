/**
 * Created by betrayer on 31.08.15.
 */
"use strict";
var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var Artist = require('../../models/artist').Artist;
var Album = require('../../models/album').Album;
var Sound = require('../../models/sound').Sound;

var Music = Route_io.inherit({
    "className": "MusicRoute_io",
    "constructor": function(io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "music"
        });

        that.on('requestArtistList', function(socket) {
            Artist.find({}, function(err, list) {
                if (err) return that.emit("error", socket, err.message);
                that.emit('artistList', socket, list);
            });
        });

        that.on('requestArtistAlbums', function(socket, id) {
            Artist
                .findById(id)
                .populate("albums")
                .exec(function(err, artist) {
                    if (err) return that.emit("error", socket, err.message);
                    if (!artist) return that.emit("error", socket, "There's no suck artist");
                    that.emit('artistAlbums', socket, artist.albums);
                });
        });
        that.on('requestAlbumSongs', function(socket, id) {
            Album
                .findById(id)
                .populate("songs")
                .exec(function(err, album) {
                    if (err) return that.emit("error", socket, err.message);
                    if (!album) return that.emit("error", socket, "There's no suck album");
                    that.emit('albumSongs', socket, album.songs);
                });
        });
    }
});

module.exports = Music;