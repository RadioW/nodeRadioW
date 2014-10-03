/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
(function connectionjs() {
    var moduleName = m.$connection;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.framawork.$socketio);
    defineArray.push(m.$class);

    define(moduleName, defineArray, function connection_module(){
        var io = require(m.framawork.$socketio);
        var Class = require(m.$class);

        var Connection = Class.inherit({
            "className": "Connection",
            "constructor": function(params) {
                var that = this;

                Class.call(that);

                var baseOptions = {
                    "namespace": "/main",
                    "transport": ["websocket, polling"],
                    "reconnection": true,
                    "reconnectionDelay": 2000,
                    "reconnectionDelayMax": 10000,
                    "multiplex": false
                };
                $.extend(baseOptions, params);
                that.socket = io(location.host+baseOptions.namespace, baseOptions);

                that.initMainListeners();
                that.startListen();
            },

            "listen": function(listen){
                var that = this;
                if (!listen)
                    throw new Error("Can't listen for nothing!");
                if (!listen.handler)
                    throw new Error("No handler for listening!");
                if (!listen.event)
                    throw new Error("No event for listening!");
                if (!listen.route)
                    throw new Error("No route for listening!");

                var route = that.routes[listen.route];
                if (!route) {
                    route = {};
                    that.routes[listen.route] = route;
                }
                var event = route[listen.event];
                if (!event) {
                    event = [];
                    route[listen.event] = event;
                }
                event.push(listen.handler);
            },
            "forget": function(listen) {
                var that = this;
                if (listen.route && listen.event && listen.handler) {
                    var event = that.routes[listen.route][listen.event];
                    event.splice(event.indexOf(listen.handler), 1);
                } else if (listen.route && listen.event) {
                    delete that.routes[listen.route][listen.event];
                } else if (listen.route ||  typeof listen == "string") {
                    that.socket.emit('event', {
                        route: listen.route,
                        event: "disconnect",
                        data: listen.data
                    });
                } else {
                    console.error("Can't forget \n"+ JSON.stringify(listen));
                }
            },
            "initMainListeners": function() {
                var that = this;

                that.routes = {};
                var info = $('#infoBar');
                var spans = $('span', info.get(0));

                that.listen({
                    route: "main",
                    event: "info",
                    handler: function(data) {
                        info.css('display', 'block');
                        spans.get(0).innerHTML = data.users.length;
                        spans.get(1).innerHTML = data.guests.length;
                    }
                });
                that.listen({
                    route: "main",
                    event: "connected",
                    handler: function(data) {
                        core.user = {
                            "id": data.id
                        }
                    }
                });
                that.listen({
                    route: "main",
                    event: "login",
                    handler: function() {
                        if (window.location.href == "http://"+location.host+"/login") {
                            window.location.href = "/";
                        } else {
                            window.location.reload();
                        }
                    }
                });
                that.listen({
                    route: "main",
                    event: "logout",
                    handler: function() {
                        location.href = "/";
                    }
                });
            },
            "startListen": function() {
                var that = this;
                that.socket.on('event', function(params) {
                    var route = params.route;
                    var event = params.event;

                    if (that.routes[route] && that.routes[route][event]) {
                        var handlers = that.routes[route][event];
                        for (var i = 0; i < handlers.length; i++) {
                            handlers[i](params.data);
                        }
                    } else {
                        console.error("Undefined event:\nroute = " + route.toString() + ";\nevent = "+event.toString());
                    }
                });
            }
        });

        requirejs._moduleExecute(moduleName);
        return Connection;
    });
})();