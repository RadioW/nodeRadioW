/**
 * Created by betrayer on 08.10.14.
 */
"use strict";
(function usersjs() {
    var moduleName = m.page.$users;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);

    define(moduleName, defineArray, function users_module() {
        var Page = require(m.$page);

        var Users = Page.inherit({
            "className": "Users",
            "websocket": false,
            "name": "Радиослушатели",
            "constructor": function(params) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "users"
                });
            }
        });
        $.extend(Users, {
            "title": "users"
        });

        requirejs._moduleExecute(moduleName);
        return Users
    });
})();