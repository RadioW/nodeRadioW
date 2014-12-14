/**
 * Created by betrayer on 05.10.14.
 */
"use strict";

(function chatjs(){
    var moduleName = m.page.$chat;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);

    define(moduleName, defineArray, function chat_module(){
        var Page = require(m.$page);
        var Chat = Page.inherit({
            "className": "Chat",
            "websocket": true,
            "name": "Чат",
            "constructor": function(params) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "chat"
                });
            },
            "run": function() {
                var that = this;

                var input = that.input = $('#room input');
                var form = $('#room form');
                var ul = $('#room ul');

                input.prop('disabled', true);

                that
                    .on('connection', function() {
                        printStatus("соединение установлено");
                        input.prop('disabled', false);
                        form.on("submit", function() {
                            that.send();
                            return false;
                        });
                    })

                    .on('message', function(data) {
                        $('<li>').text((data.user == core.user.name ? 'я':data.user) + ' -> ' + data.message).appendTo(ul);
                    })

                    .on('join', function (username) {
                        if (username = core.user.name) {
                            printStatus("Добро пожаловать, " + username);
                        } else {
                            printStatus(username + ' вошел в чат');
                        }
                    })
                    .on('left', function (username) {
                        printStatus(username + ' вышел из чата');
                    });


                function printStatus(status) {
                    $('<li>').append($('<i>').text(status)).appendTo(ul);
                }

                Page.fn.run.call(that);
            },
            "send": function() {
                var that = this;
                var text = that.input.val();
                that.emit('message', text);
                that.input.val('');
            }
        });

        $.extend(Chat, {
            "title": "chat"
        });

        requirejs._moduleExecute(moduleName);
        return Chat;
    });
})();