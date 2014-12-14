/**
 * Created by betrayer on 05.10.14.
 */
"use strict";
(function pagejs(){
    var moduleName = m.$page;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function page_module(){
        var Class = require(m.$class);

        var Page = Class.inherit({
            "className": "Page",
            "title": "page",
            "name": "Radio W",
            "websocket": false,
            "constructor": function(param) {
                var that = this;

                Class.call(that);
                if (param && param.route) {
                    that.title = param.route;
                }
                var pb = that.wrapper = $('#pseudoBody');
                if (param && param.html) {
                    pb.html(param.html);
                    core.explorer.clickers($('a', pb.get(0)));
                }
                that.run();
                if (that.websocket) {
                    that.websocketConnect();
                }
                setTimeout(function() {
                    pb.css("opacity", 1);
                }, 1);
            },
            "destructor": function() {
                var that = this;
                if (that.websocket) {
                    core.connection.forget(that.title);
                }
                delete core.activePage;
                that.wrapper.css("opacity", 0);
                Class.fn.destructor.call(that);

            },
            "run": function() {
                //here you can paste your code
                $('title').html(this.name);
                console.log("page "+ this.title + ": code finished!");
            },
            "websocketConnect": function() {
                var that = this;

                that.on('error', function(data) {
                    console.error("Error on " + that.title + " page by websocket:\n"+data);
                });
                that.on('connection', function(data) {
                    console.log('Websocket connected to ' + that.title + ' page');
                });
                that.emit('connection');
            },
            "on": function(event, handler) {
                core.connection.listen({
                    route: this.title,
                    event: event,
                    handler: handler
                });
                return this;
            },
            "off": function(event, handler) {
                core.connection.forget({
                    route: this.title,
                    event: event,
                    handler: handler
                });
                return this;
            },
            "emit": function(event, data) {
                core.connection.socket.emit('event', {
                    route: this.title,
                    event: event,
                    data: data || {}
                });
                return this;
            }
        });

        requirejs._moduleExecute(moduleName);
        return Page;
    });
})();