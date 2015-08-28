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
    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist"
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: "Album"
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
    length: {
        type: Number
    }
});

exports.Sound = mongoose.model('Sound', schema);