var User = require ('./user').User;
var mongoose = require('../libs/mongoose'),
  Schema = mongoose.Schema;
  
var schema = new Schema({
	rate: {
		type: Number,
		default: 1
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	}
});

exports.Admin = mongoose.model('Admin', schema);