/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
var log = require('../../libs/logs')(module);

module.exports = function(socket, params) {
    var event = params.event;

    switch (event) {
        case "test":
            socket.emit("test", {ok:true});
            break;
        default:
            log.error("Can't find "+ event.toString() + "handler");
    }
};