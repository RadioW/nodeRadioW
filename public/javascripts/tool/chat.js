/**
 * Created by betrayer on 17.12.14.
 */
(function chatjs(){
    var moduleName = m.tool.$chat;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$tool);

    define(moduleName, defineArray, function chat_module(){
        var Tool = require(m.$tool);

        var Chat = Tool.inherit({
            "className": "Chat",
            "constructor": function(options) {
                var that = this;

                Tool.fn.constructor.call(that, {
                    title: "Чат",
                    color: "orange",
                    display: {
                        users: {
                            icon: "bullhorn",
                            socket: {
                                event: "info:chat",
                                route: "main",
                                handler: function(data) {
                                    return data.length;
                                }
                            }
                        }
                    }
                });
                core.connection.socket.emit("event", {
                    event: "requestInfo",
                    route: "chat",
                    data: null
                });
                that.lastMessageIndex = 0;
            },
            "activate": function() {
                var that = this;
                Tool.fn.activate.call(that);
                core.connection.socket.emit("event", {
                    event: "connection",
                    route: "chat",
                    data: null
                });
            },
            "deactivate": function() {
                var that = this;
                Tool.fn.deactivate.call(that);
                core.connection.socket.emit("event", {
                    event: "disconnect",
                    route: "chat",
                    data: null
                });
                setTimeout(function() {
                    that.roll.empty();
                    that.lastMessageIndex = 0;
                }, 300);
            },
            "initContent": function() {
                var that = this;
                Tool.fn.initContent.call(that);
                that.roll = $('<div style="overflow:hidden">');
                that.content.append(that.roll);
            },
            "initListeners": function() {
                var that = this;
                Tool.fn.initListeners.call(that);

                core.connection.listen({
                    route: "chat",
                    event: "connection",
                    handler: function(data) {
                        that.requestMessages();
                        console.log('chat socket connected');
                    }
                });

                core.connection.listen({
                    route: "chat",
                    event: "join",
                    handler: function(data) {
                        that.scrollDown();
                        that.roll.append($('<em>').html(data+" вошел в чат"));

                    }
                });
                core.connection.listen({
                    route: "chat",
                    event: "left",
                    handler: function(data) {
                        that.scrollDown();
                        that.roll.append($('<em>').html(data+" вышел из чата"));
                    }
                });
                core.connection.listen({
                    route: "chat",
                    event: "message",
                    handler: function(data) {
                        that.scrollDown();
                        that.roll.append(that.wrapMessage(data));
                        that.lastMessageIndex++;
                    }
                });

                core.connection.listen({
                    route: "chat",
                    event: "responseMessages",
                    handler: function(data) {
                        for (var i = 0; i < data.length; ++i) {
                            that.roll.prepend(that.wrapMessage(data[i]));
                        }
                        if (that.lastMessageIndex == 0) {
                            that.content.scrollTop(that.roll.height());
                        }
                        that.lastMessageIndex += data.length;
                    }
                });
            },
            "initWindow": function() {
                var that = this;
                Tool.fn.initWindow.call(that);

                that.wnd.css("padding-bottom", "70px");
                that.form = $('<div class="tool-chat-form">');
                that.wnd.append(that.form);
                that.textarea = $('<textarea>');
                that.form.append(that.textarea);
                that.form.append($('<button class="tool-color-'+that.options.color+'">').html('Отправить').on("click", function() {that.sendMessage();}));
            },
            "requestMessages": function() {
                core.connection.socket.emit('event', {
                    route: "chat",
                    event: "requestMessages",
                    data: this.lastMessageIndex
                });
            },
            "scrollDown": function() {
                var that = this;
                var bottomFar = that.roll.height() - that.content.height() - that.content.scrollTop();

                if (bottomFar < 5) {
                    setTimeout(function(){
                        that.content.scrollTop(that.roll.height());
                    }, 20);
                }
            },
            "sendMessage": function() {
                var that = this;
                var message = that.textarea.val();
                if (message.replace(/\s/g, "").length) {
                    that.textarea.val('');
                    core.connection.socket.emit('event', {
                        route: "chat",
                        event: "message",
                        data: message
                    });
                }
            },
            "wrapMessage": function(data) {
                var message = $('<div>').html(data.user + ": "+ data.message);
                return message;
            }
        });

        requirejs._moduleExecute(moduleName);
        return Chat;
    });
})();