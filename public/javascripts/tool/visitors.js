/**
 * Created by betrayer on 15.12.14.
 */
(function visitorsjs(){
    var moduleName = m.tool.$visitors;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$tool);

    define(moduleName, defineArray, function visitors_module(){
        var Tool = require(m.$tool);

        var Visitors = Tool.inherit({
            "className": "Visitors",
            "constructor": function(options) {
                var that = this;

                Tool.fn.constructor.call(that, {
                    title: "Посетители",
                    color: "blue",
                    display: {
                        users: {
                            icon: "user",
                            socket: {
                                event: "info",
                                route: "main",
                                handler: function(data) {
                                    return data.users.length;
                                }
                            }
                        },
                        guests: {
                            icon: "eye-open",
                            socket: {
                                event: "info",
                                route: "main",
                                handler: function(data) {
                                    return data.guests.length;
                                }
                            }
                        }
                    }
                });
                that.users = {};
            },
            "activate": function() {
                var that = this;
                Tool.fn.activate.call(that);
                that.refresh();
            },
            "initListeners": function() {
                var that = this;
                Tool.fn.initListeners.call(that);

                core.connection.listen({
                    route: "main",
                    event: "info",
                    handler: function(data) {
                        that.users = data.users;
                        if (that.active) {
                            that.refresh();
                        }
                    }
                });
            },
            "refresh": function() {
                var that = this;
                that.content.empty();
                for (var i = 0; i < that.users.length; ++i) {
                    that.content.append($('<a class="tool-visitors-link" href="/user/'+that.users[i].id+'">').html(that.users[i].name));
                }
                core.explorer.clickers(that.content.find('a'));
            }
        });

        requirejs._moduleExecute(moduleName);
        return Visitors;
    });
})();