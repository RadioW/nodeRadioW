/**
 * Created by betrayer on 18.11.14.
 */
"use strict";

(function messagesjs() {
    var moduleName = m.widget.$messages;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.$message);

    define(moduleName, defineArray, function messages_module(){
        var Widget = require(m.$widget);
        var Message = require(m.$message);

        var Messages = Widget.inherit({
            "className": "Messages",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "name": "Сообщения",
                    "path": "messages",
                    "userId": "" //REQUIRED IN PARAMS!
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;
                that.lastShownMessageIndex = 0;

                Widget.fn.constructor.call(that, baseOptions);
                that.initDialogue();
            },
            "initContent": function() {
                var that = this;

                that.requestMessages();
                Widget.fn.initContent.call(that);
            },
            "initDialogue": function() {
                var that = this;
                that.dialogue = $('<div class="container-fluid widget-dialogue">');
                that.dialogue.css({
                    "position": "relative",
                    "height": "100%",
                    "display": "none",
                    "background-color": "white",
                    "opacity": 0
                });
                that.border.append(that.dialogue);
                that.dialogue.append($('<p class="text-center lead">').html('Переписка'));

                var messageForm = that.messageForm = $('<form class="comment">');
                messageForm.on('submit', function (e) {
                    e.preventDefault();
                });
                that.messageArea = $('<textarea class="form-control">');
                messageForm.append(that.messageArea);
                messageForm.append($('<input type="submit" class="btn btn-primary">'));

                var messageRoll = that.messageRoll = $('<div class="messageRoll">');

                that.dialogue.append(messageRoll);
                that.dialogue.append(messageForm);
            },
            "initSockets": function() {
                var that = this;

                that.on("messagesListResponse", function(data) {
                    for (var i=0; i<data.messages.length; ++i) {
                        var message = new Message(data.messages[i]);
                        that.messageRoll.prepend(message.wrapper);
                    }
                    that.lastShownMessageIndex = data.lastIndex;
                }, true);

                Widget.fn.initSockets.call(that);
            },
            "getExpandedContent":function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);

                that.dialogueMode();
                setTimeout(function() {
                    container.css("opacity", 1);
                    that.dialogue.css("opacity", 1);
                }, 550);
            },
            "dialogueMode": function() {
                var that = this;

                if (that.dialogueModeOn) {
                    that.expanded.css("height", "100%");
                    setTimeout(function() {
                        that.dialogue.css("display", "none");
                        that.dialogueModeOn = false;
                    }, 500);
                } else {
                    that.dialogueModeOn = true;
                    that.dialogue.css({
                        "display": "block"
                    });
                    that.expanded.css("height", 0);
                    setTimeout(function() {
                        that.messageRoll.height(that.dialogue.height() - that.expandedHeader.height() - parseFloat(that.expandedHeader.css("margin-bottom")) - that.messageForm.height() - 30);
                    }, 550);
                }
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);
                if (that.dialogueModeOn) {
                    that.dialogue.css("opacity", 0);
                    that.dialogueMode();
                }
            },
            "requestMessages": function() {
                var that = this;
                that.emit("messageListRequest", {
                    lastIndex: that.lastShownMessageIndex
                });
            }
        });

        requirejs._moduleExecute(moduleName);
        return Messages;
    });
})();