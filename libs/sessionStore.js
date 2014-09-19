var mongoose = require('./mongoose');
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var bson = require('bson');

var sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;