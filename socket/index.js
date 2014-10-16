"use strict";
var log = require ('../libs/logs')(module);
var config = require('../config');
var users = require('./libs/usersCount').users;

var User = require('../models/user').User;
var Router = require('../libs/class/ioRouter');

module.exports = function (server) {
	
	var io = require('socket.io')(server, {'origins': '*:*'});
	log.info('socket.io server is running');
    var router = new Router(io);
	
	io.use(require('./middleware/authorize'));

	var main = io
		.of('/main')
		.on('connection', function(socket) {

            socket.emit('event', {
                route: "main",
                event: "connected",
                data: {
                    id: socket.request.session.user,
                    username: socket.request.user.get('username')
                }
            });
			socket.emit('event', {
                route: "main",
                event: "info",
                data: users(io)
            });
            socket.broadcast.emit('event', {
                route: "main",
                event: "info",
                data: users(io)
            });

            socket.on('event', function(params) {
                router.route(params, socket);
            });

            socket.on('disconnect', function () {
                router.disconnect(socket);
                socket.broadcast.emit('event', {
                    route: "main",
                    event: "info",
                    data: users(io)
                });
            });
		});
	return io;
};
