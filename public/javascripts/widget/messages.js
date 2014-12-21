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
    defineArray.push(m.$dialogue);

    define(moduleName, defineArray, function messages_module(){
        var Widget = require(m.$widget);
        var Message = require(m.$message);
        var Dialogue = require(m.$dialogue);

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

                that.on("messageListResponse", function(data) {
                    for (var i=0; i<data.messages.length; ++i) {
                        var message = new Message(data.messages[i]);
                        that.messageRollContainer.prepend(message.wrapper);
                        that.messages[message.id] = message;
                    }
                    that.pal.html(data.pal.name);
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
                    if (that.messageRollContainer.height() - that.messageRoll.height() - that.messageRoll.scrollTop() < 5) {
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

                if (that.options.userId == core.user.id) {
                    that.emit("dialoguesRequest", that.options.userId);
                } else {
                    that.emit("messagesRequestShort", that.options.userId);
                }
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
                that.pal = $('<span>');
                that.dialogue.append($('<p class="text-center lead">').html('Диалог с ').append(that.pal));
                if (core.user.id && core.user.name) {
                    var messageForm = that.messageForm = $('<form class="comment">');
                    messageForm.on('submit', function (e) {
                        that.emitMessage();
                        e.preventDefault();
                    });
                    that.messageArea = $('<textarea class="form-control">');
                    messageForm.append(that.messageArea);
                    that.messageArea.keypress(function(e) {
                        if (e.keyCode == 13 && !e.shiftKey) {
                            e.preventDefault();
                            that.sendMessage();
                        }
                    });
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
                        buttonBack.on("click", function () {
                            that.dialogueMode();
                        });
                    }
                }
            },
            "emitMessage": function() {
                var that = this;
                if (that.messageArea.val().replace(/\s/g, "").length) {
                    that.emit("newMessage", {
                        receiver: that.receiver,
                        message: that.messageArea.val()
                    });
                    that.messageArea.val("");
                }
            },
            "initSockets": function() {
                var that = this;

                if (that.options.userId == core.user.id) {
                    that.on("dialoguesResponse", function (data) {
                        for (var i = 0; i < that.dialogues.length; ++i) {
                            that.dialogues[i].destructor();
                        }
                        that.dialogues = [];
                        that.shortRoll.empty();
                        var right = false;
                        for (var i = 0; i < data.length; ++i) {
                            var dialogue = new Dialogue($.extend(data[i], {
                                right: right
                            }));

                            that.dialogues.push(dialogue);
                            if (that.fullSized) {
                                that.expanded.append(dialogue.wrapper);
                                dialogue.wrapper.on("click", (function (id) {
                                    return function () {
                                        that.dialogueMode(id);
                                    }
                                })(data[i].user.id));
                            }
                            right = !right;
                        }

                        if (that.dialogues.length == 0) {
                            that.shortRoll.append($('<p class="placeholder">').html("Пока вы не вели переписку ни с кем из радиослушателей"));
                        } else {
                            for (var i = 0; i < that.dialogues.length; ++i) {
                                that.shortRoll.append(that.dialogues[i].previewWrapper);
                            }
                        }
                    }, true);
                    that.on("updateDialogue", function(data) {
                        for (var i = 0; i<that.dialogues.length; ++i) {
                            if (that.dialogues[i].id == data.id) {
                                var dialogue = that.dialogues.splice(i, 1)[0];
                                that.updateDialogues(data, dialogue);
                                return;
                            }
                        }
                        that.updateDialogues(data);
                    }, true);
                } else {
                    that.on('messagesResponseShort', function(data){
                        that.shortRoll.empty();
                        if (data.length == 0) {
                            that.shortRoll.append($('<p>').html("Вы прежде не вели переписку с этим пользователем"));
                        } else {
                            for (var i = 0; i< data.length; ++i) {
                                var message = new Message(data[i]);
                                that.shortRoll.append(message.wrapper);
                            }
                        }
                    }, true);
                    that.on('updateDialogue', function(data) {
                        if (data.user.id == that.options.userId) {
                            that.emit("messagesRequestShort", that.options.userId); //not so good solution
                        }
                    }, true)
                }
                Widget.fn.initSockets.call(that);
            },
            "getExpandedContent":function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);
                that.initAdditionalSockets();
                if (that.options.userId == core.user.id) {
                    for (var i=0; i<that.dialogues.length; ++i) {
                        that.expanded.append(that.dialogues[i].wrapper);
                        that.dialogues[i].wrapper.on("click", (function(id){
                            return function(){
                                that.dialogueMode(id);
                            }
                        })(that.dialogues[i].user.id));
                    }
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
                if (that.options.userId !== core.user.id) {
                    that.emit("messagesRequestShort", that.options.userId);
                }
            },
            "requestMessages": function() {
                var that = this;
                    that.emit("messageListRequest", {
                        lastIndex: that.lastShownMessageIndex,
                        receiver: that.receiver
                    });
            },
            "updateDialogues": function(data, dialogue) {
                var that = this;
                if (!dialogue) {
                    dialogue = new Dialogue(data);
                    that.shortRoll.find('.placeholder').remove();
                    if (that.expanded) {
                        dialogue.wrapper.on("click", function () {
                            that.dialogueMode(dialogue.user.id);
                        });
                    }
                } else {
                    dialogue.update(data);
                }
                that.dialogues.unshift(dialogue);
                for (var j = 0; j<that.dialogues.length; ++j) {
                    if (Math.floor(j/2) == j/2) {
                        that.dialogues[j].moveLeft();
                    } else {
                        that.dialogues[j].moveRight();
                    }
                }
                if (that.dialogues[1]) {
                    that.dialogues[1].previewWrapper.before(dialogue.previewWrapper);
                } else {
                    that.shortRoll.append(dialogue.previewWrapper);
                }
                if (that.fullSized) {
                    if (that.dialogues[1]) {
                        that.dialogues[1].wrapper.before(dialogue.wrapper);
                    } else {
                        that.expanded.append(dialogue.wrapper);
                    }
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Messages;
    });
})();