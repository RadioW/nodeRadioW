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
                that.commentCount = 0;
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
                that.commentsWrapper = $('<span>').css("margin-left", "5px");

                wrapper.append($("<div>").append($('<i class="glyphicon glyphicon-comment">')).append(that.commentsWrapper).css({
                    "position": "absolute",
                    "bottom": 0,
                    "right": 0
                }));
                wrapper.on('click', function() {
                    core.content.subscribe(that.userId, "blog", that.id);
                });
            },
            "set": function(params) {
                var that = this;
                that.id = params._id || that.id;
                that.message = params.message || that.message;
                that.author = {
                    username: params.author.username || that.author.username,
                    id: params.author._id || that.author.id
                };
                that.date = params.date || that.date;
                that.commentCount = params.comments || that.commentCount;
                that.refresh();
            },
            "refresh": function() {
                var that = this;

                that.wrapper.attr('id', that.id);
                that.messageWrapper.html(that.message);
                that.authorityWrapper.html(that.author.username +' '+datify(that.date));
                that.commentsWrapper.html(that.commentCount);
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();