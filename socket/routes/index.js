/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
var log = require('../../libs/logs')(module);
var Chat = require('./chat');
/*var registration = require('./registration');
var user = require('./user');*/

module.exports = function(socket, params, io) {
    var route = params.route;
    var chat = new Chat(io);

    switch (route) {
        case "chat":
            chat.react(params, socket);
            break;
        /*case "registration":
            registration(socket, params, io);
            break;
        case "user":
            user(socket, params, io);
            break;*/
        default:
            log.error("Can't find route " + route);
    }
};