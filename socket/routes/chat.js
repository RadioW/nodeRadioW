/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var ChatBase = require('../../models/chat').Chat;
var ObjectID = require('mongodb').ObjectID;

var Chat = Route_io.inherit({
    "className": "ChatRoute_io",
    "constructor": function (io) {
        var that = this;

        Route_io.fn.constructor.call(that, {
            io: io,
            route: "chat"
        });

        ChatBase.find({name: "globalChat"},function(err, chat) {
            if (err) return log.error("Fatal error on chat socket.io route!\n"+err.message);
            that.chat = chat[0];
            if (!that.chat) {
                log.info('Created new global chat');
                that.chat = new ChatBase({name: "globalChat"});
            }
            that.chat.lastModified = new Date();
            that.chat.save(function(err){
                if (err) return log.error("Fatal error on chat socket.io route!\n"+err.message);

                that.on('connection', function(socket, data) {
                    var handshake = socket.request;
                    var username  = handshake.user.get('username');
                    if (that.countWindows(handshake.session.id) == 1) {
                        that.cast('join', username);
                        that.userNames(function (users) {
                            that.to('authorizedUsers', 'info:chat', users, 'main');
                        });
                    }
                });

                that.on('disconnect', function(socket, data) {
                    var handshake = socket.request;
                    var username  = handshake.user.get('username');
                    if (!handshake.session || (that.countWindows(handshake.session.id) == 0)) {
                        that.cast('left', username);
                        that.userNames(function (users) {
                            that.to('authorizedUsers', 'info:chat', users, 'main');
                        });
                    }
                });

                that.on('message', function(socket, data) {
                    var handshake = socket.request;
                    var username  = handshake.user.get('username');
                    that.chat.messages.push({
                        date: new Date(),
                        author: new ObjectID(handshake.session.user),
                        message: data
                    });
                    that.chat.save(function(err){
                        if (err) return log.error("Fatal error on chat socket.io route!\n"+err.message);
                    });
                    that.cast('message', {
                        message: data,
                        user: username
                    });
                });

                that.on('requestInfo', function(socket) {
                    that.userNames(function (users) {
                        socket.emit('event', {
                            route: 'main',
                            event: 'info:chat',
                            data: users
                        });
                    });
                });

                that.on('requestMessages', function(socket, data) {
                    ChatBase.populate(that.chat, {path: 'messages.author'}, function(err, chat) {
                        if (err) return log.error(err.message);
                        var messages = chat.messages;
                        var limit = 20;
                        var answer = [];
                        for (var i = messages.length - data - 1; i>=0; --i) {
                            answer.push({
                                message: messages[i].message,
                                user: messages[i].author.username
                            });
                            if (--limit == 0) {
                                break;
                            }
                        }
                        that.emit('responseMessages', socket, answer);
                    });
                });
            });
        });
    }
});


module.exports = Chat;
