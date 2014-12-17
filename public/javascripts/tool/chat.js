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
                    color: "orange"
                });
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
                    that.content.empty();
                }, 300);
            },
            "initListeners": function() {
                var that = this;
                Tool.fn.initListeners.call(that);
                core.connection.listen({
                    route: "chat",
                    event: "join",
                    handler: function(data) {
                        that.content.append($('<p>').html(data+" вошел в чат"));
                    }
                });
                core.connection.listen({
                    route: "chat",
                    event: "left",
                    handler: function(data) {
                        that.content.append($('<p>').html(data+" вышел из чата"));
                    }
                });
                core.connection.listen({
                    route: "chat",
                    event: "message",
                    handler: function(data) {
                        that.content.append(that.wrapMessage(data));
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