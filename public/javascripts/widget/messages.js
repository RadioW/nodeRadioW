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
                that.receiver = "";
                that.dialogues = [];
                that.messages = {};

                Widget.fn.constructor.call(that, baseOptions);
                that.initDialogue();
            },
            "destructor": function() {
                var that = this;

                for (var i=0; i<that.dialogues.length; ++i) {
                    that.dialogues[i].wrapper.off("click");
                    that.dialogues[i].wrapper.remove();
                }
                that.dialogues = undefined;
                Widget.fn.destructor.call(that);
            },
            "initAdditionalSockets": function() {
                var that = this;

                that.on("dialoguesResponse", function(data) {
                    for (var i=0; i<that.dialogues.length; ++i) {
                        that.dialogues[i].wrapper.off("click");
                        that.dialogues[i].wrapper.remove();
                    }
                    that.dialogues = [];
                    for (var i=0; i<data.length; ++i) {
                        var dialogue = {
                            wrapper:$('<div class="dialogue" id="' + data[i].id + '">'),
                            container:$('<div>').css({
                                "height": "75px",
                                "width": "100%",
                                "margin-top": "-10px"
                            })
                        };
                        if (data[i].lastMessage.author === core.user.id) {
                            data[i].lastMessage.user = {
                                id: core.user.id,
                                name: core.user.name
                            }
                        } else {
                            data[i].lastMessage.user = {
                                id: data[i].lastMessage.author,
                                name: data[i].username
                            }
                        }
                        data[i].lastMessage.type = "message";
                        data[i].lastMessage.id = data[i].lastMessage._id;
                        data[i].lastMessage.state = data[i].lastMessage.meta[data[i].lastMessage.meta.length-1].status;
                        data[i].lastMessage.dialogue = data[i]._id;
                        data[i].lastMessage.notHandled = true;
                        var message = new Message(data[i].lastMessage);
                        that.messages[message.id] = message;
                        if (i/2 == Math.ceil(i/2)) {
                            dialogue.wrapper
                                .append($('<img style="right:10px" src="/data/' + data[i].id + '/avatar-md.jpg?'+Math.random()+'">'))
                                .append($('<p style="float:right;text-align: right">').html(data[i].username));
                            dialogue.container.css({
                                "float": "right"
                            });
                            dialogue.wrapper.css("padding-right", "120px");
                        } else {
                            dialogue.wrapper
                                .append($('<img style="left:10px" src="/data/' + data[i].id + '/avatar-md.jpg?'+Math.random()+'">'))
                                .append($('<p style="float:left;text-align: left">').html(data[i].username));
                            dialogue.container.css({
                                "float": "left"
                            });
                            dialogue.wrapper.css("padding-left", "120px");
                        }
                        dialogue.wrapper.append(dialogue.container);
                        dialogue.container.append(message.wrapper);
                        dialogue.wrapper.on("click", (function(id){
                            return function(){
                                that.dialogueMode(id);
                            }
                        })(data[i].id));
                        that.expanded.append(dialogue.wrapper);
                        that.dialogues.push(dialogue);
                    }
                });
                that.on("messageListResponse", function(data) {
                    for (var i=0; i<data.messages.length; ++i) {
                        var message = new Message(data.messages[i]);
                        that.messageRollContainer.prepend(message.wrapper);
                        that.messages[message.id] = message;
                    }
                    setTimeout(function() {
                        if (!that.lastShownMessageIndex) {
                            that.messageRoll.scrollTop(that.messageRollContainer.height());
                        }
                        that.lastShownMessageIndex = data.lastIndex;
                    }, 20);
                });
                that.on('readMessage', function(data) {
                    if (that.messages[data] instanceof Message)
                    that.messages[data].status("normal")
                });

                that.on("incomingMessage", function(data){
                    var message = new Message(data);
                    that.messages[message.id] = message;
                    if (that.messageRollContainer.height() - that.messageRoll.height() == that.messageRoll.scrollTop()) {
                        setTimeout(function(){
                            that.messageRoll.scrollTop(that.messageRollContainer.height());
                            ++that.lastShownMessageIndex;
                        }, 20);
                    }
                    that.messageRollContainer.append(message.wrapper);

                });
            },
            "initContent": function() {
                var that = this;

                that.emit("requestDialoguesShort", that.options.userId);
                Widget.fn.initContent.call(that);
                that.shortRoll = $("<div>");
                that.container.append(that.shortRoll);
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
                    that.emitMessage();
                    e.preventDefault();
                });
                that.messageArea = $('<textarea class="form-control">');
                messageForm.append(that.messageArea);
                messageForm.append($('<input type="submit" class="btn btn-primary">'));

                var messageRoll = that.messageRoll = $('<div class="messageRoll">');
                that.messageRollContainer = $('<div style="overflow: hidden">');
                that.messageRoll.append(that.messageRollContainer);

                that.dialogue.append(messageRoll);
                that.dialogue.append(messageForm);

                if (that.options.userId == core.user.id) {
                    var buttonBack = $('<button class="btn btn-primary">').append($('<i class="glyphicon glyphicon-chevron-down">')).css({
                        position: "absolute",
                        top: 0,
                        right: 0
                    });
                    that.dialogue.append(buttonBack);
                    buttonBack.on("click", function() {
                        that.dialogueMode();
                        that.emit("dialoguesRequest");
                    });
                }
            },
            "emitMessage": function() {
                var that = this;
                that.emit("newMessage", {
                    receiver: that.receiver,
                    message: that.messageArea.val()
                });
                that.messageArea.val("");
            },
            "initSockets": function() {
                var that = this;

                that.on("responseDialoguesShort", function(data) {
                    that.shortRoll.empty();
                    if (data.owner == true) {
                        that.shortRoll.append($('<p>').html("Здесь очень скоро будут отображаться Ваши последие диалоги"))
                    } else {
                        for (var i = 0; i<data.messages.length; ++i) {
                            var message = new Message(data.messages[i]);
                            that.shortRoll.append(message.wrapper);
                        }
                        if (data.messages.length == 0) {
                            that.shortRoll.append($('<p>').html("Вы никогда прежде не вели переписку с этим пользователем"));
                        }
                    }
                });
                Widget.fn.initSockets.call(that);
            },
            "getExpandedContent":function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);
                that.initAdditionalSockets();
                if (that.options.userId == core.user.id) {

                    that.emit("dialoguesRequest");
                } else {
                    that.dialogueMode();
                }

                setTimeout(function() {
                    container.css("opacity", 1);
                    that.dialogue.css("opacity", 1);
                }, 550);
            },
            "dialogueMode": function(receiver) {
                var that = this;
                receiver = receiver || that.options.userId;
                for (var key in that.messages) {
                    if (that.messages.hasOwnProperty(key)) {
                        that.messages[key].destructor();
                        delete that.messages[key];
                    }
                }

                if (that.dialogueModeOn) {
                    that.expanded.css("height", "100%");
                    that.emit("leaveDialogue", {});
                    setTimeout(function() {
                        that.dialogue.css("display", "none");
                        that.dialogueModeOn = false;
                        that.receiver = "";
                        that.lastShownMessageIndex = 0;
                        that.messageRollContainer.empty();
                    }, 500);
                } else {
                    that.dialogueModeOn = true;
                    that.dialogue.css({
                        "display": "block"
                    });
                    that.receiver = receiver;

                    that.expanded.css("height", 0);
                    if (that.dialogue.height() < 350) {
                        setTimeout(function() {
                            that.messageRoll.height(that.dialogue.height() - that.expandedHeader.height() - parseFloat(that.expandedHeader.css("margin-bottom")) - that.messageForm.height() - 30);
                            that.requestMessages();
                        }, 550);
                    } else {
                        that.messageRoll.height(that.dialogue.height() - that.expandedHeader.height() - parseFloat(that.expandedHeader.css("margin-bottom")) - that.messageForm.height() - 30);
                        that.requestMessages();
                    }

                }
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);
                if (that.dialogueModeOn) {
                    that.dialogue.css("opacity", 0);
                    that.dialogueMode();
                } else {
                    for (var key in that.messages) {
                        if (that.messages.hasOwnProperty(key)) {
                            that.messages[key].destructor();
                            delete that.messages[key];
                        }
                    }
                }
            },
            "requestMessages": function() {
                var that = this;
                    that.emit("messageListRequest", {
                        lastIndex: that.lastShownMessageIndex,
                        receiver: that.receiver
                    });
            }
        });

        requirejs._moduleExecute(moduleName);
        return Messages;
    });
})();