/**
 * Created by betrayer on 28.08.15.
 */
"use strict";
var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	name: {
        required: true,
        type: String
    },
    albums: [{
        type: Schema.Types.ObjectId,
        ref: "Album"
    }],
    description: {
        type: String
    },
    members: [String],
    origin: {
        type: String
    },
    country: {
        type: String
    },
    foundation: {
        type: Date
    },
    decay: {
        type: Date
    }
});

schema.statics.register = function(proto, callback) {
    var Artist = this;

    var artist = new Artist(proto);
    artist.save(callback);
};

schema.methods.addAlbum = function(album) {
    this.albums.push(album);
};

exports.Artist = mongoose.model('Artist', schema);