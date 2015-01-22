/**
 * Created by betrayer on 02.10.14.
 */
"use strict";
(function mainjs() {
    var defineArray = ["/vendor/bower_components/jquery/dist/jquery.js"];

    requirejs.config({
        "seed": 1,
        "min": false,
        "baseUrl": "/",
        "waitSeconds": 86400000,
        "shim": {
            "/vendor/bower_components/bootstrap/dist/js/bootstrap": "/vendor/bower_components/jquery/dist/jquery"
        }
    });

    require(defineArray, function main_preloader_module() {
        var m = window.m = {
            $core: "/javascripts/core/core.js",
            $class: "/javascripts/core/class.js",
            $widget: "/javascripts/widget/widget.js",
            "widget": {
                "$info": "/javascripts/widget/info.js",
                "$blog": "/javascripts/widget/blog.js",
                "$photo": "/javascripts/widget/photo.js",
                "$messages": "/javascripts/widget/messages.js",
                "$file": "/javascripts/widget/file.js"
            },
            $asyncExplorer : "/javascripts/core/asyncExplorer.js",
            $connection: "/javascripts/core/connection.js",
            $pageCollection: "/javascripts/core/pageCollection.js",
            framawork: {
                $socketio: "/vendor/bower_components/socket.io-client/socket.io.js",
                $jquery: "/vendor/bower_components/jquery/dist/jquery.js",
                $bootstrap: "/vendor/bower_components/bootstrap/dist/js/bootstrap.js",
                $jqueryUi: "/vendor/bower_components/jquery-ui/jquery-ui.js"
            },
            $page: "/javascripts/pages/page.js",
            page: {
                $registration: "/javascripts/pages/registration.js",
                $user: "/javascripts/pages/user.js",
                $login: "/javascripts/pages/login.js",
                $users: "/javascripts/pages/users.js"
            },
            ui:{
                $fileinput: "/javascripts/ui/fileinput.js",
                $grid: "/javascripts/ui/grid.js"
            },
            $content: "/javascripts/content/content.js",
            $blog: "/javascripts/content/blog.js",
            $message: "/javascripts/message/message.js",
            $dialogue: "/javascripts/message/dialogue.js",
            message: {
                $comment: "/javascripts/message/comment.js"
            },
            $tool: "/javascripts/tool/tool.js",
            $toolLauncher: "/javascripts/tool/toolLauncher.js",
            tool: {
                $visitors: "/javascripts/tool/visitors.js",
                $chat: "/javascripts/tool/chat.js"
            }

        };
        var defineArray = [];
        defineArray.push(m.framawork.$jquery);
        defineArray.push(m.$core);
        defineArray.push(m.framawork.$socketio);
        defineArray.push(m.framawork.$bootstrap);
        defineArray.push(m.framawork.$jqueryUi);

        require(defineArray, function main_module() {
            var Core = require(m.$core);

            window.core = new Core();
            core.explorer.openPage(window.location);
        });
    });
})();