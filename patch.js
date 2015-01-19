/**
 * Created by betrayer on 19.01.15.
 */
"use strict";
var mongoose = require('./libs/mongoose');
var async = require('async');

async.series([open, requireModels, patch], function (err, results) {
    console.log(arguments);
    mongoose.disconnect();
    process.exit(err ? 255 : 0);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}
function requireModels (callback) {
    require('./models/user');

    async.each(Object.keys(mongoose.models), function (modelName, callback){
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback)
}

function patch(callback) {
    mongoose.models.User.find({}, function (err, users) {
        if (err) return callback(err);
        async.each (users, function (user, callback) {
            user.widgetSettings.push({
               title: "files"
            });
           user.save(callback);
        }, callback);
    });
}