/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');

var Chat = Route_io.inherit({
    "className": "ChatRoute_io",
    "constructor": function (io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "chat"
        });

        that.on('connection', function(socket, data) {
            var handshake = socket.request;
            var username  = handshake.user.get('username');
            if (that.countWindows(handshake.session.id) == 1) {
                that.cast('join', username);
            }
        });

        that.on('disconnect', function(socket, data) {
            var handshake = socket.request;
            var username  = handshake.user.get('username');
            if (!handshake.session || (that.countWindows(handshake.session.id) == 0)) {
                that.cast('left', username);
            }
        });

        that.on('message', function(socket, data) {
            var handshake = socket.request;
            var username  = handshake.user.get('username');
            that.cast('message', {
                message: data,
                user: username
            });
        });
    }
});


module.exports = Chat;
