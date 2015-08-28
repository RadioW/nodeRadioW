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

exports.Artist = mongoose.model('Artist', schema);