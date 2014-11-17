/**
 * Created by betrayer on 08.10.14.
 */
"use strict";

var log = require('../../libs/logs')(module);
var Route_io = require('../../libs/class/ioRoute');
var User = require('../../models/user').User;
var extend = require('extend');
var fs = require('fs');

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
    }
});

module.exports = UserRoute;