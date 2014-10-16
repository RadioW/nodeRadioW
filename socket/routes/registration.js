/**
 * Created by betrayer on 08.10.14.
 */
"use strict";

var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var User = require('../../models/user').User;

var Registration = Route_io.inherit({
    "className": "RegistrationRoute_io",
    "constructor": function(io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "registration"
        });

        that.on('check', function(socket, data) {
            User.findOne({'username': data}, function (err, user) {
                if (err) return that.emit('error', socket, err.message);
                if (user) return that.emit('buzy', socket);
                if (!user) return that.emit('free', socket);
            });
        });
    }
});

module.exports = Registration;