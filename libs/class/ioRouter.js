/**
 * Created by betrayer on 08.10.14.
 */
"use strict";

var Class = require('../class');
var log = require('../logs')(module);
var Chat = require('../../socket/routes/chat');
var Registration = require('../../socket/routes/registration');
var User = require('../../socket/routes/user');

var Router_io = Class.inherit({
    "className": "Router_io",
    "constructor": function(io) {
        var that = this;

        Class.call(that);
        that.io = io;

        that.initRoutes();
    },
    "initRoutes": function() {
        var that = this;

        that.routes = {
            chat: new Chat(that.io),
            registration: new Registration(that.io),
            user: new User(that.io)
        }
    },
    "route": function(params, socket) {
        var that = this;
        if (!params.route) {
            log.error("Undefined route!");
            return;
        }
        if (!params.event) {
            log.error('Undefined event on route '+ params.route);
            return;
        }
        if (that.routes[params.route]) {
            that.routes[params.route].react(params, socket);
        } else {
            log.error('No path for route ' + params.route);
        }
    },
    "disconnect": function(socket) {
        var that = this;
        for (var key in that.routes) {
            if (that.routes.hasOwnProperty(key)) {
                that.route({
                    route: key,
                    event: "disconnect",
                    data: {}
                }, socket);
            }
        }
    }
});

module.exports = Router_io;