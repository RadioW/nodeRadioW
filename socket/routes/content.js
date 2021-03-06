/**
 * Created by betrayer on 08.10.14.
 */
"use strict";

var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var User = require('../../models/user').User;
var tools = require('../../libs/tools');
var ObjectID = require('mongodb').ObjectID;
var extend = require('extend');
var fs = require('fs');

var ContentRoute = Route_io.inherit({
    "className": "ContentRoute_io",
    "constructor": function(io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "content"
        });

        that.on('subscribe', function (socket, data) {
            tools.checkObjectID(data.userId, function (err) {
                if (err) return that.emit('error', socket, err.message);
                tools.checkObjectID(data.contentId, function (err) {
                    if (err) return that.emit('error', socket, err.message);

                    if (socket.request.subscription) {
                        socket.leave(socket.request.subscription);
                    }

                    socket.join(data.useruId + "/" + data.contentType + "/" + data.contentId);
                    socket.request.subscription = data.useruId + "/" + data.contentType + "/" + data.contentId;

                    User.findById(data.userId, function (err, user) {
                        if (err) return that.emit('error', socket, err.message);
                        var content = user.data[data.contentType].id(data.contentId);
                        if (!content) {
                            return that.emit('error', socket, "Content not found!");
                        }
                        User.populate(content.comments, {path: 'author'}, function (err, comments) {
                            var tag = "";
                            var description = "";
                            switch (data.contentType) {
                                case "photo":
                                    tag = '<img src="' + content.link + '.jpg" class="fullSizeImg" id="fullSizeImg"></img>';
                                    description = content.message;
                                    break;
                                case "blog":
                                    tag = '<p class="contentText">' + content.message + '</p>';
                            }
                            var next, prev;
                            var index = user.data[data.contentType].indexOf(content);
                            if (user.data[data.contentType][index + 1]) {
                                next = {
                                    type: data.contentType,
                                    id: user.data[data.contentType][index + 1]._id
                                }
                            }
                            if (user.data[data.contentType][index - 1]) {
                                prev = {
                                    type: data.contentType,
                                    id: user.data[data.contentType][index - 1]._id
                                }
                            }
                            var ansComments = [];
                            for (var i = 0; i < comments.length; i++) {
                                var comment = comments[i];
                                if (comment.meta[comment.meta.length - 1].status == "removed" && comment.author._id != socket.request.session.user)
                                    continue;
                                ansComments.push({
                                    message: comment.message,
                                    date: comment.date,
                                    user: {
                                        id: comment.author._id,
                                        name: comment.author.username
                                    },
                                    type: data.contentType,
                                    contentId: content._id,
                                    id: comment._id,
                                    index: i,
                                    state: comment.meta[comment.meta.length - 1].status
                                });
                            }
                            var answer = {
                                user: {
                                    id: data.userId
                                },
                                content: {
                                    tag: tag,
                                    date: content.date,
                                    description: description,
                                    type: data.contentType,
                                    id: data.contentId,
                                    isAvatar: content.id == user.info.avatar, // todo check that
                                    next: next,
                                    prev: prev
                                },
                                comments: ansComments
                            };
                            that.emit("subscription", socket, answer);
                        });
                    });
                })
            });
        });

        that.on('unsubscribe', function (socket) {
            if (socket.request.subscription) {
                socket.leave(socket.request.subscription);
                socket.request.subscription = null;
            }
        });

        that.on('comment', function (socket, data) {
            if (!socket.request.session.user) return that.emit('error', socket, 'Мне очень жаль, но комментарии могут оставлять только авторизованные пользователи');
            User.findById(socket.request.watch, function (err, user) { //todo potiential error!
                if (err)
                    return that.emit('error', socket, err.message);
                var message = data.message.replace(/\n/g, "<br/>");
                if (!user.data[data.type])
                    return that.emit('error', socket, 'Wrong data type!');
                if (!user.data[data.type].id(data.id))
                    return that.emit('error', socket, 'Can\'t find what to comment!');
                var oid = new ObjectID();
                user.data[data.type].id(data.id).comments.push({
                    link: socket.request.watch + '/' + data.type + '/' +data.id,
                    author: socket.request.session.user,
                    date: Date.now(),
                    message: message,
                    _id: oid,
                    meta: [
                        {
                            status: "normal",
                            date: Date.now()
                        }
                    ]
                });
                user.save(function (err) {
                    if (err)
                        return that.emit('error', socket, err.message);
                    User.findById(socket.request.session.user, function (err, commentator) {
                        if (err)
                            return that.emit('error', socket, 'Вы не авторизованы!');
                        commentator.data.comments.push({
                            link: socket.request.watch + '/' + data.type + '/' +data.id,
                            author: socket.request.session.user,
                            date: Date.now(),
                            message: message,
                            _id: oid,
                            meta: [
                                {
                                    status: "normal",
                                    date: Date.now()
                                }
                            ]
                        });
                        commentator.save(function (err) {
                            if (err)
                                return that.emit('error', socket, err.message);
                            that.to(socket.request.subscription, 'new comment', {
                                message: message,
                                date: Date.now(),
                                user: {
                                    id: commentator._id,
                                    name: commentator.username
                                },
                                type: data.type,
                                contentId: data.id,
                                id: oid,
                                index: user.data[data.type].id(data.id).comments.length - 1,
                                state: "normal"
                            });
                        });
                    });
                });
            });
        });

        that.on('comment remark', function (socket, data) {
            if (!socket.request.session.user)
                return that.emit('error', socket, 'Мне очень жаль, но комментарии могут редактировать только авторизованные пользователи');
            User.findById(socket.request.watch, function (err, user) {
                if (err)
                    return that.emit('error', socket, err.message);
                var message = data.message.replace(/\n/g, "<br/>");
                if (!user.data[data.type])
                    return that.emit('error', socket, 'Wrong data type!');
                if (!user.data[data.type].id(data.id))
                    return that.emit('error', socket, 'Can\'t find what to comment!');
                var content = user.data[data.type].id(data.id);
                var comment;
                for (var i = 0; i < content.comments.length; i++) {
                    if (content.comments[i]._id == data.oid) {
                        comment = content.comments[i];
                        break;
                    }
                }
                if (!comment)
                    return that.emit('error', socket, 'There is no such comment!');
                if (comment.author != socket.request.session.user)
                    return that.emit('error', socket, 'You\'ve got no permitions for that!');
                comment.message = message;
                comment.date = Date.now();
                comment.meta.push({
                    status: "remarked",
                    date: Date.now()
                });
                user.data[data.type].id(data.id).markModified('comments');
                user.save(function (err) {
                    if (err)
                        return that.emit('error', socket, err.message);
                    that.to(socket.request.subscription, 'remark comment', {
                        message: message,
                        date: Date.now(),
                        type: data.type,
                        contentId: data.id,
                        id: comment._id
                    });
                });
            });
        });

        that.on('comment remove', function (socket, data) {
            if (!socket.request.session.user)
                return that.emit('error', socket, 'Мне очень жаль, но комментарии могут удалять только авторизованные пользователи');
            User.findById(socket.request.watch, function (err, user) {
                if (err)
                    return that.emit('error', socket, err.message);
                var lData = user.data[data.type];
                if (!lData)
                    return that.emit('error', socket, 'Wrong data type!');
                var content = lData.id(data.id);
                if (!content)
                    return that.emit('error', socket, 'Can\'t find what to comment!');
                var comment;
                for (var i = 0; i < content.comments.length; i++) {
                    if (content.comments[i]._id == data.oid) {
                        comment = content.comments[i];
                        break;
                    }
                }
                if (!comment)
                    return that.emit('error', socket, 'There is no such comment!');
                comment.message = "";
                comment.data = Date.now();
                comment.meta.push({
                    status: "removed",
                    date: Date.now()
                });

                content.markModified('comments');
                user.save(function (err) {
                    if (err)
                        return that.emit('error', socket, err.message);
                    that.to(socket.request.subscription, 'remove comment', comment._id);
                });
            });
        });

        that.on("contentRemove", function(socket, data) {
            User.findById(data.uid, function(err, user) {
                if (err) {
                    return that.emit('error', socket, err.message);
                }
                if (user._id != socket.request.session.user) {
                    return that.emit('error', socket, "You have no permission to remove that content");
                }
                var content = user.data[data.type].id(data.oid);
                if (!content) {
                    return that.emit('error', socket, "There is no such content");
                }
                user.data[data.type].splice(user.data[data.type].indexOf(content), 1);
                user.save(function(err) {
                    if (err) {
                        return that.emit('error', socket, "Unable to save element in database");
                    }
                    that.to(socket.request.subscription, "contentRemoved", content._id);
                    switch (data.type) {
                        case "photo":
                            fs.unlink('./public' + content.link + '.jpg', function (err) {
                                if (err) {
                                    return that.emit('error', socket, err.message);
                                }
                                fs.unlink('./public' + content.link + 'prev.jpg', function (err) {
                                    if (err) {
                                        return that.emit('error', socket, err.message);
                                    }
                                    that.io.of('/main').to(socket.request.watch).emit('event', {
                                        route: "user",
                                        event: "removed photo",
                                        data: content._id
                                    });
                                });
                            });
                            break;
                        case "blog":
                            that.io.of('/main').to(socket.request.watch).emit('event', {
                                route: "user",
                                event: "removed blog",
                                data: content._id
                            });
                            break;
                        case "file":
                            fs.unlink('./public' + content.link, function (err) {
                                if (err) {
                                    return that.emit('error', socket, err.message);
                                }
                                that.io.of('/main').to(socket.request.watch).emit('event', {
                                    route: "user",
                                    event: "remove file",
                                    data: content._id
                                });
                            });
                            break;
                    }
                });
            });
        });
    }
});

module.exports = ContentRoute;