var mongoose = require('mongoose');
var config = require('../config');
var bson = require('bson');

mongoose.connect(config.get('mongoose:uri'));

module.exports = mongoose;
