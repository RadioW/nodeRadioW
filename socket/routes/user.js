/**
 * Created by betrayer on 08.10.14.
 */
"use strict";

var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var User = require('../../models/user').User;
var Dialogue = require('../../models/dialogue').Dialogue;
var extend = require('extend');
var fs = require('fs');
var async = require('async');

var UserRoute = Route_io.inherit({
    "className": "UserRoute_io",
    "constructor": function(io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "user"
        });

        that.on('check', function (socket, data) {
            User.findOne({'username': data}, function (err, user) {
                if (err) return that.emit('error', socket, err.message);
                if (user) return that.emit('buzy', socket);
                if (!user) return that.emit('free', socket);
            });
        });

        that.on('join', function (socket, data) {
            socket.join(data);
            socket.request.watch = data;
        });

        that.on('disconnect', function (socket, data) {
            if (socket.request.watch) {
                socket.leave(socket.request.watch);
                socket.request.watch = undefined;
            }
            if (socket.request.dialogue) {
                socket.leave(socket.request.dialogue);
                socket.request.dialogue = undefined;
            }
        });

        that.on('blog', function (socket, data) {
            User.findById(socket.request.session.user, function (err, user) {
                if (err) return that.emit('error', socket, err.message);
                data.message = data.message.replace(/\n/g, "<br/>");
                if (data.editing) {
                    var post = user.data.blog.id(data.editing);
                    post.message = data.message;
                    post.date = Date.now();
                    post.meta.push({
                        status: "remarked",
                        date: Date.now()
                    });
                    user.save(function (err) {
                        if (err) return that.emit('error', socket, err.message);
                        that.to(socket.request.watch, 'remarkedBlog', {
                            message: data.message,
                            date: Date.now(),
                            author: {
                                username: user.username,
                                _id: user._id
                            },
                            _id: data.editing,
                            comment: post.comments.length
                        });
                    });
                } else {
                    user.data.blog.push({
                        link: 'none',
                        message: data.message,
                        author: user._id,
                        meta: [
                            {
                                status: "normal",
                                date: Date.now()
                            }
                        ]
                    });

                    user.save(function (err) {
                        if (err) return that.emit('error', socket, err.message);
                        that.to(socket.request.watch, 'newBlog', {
                            message: data.message,
                            date: Date.now(),
                            author: {
                                username: user.username,
                                _id: user._id
                            },
                            _id: user.data.blog[user.data.blog.length - 1]._id
                        });
                    });
                }
            });
        });

        that.on('requestInfoShort', function(socket, data){
            User.findById(data, function (err, user) {
                if (err)
                    return that.emit('error', socket, err.message);
                that.emit('responseInfoShort', socket, {
                    username: user.username,
                    info: user.info
                });
            });
        });

        that.on('requestBlogShort', function(socket, data) {
            User.findById(data, function(err, user) {
                if(err) {
                    return that.emit('error', socket, err.message);
                }
                var limit = 0;
                var array = [];
                for (var i=user.data.blog.length-1; i>=0; i--) {
                    array.push(user.data.blog[i].message);
                    limit++;
                    if (limit == 5) {
                        break;
                    }
                }
                that.emit('responseBlogListShort', socket, array);
            });
        });

        that.on('requestBlogFull', function(socket, data) {
            User.findById(data, function(err, user) {
                if(err) {
                    return that.emit('error', socket, err.message);
                }
                User.populate(user.data.blog, {path: "author"}, function(err, blog) {
                    if(err) {
                        return that.emit('error', socket, err.message);
                    }
                    var array = [];
                    for (var i=blog.length-1; i>=0; i--) {

                        array.push({
                            message: blog[i].message,
                            date: blog[i].date,
                            _id: blog[i]._id,
                            author: {
                                _id: blog[i].author._id,
                                username: blog[i].author.username
                            },
                            comments: blog[i].comments.length
                        });
                    }
                    that.emit('responseBlogListFull', socket, array);
                });
            });
        });

        that.on("photoShortRequest", function(socket, data) {
            User.findById(data, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var photos = user.data.photo;
                var answer = [];
                for (var i=0; i<6; i++) {
                    if (photos.length == 0) {
                        break;
                    }
                    var random = Math.floor(Math.random()*photos.length);
                    answer.push(photos.splice(random, 1)[0]._id);
                }
                that.emit('photoShortResponse', socket, answer);
            });
        });

        that.on("photoRequest", function(socket, data) {
            User.findById(data, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var photos = user.data.photo;
                var answer = [];
                for (var i=photos.length-1; i>=0; i--) {
                    answer.push(photos[i]._id);
                }
                that.emit('photoResponse', socket, answer);
            });
        });

        that.on("messageListRequest", function(socket, data) {
            if (!socket.request.session.user) return that.emit('error', socket, 'Ошибка! Вы не авторизованы! Отправка сообщений и просмотр диалогов невозможны!');
            User.findById(data.receiver, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var dialogueId = user.data.dialogues[socket.request.session.user];
                if (dialogueId) {
                    Dialogue.findById(dialogueId, function (err, dialogue) {
                        if (err) {
                            return that.emit('error', socket, err.message);
                        }
                        var users = {};
                        if (socket.request.dialogue) {
                            socket.leave(socket.request.dialogue);
                        }
                        socket.request.dialogue = dialogueId;
                        socket.join(dialogueId);

                        User.findById(dialogue.users[0], function (err, user1) {
                            if (err) {
                                return that.emit('error', socket, err.message);
                            }
                            User.findById(dialogue.users[1], function (err, user2) {
                                if (err) {
                                    return that.emit('error', socket, err.message);
                                }
                                users[user1._id] = user1;
                                users[user2._id] = user2;
                                var answer = [];
                                var counter = 0;
                                dialogue = dialogue.messages;

                                for (var i = dialogue.length - 1 - data.lastIndex; i >= 0; --i) {
                                    answer.push({
                                        message: dialogue[i].message,
                                        date: dialogue[i].date,
                                        user: {
                                            id: dialogue[i].author,
                                            name: users[dialogue[i].author].username
                                        },
                                        type: "message",
                                        id: dialogue[i]._id,
                                        state: dialogue[i].meta[dialogue[i].meta.length - 1].status,
                                        dialogue: dialogueId
                                    });
                                    if (++counter > 20) {
                                        break;
                                    }
                                }
                                that.emit("messageListResponse", socket, {
                                    messages: answer,
                                    lastIndex: dialogue.length - i
                                })
                            });
                        });
                    });
                }
            });
        });

        that.on("newMessage", function(socket, data) {
            if (!socket.request.session.user) return that.emit('error', socket, 'Ошибка! Вы не авторизованы! Отправка сообщений и просмотр диалогов невозможны!');
            var snd, rcv;
            async.waterfall([
                function(callback) {
                    User.findById(socket.request.session.user, callback)
                },
                function(sender, callback) {
                    User.findById(data.receiver, function(err, receiver) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        if (!receiver) {
                            callback({message: "Не удалось найти адресата"});
                            return;
                        }
                        callback(null, sender, receiver);
                    });
                },
                function(sender, receiver, callback) {
                    var dialogueId = sender.data.dialogues[receiver._id];
                    var dialogue;
                    snd = sender;
                    rcv = receiver;
                    if (!dialogueId) {
                        dialogue = new Dialogue();
                        sender.data.dialogues[receiver._id] = dialogue._id.toString();
                        receiver.data.dialogues[sender._id] = dialogue._id.toString();
                        sender.markModified('data.dialogues');
                        receiver.markModified('data.dialogues');
                        sender.save(function(err){
                            if (err) {
                                callback(err);
                                return;
                            }
                            receiver.save(function(err) {
                                if (err) {
                                    callback(err);
                                    return;
                                }
                                dialogue.users.push(sender._id);
                                dialogue.users.push(receiver._id);
                                socket.request.dialogue = dialogue._id.toString();
                                socket.join(socket.request.dialogue);
                                callback(null, dialogue);
                            });
                        });
                    } else {
                        Dialogue.findById(dialogueId, callback);
                    }
                },
                function(dialogue, callback) {
                    dialogue.messages.push({
                        author: socket.request.session.user,
                        message: data.message,
                        meta: [{
                            status: "unreaded",
                            date: new Date()
                        }]
                    });
                    dialogue.save(function(err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(null, dialogue);
                    });
                }
            ], function(err, result) {
                if (err) {
                    return that.emit("error", socket, err.message);
                }
                var message = result.messages[result.messages.length - 1];
                that.to(socket.request.dialogue, "incomingMessage", {
                    message: message.message,
                    date: message.date,
                    user: {
                        id: snd._id,
                        name: snd.username
                    },
                    type: "message",
                    id: message._id,
                    state: message.meta[message.meta.length - 1].status,
                    dialogue: result._id
                });
            });
        });
        that.on("leaveDialogue", function(socket, data){
            if (socket.request.dialogue) {
                socket.leave(socket.request.dialogue);
                socket.request.dialogue = undefined;
            }
        });

        that.on("dialoguesRequest", function(socket, data) {
            User.findById(socket.request.session.user, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var answer = [];
                for (var key in user.data.dialogues) {
                    if (user.data.dialogues.hasOwnProperty(key) && key !== "test") {
                        answer.push({
                            id:key,
                            _id:user.data.dialogues[key]
                        });
                    }
                }
                async.map(answer, function(obj, callback){
                    User.findById(obj.id, function(err, user) {
                        if (err) return callback(err);
                        obj.username = user.username;
                        Dialogue.findById(user.data.dialogues[socket.request.session.user], function(err, dialogue){
                            obj.lastMessage = dialogue.messages[dialogue.messages.length-1];
                            callback(null, obj);
                        });
                    });

                }, function(err, answer) {
                    if (err) {
                        that.emit("error", socket, err.message);
                    }
                    answer.sort(function(a,b) {
                        if (a.lastMessage.date < b.lastMessage.date) {
                            return 1;
                        }
                        if (a.lastMessage.date > b.lastMessage.date) {
                            return -1;
                        }
                        return 0;
                    });
                    that.emit("dialoguesResponse", socket, answer);
                });

            });
        });

        that.on("requestWidgets", function(socket, data) {
            User.findById(data, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                if (!user) {
                    return that.emit('error', socket, "Запрашиваемый пользователь в базе не найден");
                }
                var answer = [];
                for (var i = 0; i < user.widgetSettings.length; ++i) {
                    if (!user.widgetSettings[i].options.public) {
                        if (socket.request.session.user == data) {
                            answer.push(user.widgetSettings[i]);
                        }
                    } else {
                        answer.push(user.widgetSettings[i]);
                    }
                }
                that.emit("responseWidgets", socket, answer);
            });
        });

        that.on("readMessage", function(socket, data) {
            Dialogue.findById(data.dialogue, function(err, dialogue) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var message = dialogue.messages.id(data.id);
                message.meta.push({
                    status: "normal",
                    date: new Date()
                });
                dialogue.save(function(err) {
                    if (err) {
                        return that.emit('error', socket, err.message);
                    }

                    that.to(dialogue._id.toString(), "readMessage", data.id);
                });
            });
        });
        that.on("requestDialoguesShort", function(socket, data) {
            User.findById(data, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                var answer = {};
                var array = [];
                if (user._id == socket.request.session.user) {
                    answer.owner = true;
                    answer.dialogues = array;
                    that.emit("responseDialoguesShort", socket, answer);
                } else {
                    answer.owner = false;
                    answer.messages = array;
                    var id = user.data.dialogues[socket.request.session.user];
                    if (id) {
                        Dialogue.findById(id, function(err, dialogue) {
                            if (err) {
                                return that.emit('error', socket, err.message);
                            }
                            var limit = 0;
                            for (var i=dialogue.messages.length - 1; i>=0; --i) {
                                array.push({
                                    message: dialogue.messages[i].message,
                                    date: dialogue.messages[i].date,
                                    user: {
                                        id: dialogue.messages[i].author,
                                        name: dialogue.messages[i].author.toString() == user._id.toString() ? user.username : socket.request.user.get('username')
                                    },
                                    type: "message",
                                    id: dialogue.messages[i]._id,
                                    state: dialogue.messages[i].meta[dialogue.messages[i].meta.length - 1].status,
                                    notHandled: true
                                });
                                if (++limit >= 5) {
                                    break;
                                }
                            }
                            that.emit("responseDialoguesShort", socket, answer);
                        });
                    } else {
                        that.emit("responseDialoguesShort", socket, answer);
                    }
                }
            });
        });
    }
});

module.exports = UserRoute;

