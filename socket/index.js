"use strict";
var log = require ('../libs/logs')(module);
var async = require('async');
var config = require('../config');
var users = require('./libs/usersCount').users;
var windows = require('./libs/usersCount').windows;
var User = require('../models/user').User;
var ObjectID = require('mongodb').ObjectID;
var tools = require('../libs/tools');

module.exports = function (server) {

	
	
	var io = require('socket.io')(server, {'origins': '*:*'});
	log.info('socket.io server is running');
	
	io.use(require('./middleware/authorize'));


	var chat = io
	.of('/chat')
	.on('connection', function (socket) {
		var handshake = socket.request;
		var username  = handshake.user.get('username');
		
		if (windows(io, '/chat', handshake.session.id) == 1) socket.broadcast.emit('join', username);
		
		socket.emit('my name', username);

		socket.on('message', function (text) {
			socket.broadcast.emit('message', username, text);
			socket.emit('message', username, text);
		});
		
		socket.on('disconnect', function () {
			if (windows(io, '/chat', handshake.session.id) == 0) socket.broadcast.emit('leave', username);
		});
	});
	
	var main = io
		.of('/main')
		.on('connection', function(socket) {
		
			socket.broadcast.emit('info', users(io));
			socket.emit('info', users(io));
			
			socket.on('disconnect', function () {
				socket.broadcast.emit('info', users(io));
			});
		});


	var registration = io
		.of('/registration')
		.on('connection', function(socket) {
			socket.on('check', function(username) {
				User.findOne({'username':username}, function(err, user) {
					if (err) return socket.emit('error_', err.message);
					if (user) return socket.emit('buzy');
					if (!user) return socket.emit('free');
				});
			});
		});
	

	var user = io
		.of('/user')
		.on('connection', function(socket) {
			socket.on('check', function(username) {
				User.findOne({'username':username}, function(err, user) {
					if (err) return socket.emit('error_', err.message);
					if (user) return socket.emit('buzy');
					if (!user) return socket.emit('free');
				});
			});
			
			socket.on('join', function(username) {
				socket.join(username);
				socket.request.watch = username;
			});

            socket.on('subscribe', function(uId, type, dId){
                tools.checkObjectID(uId, function(err) {
                    if (err) socket.emit('error_', err.message);
                    tools.checkObjectID(dId, function(err) {
                        if (err) socket.emit('error_', err.message);

                        if (socket.request.subscription) {
                            socket.leave(socket.request.subscription);
                        }

                        socket.join(uId+"/"+type+"/"+dId);
                        socket.request.subscription = uId+"/"+type+"/"+dId;

                        User.findById(uId, function(err, user) {
                            if (err) return socket.emit('error_', err.message);
                            var content = user.data[type].id(dId);
                            User.populate(content.comments, {path: 'author'}, function(err, comments) {
                                var tag = "";
                                var description = "";
                                switch (type) {
                                    case "photo":
                                        tag = '<img src="' + content.link + '.jpg" class="fullSizeImg" id="fullSizeImg"></img>';
                                        description = content.message;
                                        break;
                                    case "blog":
                                        tag = '<p>'+content.message+'</p>';
                                }
                                var next, prev;
                                var index = user.data[type].indexOf(content);
                                if (user.data[type][index + 1]) {
                                    next = {
                                        type: type,
                                        id: user.data[type][index + 1]._id
                                    }
                                }
                                if (user.data[type][index - 1]) {
                                    prev = {
                                        type: type,
                                        id: user.data[type][index - 1]._id
                                    }
                                }
                                var ansComments = [];
                                for (var i=0;i<comments.length;i++) {
                                    var comment = comments[i];
                                    if (comment.meta[comment.meta.length-1].status == "removed" && comment.author._id != socket.request.session.user)
                                        continue;
                                    ansComments.push({
                                        message: comment.message,
                                        date: comment.date,
                                        commentator: {
                                            id: comment.author._id,
                                            name: comment.author.username
                                        },
                                        type: type,
                                        id: content._id,
                                        commentID: comment._id,
                                        index: i,
                                        status: comment.meta[comment.meta.length-1].status
                                    });
                                }
                                var answer = {
                                    user: {
                                        id: uId
                                    },
                                    content: {
                                        tag: tag,
                                        date: content.date,
                                        description: description,
                                        type: type,
                                        id: dId,
                                        isAvatar: content.id == user.info.avatar,
                                        next: next,
                                        prev: prev
                                    },
                                    comments: ansComments
                                };
                                socket.emit("subscription", answer);
                            });
                        });
                    })
                });
            });
            socket.on('unsubscribe', function() {
                if (socket.request.subscription) {
                    socket.leave(socket.request.subscription);
                    socket.request.subscription = null;
                }
            });

			socket.on('blog', function(message) {
				User.findById(socket.request.session.user, function(err, user) {
					if (err) return socket.emit ('error_', err.message);
					message = message.replace(/\n/g, "<br/>");
					user.data.blog.push({link:'none', message: message});
					user.save(function(err) {
						if (err) return socket.emit ('error_', err.message);
						io.of('/user').to(socket.request.watch).emit('newBlog', message, Date.now(), user.username);
					});
				});
			});
			
			socket.on('comment', function(message, type, id) {
				if (!socket.request.session.user) return socket.emit('error_', 'Мне очень жаль, но комментарии могут оставлять только авторизованные пользователи');
				User.findById(socket.request.watch, function(err, user) {
					if (err) return socket.emit('error_', err.message);
					message = message.replace(/\n/g, "<br/>");
					if (!user.data[type]) return socket.emit('error_', 'Wrong data type!');
					if (!user.data[type].id(id)) return socket.emit('error_', 'Can\'t find what to comment!');
					var oid = new ObjectID();
					user.data[type].id(id).comments.push({
														link:socket.request.watch+'/'+type+'/'+id,
														author:socket.request.session.user, 
														date:Date.now(), 
														message:message,
														_id: oid,
                                                        meta: [{
                                                            status: "normal",
                                                            date: Date.now()
                                                        }]
					});
					user.save(function(err) {
						if (err) return socket.emit('error', err.message);
						User.findById(socket.request.session.user, function(err, commentator) {
							if (err) return socket.emit('error_', 'Вы не авторизованы!');
							commentator.data.comments.push({
														link:socket.request.watch+'/'+type+'/'+id, 
														author:socket.request.session.user, 
														date:Date.now(), 
														message:message,
														_id: oid,
                                                        meta: [{
                                                            status: "normal",
                                                            date: Date.now()
                                                        }]
							});
							commentator.save(function(err) {
								if (err) return socket.emit('error', err.message);
								io.of('/user').to(socket.request.subscription).emit('new comment', {
																							message:message,
																							date:Date.now(),
																							commentator: {
																								id:commentator._id,
																								name:commentator.username
																							},
																							type:type,
																							id:id,
																							commentID:oid, 
																							index:user.data[type].id(id).comments.length-1,
                                                                                            status: "normal"
								});
							});
						});
					});
				});
			});
			
			socket.on('comment remark', function(message, type, id, index){
				if (!socket.request.session.user) return socket.emit('error_', 'Мне очень жаль, но комментарии могут редактировать только авторизованные пользователи');
				User.findById(socket.request.watch, function(err, user){
					if (err) return socket.emit('error_', err.message);
					message = message.replace(/\n/g, "<br/>");
					if (!user.data[type]) return socket.emit('error_', 'Wrong data type!');
					if (!user.data[type].id(id)) return socket.emit('error_', 'Can\'t find what to comment!');
					if (!user.data[type].id(id).comments[index]) return socket.emit('error_', 'There is no such comment!');
					if (user.data[type].id(id).comments[index].author != socket.request.session.user) return socket.emit('error_', 'You\'ve got no permitions for that!');
					user.data[type].id(id).comments[index].message = message;
					user.data[type].id(id).comments[index].date = Date.now();
					user.data[type].id(id).comments[index].meta.push({
                        status: "remarked",
                        date: Date.now()
                    });
					user.data[type].id(id).markModified('comments');
					user.save(function(err) {
						if (err) return socket.emit('error', err.message);
						io.of('/user').to(socket.request.subscription).emit('remark comment', {
																					message:message,
																					date:Date.now(),
																					type:type,
																					id:id,
																					commentID:user.data[type].id(id).comments[index]._id
						});
					});
				});
			});

            socket.on('comment remove', function(type, id, oid) {
                if (!socket.request.session.user) return socket.emit('error_', 'Мне очень жаль, но комментарии могут удалять только авторизованные пользователи');
                User.findById(socket.request.watch, function(err, user) {
                    if (err) return socket.emit('error_', err.message);
                    var data = user.data[type];
                    if (!data) return socket.emit('error_', 'Wrong data type!');
                    var content = data.id(id);
                    if (!content) return socket.emit('error_', 'Can\'t find what to comment!');
                    var comment;
                    for (var i=0; i<content.comments.length; i++) {
                        if (content.comments[i]._id == oid) {
                            comment = content.comments[i];
                            break;
                        }
                    }
                    if (!comment) return socket.emit('error_', 'There is no such comment!');
                    comment.message = "";
                    comment.data = Date.now();
                    comment.meta.push({
                        status: "removed",
                        date: Date.now()
                    });

                    content.markModified('comments');
                    user.save(function(err) {
                        if (err) return socket.emit('error', err.message);
                        io.of('/user').to(socket.request.subscription).emit('remove comment', comment._id);
                    });
                });
            });

            socket.emit('ready');
		});



	return io;
}
