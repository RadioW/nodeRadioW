/**
 * Created by betrayer on 19.01.15.
 */
"use strict";
(function filesjs() {
    var moduleName = m.widget.$files;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.$fileinput);

    define(moduleName, defineArray, function files_module() {
        var Widget = require(m.$widget);
        var Fileinput = require(m.$fileinput);

        var Files = Widget.inherit({
            "className": "Files",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "name": "Хранилище",
                    "path": "files",
                    "userId": "" //REQUIRED IN PARAMS!
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;

                Widget.fn.constructor.call(that, baseOptions);
            },
            "getExpandedContent":function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);

                setTimeout(function() {
                    container.css("opacity", 1);
                }, 500);
            }
        });

        requirejs._moduleExecute(moduleName);
        return Files;
    });
})();