/**
 * Created by betrayer on 02.10.14.
 */
"use strict";
(function mainjs() {
    var defineArray = [];
    require(defineArray, function main_preloader_module() {
        var m = window.m = {
            $core: "/javascripts/core/core.js",
            $class: "/javascripts/core/class.js",
            $widget: "/javascripts/widget/widget.js",
            $asyncExplorer : "/javascripts/core/asyncExplorer.js",
            $connection: "/javascripts/core/connection.js",
            framawork: {
                $socketio: "/vendor/bower_components/socket.io-client/socket.io.js",
                $jquery: "/vendor/bower_components/jquery/dist/jquery.js",
                $bootstrap: "/vendor/bower_components/bootstrap/dist/js/bootstrap.js"
            }

        };
        var defineArray = [];
        defineArray.push(m.$core);
        defineArray.push(m.framawork.$socketio);
        defineArray.push(m.framawork.$jquery);
        defineArray.push(m.framawork.$bootstrap);

        require(defineArray, function main_module() {
            var Core = require(m.$core);
            window.core = new Core();
        });
    });
})();