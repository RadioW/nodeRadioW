/**
 * Created by betrayer on 19.12.14.
 */
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var message = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: String
});

var schema = new Schema({
    name: String,
    messages: [message],
    lastModified: Date,
    creation: {
        type: Date,
        default: Date.now
    }
});

exports.Chat = mongoose.model('Chat', schema);