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
                var panes = {};
                var dialogueMode = {
                    "name": "mainExpanded",
                    "type": "mainExpanded",
                    "title": "Диалог",
                    initialize: function() {
                        var pane = this;
                        var messageForm = pane.messageForm = $('<form class="comment">').css({
                            position: "absolute",
                            bottom: 0,
                            left: 0
                        });
                        pane.content.css({
                            "padding-bottom": "85px",
                            "overflow": "hidden",
                            "padding-right": 0
                        });
                        messageForm.on('submit', function (e) {
                            e.preventDefault();
                            that.emitMessage(pane.messageArea.val());
                            pane.messageArea.val("")
                        });
                        pane.messageArea = $('<textarea class="form-control">');
                        messageForm.append(pane.messageArea);
                        pane.messageArea.keypress(function(e) {
                            if (e.keyCode == 13 && !e.shiftKey) {
                                e.preventDefault();
                                that.emitMessage(pane.messageArea.val());
                                pane.messageArea.val("")
                            }
                        });
                        messageForm.append($('<input type="submit" class="btn btn-primary">'));
                        var messageRoll = that.messageRoll = $('<div class="messageRoll">');
                        that.messageRollContainer = $('<div style="overflow: hidden">');
                        that.messageRoll.append(that.messageRollContainer);

                        pane.content.append(messageRoll);
                        pane.content.append(messageForm);
                    },
                    deactivate: function() {
                        that.emit("leaveDialogue", {});
                        that.receiver = "";
                        that.lastShownMessageIndex = 0;
                        that.messageRollContainer.empty();

                        for (var key in that.messages) {
                            if (that.messages.hasOwnProperty(key)) {
                                that.messages[key].destructor();
                                delete that.messages[key];
                            }
                        }
                        if (that.options.userId !== core.user.id) {
                            that.emit("messagesRequestShort", that.options.userId);
                        }
                        that.standBy(this);
                    },
                    activate: function(receiver) {
                        var pane = this;
                        receiver = receiver || that.options.userId;

                        that.receiver = receiver;
                        that.requestMessages();

                        that.on("messageListResponse", function(data) {
                            for (var i=0; i<data.messages.length; ++i) {
                                var message = new Message(data.messages[i]);
                                that.messageRollContainer.prepend(message.wrapper);
                                that.messages[message.id] = message;
                            }
                            pane.setTitle("Диалог с " + data.pal.name);
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

                        that.on("incomingMessage", function(data) {
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
                    }
                };
                var main = {
                    "name": "main",
                    "type": "main",
                    "title": "Сообщения",
                    initialize: function() {
                        var pane = this;
                        pane.content.css("overflow", "hidden");
                        that.on('messagesResponseShort', function(data) {
                            pane.content.empty();
                            if (data.length == 0) {
                                pane.content.append($('<p>').html("Вы прежде не вели переписку с этим пользователем"));
                            } else {
                                for (var i = 0; i< data.length; ++i) {
                                    var message = new Message(data[i]);
                                    pane.content.append(message.wrapper);
                                }
                            }
                        }, true);
                        that.on('updateDialogue', function(data) {
                            if (data.user.id == that.options.userId) {
                                that.emit("messagesRequestShort", that.options.userId); //not so good solution
                            }
                        }, true);
                        that.emit("messagesRequestShort", that.options.userId);
                    }
                };
                if (params.userId === core.user.id) {
                    main.initialize = function() {
                        var pane = this;
                        pane.content.css("overflow", "hidden");
                        that.on("dialoguesResponse", function (data) {
                            for (var i = 0; i < that.dialogues.length; ++i) {
                                that.dialogues[i].destructor();
                            }
                            that.dialogues = [];
                            pane.content.empty();
                            var right = false;
                            for (var i = 0; i < data.length; ++i) {
                                var dialogue = new Dialogue($.extend(data[i], {
                                    right: right
                                }));

                                that.dialogues.push(dialogue);
                                if (that.fullSized) {
                                    that.panes.mainExpanded.content.append(dialogue.wrapper);
                                    dialogue.wrapper.on("click", (function (id) {
                                        return function () {
                                            that.dialogueMode(id);
                                        }
                                    })(data[i].user.id));
                                }
                                right = !right;
                            }

                            if (that.dialogues.length == 0) {
                                pane.content.append($('<p class="placeholder">').html("Пока вы не вели переписку ни с кем из радиослушателей"));
                            } else {
                                for (var i = 0; i < that.dialogues.length; ++i) {
                                    pane.content.append(that.dialogues[i].previewWrapper);
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
                        that.emit("dialoguesRequest", that.options.userId);
                    };
                    panes.mainExpanded = {
                        "name": "mainExpanded",
                        "type": "mainExpanded",
                        "title": "Диалоги",
                        "initialize": function() {
                            for (var i=0; i<that.dialogues.length; ++i) {
                                this.content.append(that.dialogues[i].wrapper);
                                that.dialogues[i].wrapper.on("click", (function(id){
                                    return function(){
                                        that.switchMode("dialogueMode", id);
                                    }
                                })(that.dialogues[i].user.id));
                            }
                        },
                        "activate": function() {},
                        "deactivate": function() {}
                    };
                    panes.dialogueMode = dialogueMode;
                    dialogueMode.type = "modeExpanded";
                    dialogueMode.name = "dialogueMode";
                    dialogueMode.noSwitch = true;
                } else {
                    panes.mainExpanded = dialogueMode;
                }
                panes.main = main;
                var baseOptions = {
                    "name": "Сообщения",
                    "path": "messages",
                    "userId": "", //REQUIRED IN PARAMS!
                    "panes": panes
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;
                that.lastShownMessageIndex = 0;
                that.receiver = "";
                that.dialogues = [];
                that.messages = {};

                Widget.fn.constructor.call(that, baseOptions);
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
            "emitMessage": function(message) {
                var that = this;
                if (message && message.replace(/\s/g, "").length) {
                    that.emit("newMessage", {
                        receiver: that.receiver,
                        message: message
                    });
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
                    that.panes.main.content.find('.placeholder').remove();
                    if (that.fullSized) {
                        dialogue.wrapper.on("click", function () {
                            that.switchMode("dialogueMode", dialogue.user.id);
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
                    that.panes.main.content.append(dialogue.previewWrapper);
                }
                if (that.fullSized) {
                    if (that.dialogues[1]) {
                        that.dialogues[1].wrapper.before(dialogue.wrapper);
                    } else {
                        that.panes.mainExpanded.content.append(dialogue.wrapper);
                    }
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Messages;
    });
})();