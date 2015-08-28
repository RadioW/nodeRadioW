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
                                    return data.userCount;
                                }
                            }
                        },
                        guests: {
                            icon: "eye-open",
                            socket: {
                                event: "info",
                                route: "main",
                                handler: function(data) {
                                    return data.guestCount;
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
                for (var name in that.users) {
                    if (that.users.hasOwnProperty(name)) {
                        var user = that.users[name];
                        that.content.append($('<a class="tool-visitors-link" href="/user/'+user.id+'">').html(name));
                    }
                }
                core.explorer.clickers(that.content.find('a'));
            }
        });

        requirejs._moduleExecute(moduleName);
        return Visitors;
    });
})();