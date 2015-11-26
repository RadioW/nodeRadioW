/**
 * Created by betrayer on 07.09.15.
 */
"use strict";
var fs = require("fs");
var async = require("async");
var mm = require("musicmetadata");
var mongoose = require('./libs/mongoose');
var Progress = require('./progress');

var path = process.argv[2];

var progress = new Progress(process.stdout);

async.waterfall([
    open,
    dropCollections,
    requireModels,
    entrie,
    parseDirectory,
    splitArray,
    parseEachDirectory,
    countAndNotify,
    does
], function(err) {
    progress.stop();
    if (err) {
        progress.say(err);
        process.exit(1);
    } else {
        process.exit(0);
    }

});

function entrie (callback) {
    if (path) {
        if (path.slice(-1) === "/") {
            path = path.slice(0, -1);
        }
        progress.say("Looking for music in "+path +"...");
        callback(null, path)
    } else {
        callback(new Error("Wrong path"));
    }
}

function parseDirectory(path, callback) {
    fs.readdir(path, function(err, files) {
        if (err) return callback(err);
        async.map(files, function (file, callBack) {
            var aPath = path + "/" + file;
            fs.stat(aPath, function (err, stat) {
                if (err) return callBack(err);
                callBack(null, {name: file, stat: stat, path: aPath});
            });
        }, function (err, arr) {
            if (err) return callback(err);
            callback(null, arr);
        });
    });
}

function splitArray(arr, callback) {
    var notFolders = [];
    var error = false;
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].stat) {
            if (!arr[i].stat.isDirectory()) {
                notFolders.push(arr.splice(i, 1)[0]);
                --i;
            }
        } else {
            error = true;
            break;
        }
    }
    if (error) {
        return callback(new Error("No stat in element " + arr[i]));
    }
    callback(null, arr, notFolders);
}

function parseEachDirectory(arr, notFolders, callback) {
    async.map(arr, function(folder, callback) {
        async.waterfall([
            function (callback) {
                if (!folder.path) return callback(new Error("Each directory: wrong path"));
                callback(null, folder.path);
            },
            parseDirectory,
            splitArray
            ],
            function(err, folders, nonFolders) {
                if (err) return callback(err);
                if (folders.length) {
                    parseEachDirectory(folders, nonFolders, function (err, folders, nonFolders) {
                        if (err) return callback(err);
                        folder.folders = folders;
                        folder.nonFolders = nonFolders;
                        callback(null, folder);
                    });
                    return;
                }
                folder.folders = folders;
                folder.nonFolders = nonFolders;
                callback(null, folder);
            }
        );
    },
    function (err, folders) {
        callback(err, folders, notFolders);
    });
}

function countAndNotify (files, nonFolders,  callback) {
    var albumsC = 0;
    var songsC = 0;
    for (var i = 0; i < files.length; ++i) {
        if (files[i].folders) {
            albumsC += files[i].folders.length;
            for (var j = 0; j < files[i].folders.length; ++j) {
                var album = files[i].folders[j];
                if (album.nonFolders) {
                    songsC += album.nonFolders.length;
                }
            }
        }
    }

    progress.say("Search finished. Approximate results:");
    progress.say("Artists: " + files.length);
    progress.say("Albums: " + albumsC);
    progress.say("Songs: " + songsC);

    progress.setTotal(songsC);
    progress.start();

    callback(null, files);
}

function does(files, callback) {
    async.mapLimit(
        files,
        1,
        function(artist, callback) {
            async.mapLimit(
                artist.folders,
                2,
                function(album, callback) {
                    var songs = [];
                    for (var i = 0; i < album.nonFolders.length; ++i) {
                        if (album.nonFolders[i].name.slice(-4) === ".mp3") {
                            songs.push(album.nonFolders[i]);
                        } else {
                            progress.decTotal();
                        }
                    }
                    async.mapLimit(
                        songs,
                        10,
                        function(song, callback) {
                            var stream = fs.createReadStream(song.path);
                            mm(stream, {duration: true}, function (err, tags) {
                                stream.close();
                                if (err) {
                                    if (tags) {
                                        progress.warn(artist.name + "/" + album.name + "/" + tags.title + "("+song.name+")" + ". error: " + err.message);
                                    } else {
                                        return callback(err);
                                    }
                                }
                                song.duration = tags.duration;
                                song.genre = tags.genre && tags.genre.length && tags.genre[0];
                                song.index = tags.track.no;
                                song.name = tags.title || song.name.slice(0, -4);
                                if (!album.release && tags.year.length === 4) {
                                    album.release = new Date(tags.year);
                                }
                                var model = new mongoose.models.Sound(song);
                                model.save(function(err, song) {
                                    progress.step();
                                    callback(err, song);
                                });
                            })
                        },
                        function(err, songs) {
                            if (err) return callback(err);

                            delete album.folders;
                            delete album.nonFolders;
                            delete album.stat;

                            var model = new mongoose.models.Album(album);
                            for (var i = 0; i < songs.length; ++i) {
                                songs[i].addTo(model);
                            }
                            model.save(callback);
                        }
                    );
                },
                function (err, albums) {
                    if (err) return callback(err);

                    delete artist.folders;
                    delete artist.nonFolders;
                    delete artist.stat;

                    var model = new mongoose.models.Artist(artist);
                    for (var i = 0; i < albums.length; ++i) {
                        albums[i].addTo(model);
                    }
                    model.save(callback);
                }
            )
        },
        callback
    );
}

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

function requireModels (callback) {
    require('./models/sound');

    async.each(Object.keys(mongoose.models), function (modelName, callback){
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback)
}

