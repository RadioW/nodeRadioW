/**
 * Created by betrayer on 22.10.14.
 */
"use strict";

(function blogjs() {
    var moduleName = m.$blog;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function blog_module() {
        var Class = require(m.$class);

        var Blog = Class.inherit({
            "className": "Blog",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {};
                $.extend(baseOptions, params);
                that.options = baseOptions;

                Class.call(that);

                that.initWrapper();
            },
            "initWrapper": function() {
                var that = this;

                that.wrapper = $('<p>')
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();