/**
 * Created by betrayer on 28.08.15.
 */
var mongoose = require('../libs/mongoose'),
  Schema = mongoose.Schema;

var schema = new Schema({
	name: {
        required: true,
        type: String
    },
    artists: [{
        type: Schema.Types.ObjectId,
        ref: "Artist"
    }],
    songs: [{
        type: Schema.Types.ObjectId,
        ref: "Song"
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

exports.Album = mongoose.model('Album', schema);