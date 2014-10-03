/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
var log = require('../../libs/logs')(module);
var chat = require('./chat');

module.exports = function(socket, params) {
    var route = params.route;

    switch (route) {
        case "chat":
            chat(socket, params);
            break;
        default:
            log.error("Can't find "+ route.toString() + "route");
    }
};