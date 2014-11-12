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
            "className": "ContentBlog",
            "constructor": function (params) {
                var that = this;

                Class.call(that);

                that.userId = core.activePage.userId;
                that.initWrapper();
                that.set(params)
            },
            "destructor": function() {
                var that = this;
                that.wrapper.off("click");
                that.wrapper.remove();
                delete that.userId;
                that.author = null;
                Class.fn.destructor.call(that);
            },
            "initWrapper": function() {
                var that = this;

                var wrapper = that.wrapper = $('<div class="bg-info blog-full">');
                that.messageWrapper = $('<p>');
                wrapper.append(that.messageWrapper);
                that.authorityWrapper = $('<em>');
                wrapper.append(that.authorityWrapper);
                wrapper.on('click', function() {
                    core.activePage.subscribeContent(that.userId, "blog", that.id);
                });
            },
            "set": function(params) {
                var that = this;
                that.id = params._id;
                that.message = params.message;
                that.author = {
                    username: params.author.username,
                    id: params.author._id
                };
                that.date = params.date;
                that.refresh();
            },
            "refresh": function() {
                var that = this;

                that.wrapper.attr('id', that.id);
                that.messageWrapper.html(that.message);
                that.authorityWrapper.html(that.author.username +' '+datify(that.date));
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();