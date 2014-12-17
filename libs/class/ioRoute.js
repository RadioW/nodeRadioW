/**
 * Created by betrayer on 07.10.14.
 */
"use strict";
var Class = require('../class');
var log = require('../logs')(module);

var Route_io = Class.inherit({
    "className": "Route_io",
    "constructor": function(param) {
        var that = this;

        Class.call(that);
        that.route = param.route;
        that.reactions = {};
        that.connections = [];
        that.io = param.io;
        that.on("connection", function(socket, data) {
            that.connections.push(socket);
            log.info('connected ' + socket.request.user.username + ' to ' + that.route);
            log.info('now ' + that.connections.length+ ' in ' + that.route);
            that.emit('connection', socket);
        });
        that.on("disconnect", function(socket, data) {

            that.connections.splice(that.connections.indexOf(socket), 1);
            log.info('disconnected ' + socket.request.user.username+ ' from ' + that.route);
            log.info('now ' + that.connections.length + ' in ' + that.route);
        })

    },
    "react": function(event, socket){
        var that = this;

        if (that.reactions[event.event]) {
            var listeners = that.reactions[event.event];
            for (var i = 0; i<listeners.length; i++) {
                listeners[i](socket, event.data);
            }
        } else {
            log.error('No listener for event ' + event.event + ' on route ' + that.route);
        }
    },
    "on": function(event, handler) {
        var that = this;

        var handlers = that.reactions[event];
        if (!handlers) {
            handlers = [];
            that.reactions[event] = handlers;
        }
        handlers.push(handler);
    },
    "emit": function(event, socket, data) {
        socket.emit("event", {
            route: this.route,
            event: event,
            data: data
        });
    },
    "cast": function(event, data) {
        var that = this;

        for (var i = 0; i<that.connections.length; i++) {
            that.emit(event, that.connections[i], data);
            log.info('say to ' + that.connections[i].request.user.username);
        }
    },
    "countWindows": function (sid) {
        var that = this;
        var clients = that.connections;
        var count = 0;
        for (var i=0; i<clients.length; i++) {
            if (clients[i].request.session.id == sid)
                count++;
        }
        return count;
    },
    "to": function(room, event, data) {
        var that = this;
        that.io.of('/main').to(room).emit('event', {
            route: that.route,
            event: event,
            data: data
        });
    },
    "tell": function(uid, event, data) {
        var that = this;
        var clients = that.connections;
        for (var i=0; i<clients.length; i++) {
            if (clients[i].request.session.user == uid)
                that.emit(event, clients[i], data);
        }
    }
});

module.exports = Route_io;