/**
 * Created by betrayer on 31.08.15.
 */
"use strict";
(function musicjs() {
    var moduleName = m.page.$music;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);
    defineArray.push(m.ui.$list);

    define(moduleName, defineArray, function music_module() {
        var Page = require(m.$page);
        var List = require(m.ui.$list);

        var Music = Page.inherit({
            "className": "Music",
            "websocket": true,
            "constructor": function(options) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: options.html,
                    route: "music"
                });
                that.options = options;

                that.selectedArtist = that.options.artist;
                that.selectedAlbum = that.options.album
            },
            "destructor": function() {

                this.artists.destructor();
                this.albums.destructor();
                this.songs.destructor();

                this._container.remove();

                Page.fn.destructor.call(this);
            },
            "run": function() {
                var that = this;

                that._initContainer();
                that._initLists();

                that.on('error', function(err) {
                    launchModal('Извините, произошла ошибка!</br>'+err);
                });

                that.on("artistList", function(data) {
                    that.albums.clear();
                    that.songs.clear();
                    that.artists.data(data);
                    that.selectedArtist = undefined;
                    that.selectedAlbum = undefined;
                });
                that.on("artistAlbums", function(data) {
                    that.songs.clear();
                    that.albums.data(data);
                    that.selectedAlbum = undefined;
                });
                that.on("albumSongs", function(data) {
                    that.songs.data(data)
                });

                that.emit("requestArtistList");

                Page.fn.run.call(that);
            },
            "_initLists": function() {
                var that = this;

                var artists = that.artists = new List({
                    sort: Music.compare,
                    idField: "_id",
                    buttons: [
                        {
                            "name": "expand",
                            "icon": "chevron-right"
                        }
                    ]
                });
                artists.on("expand", this.selectArtist, this);

                var albums = this.albums = new List({
                    sort: Music.compare,
                    idField: "_id",
                    buttons: [
                        {
                            "name": "expand",
                            "icon": "chevron-right"
                        }
                    ]
                });

                albums.on("expand", this.selectAlbum, this);

                var songs = this.songs = new List({
                    sort: Music.compare,
                    idField: "_id"
                });

                that._container.append(artists.wrapper);
                that._container.append(albums.wrapper);
                that._container.append(songs.wrapper);

                that._uncyclic.push(function() {
                    that = null;
                });
            },
            "_initContainer": function() {
                var that = this;

                var cover = $("#cover");
                var footer = $("footer");

                that._container = $("<div>");
                that._container.css({
                    width: "100%",
                    height: cover.height() - that.wrapper.offset().top - footer.height()
                });

                that.wrapper.append(that._container);
            },
            "selectArtist": function (item) {
                if (this.selectedArtist !== item._id) {
                    this.selectedArtist = item._id;
                    this.emit("requestArtistAlbums", item._id);
                }
            },
            "selectAlbum": function (item) {
                if (this.selectedAlbum !== item._id) {
                    this.selectedAlbum = item._id;
                    this.emit("requestAlbumSongs", item._id);
                }
            }
        });

        $.extend(Music, {
            "title": "music",
            "compare": function(a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            }
        });

        requirejs._moduleExecute(moduleName);
        return Music;
    });
})();