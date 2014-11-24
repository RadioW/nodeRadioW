/**
 * Created by betrayer on 21.11.14.
 */
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    messages: [{
        date: {
            type: Date,
            default: Date.now
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        message: String,
        meta: [{
            status: String,
            date: Date
        }]
    }],
    users: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
});

exports.Dialogue = mongoose.model('Dialogue', schema);