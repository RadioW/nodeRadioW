/**
 * Created by betrayer on 22.10.14.
 */
"use strict";

(function blogjs() {
    var moduleName = m.widget.$blog;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.$blog);
    defineArray.push(m.ui.$button);

    define(moduleName, defineArray, function blog_module() {
        var Widget = require(m.$widget);
        var CBlog = require(m.$blog);
        var Button = require(m.ui.$button);

        var Blog = Widget.inherit({
            "className": "Blog",
            "constructor": function (params) {
                var that = this;
                var panes = {
                    mainExpanded: {
                        title: "Блог",
                        name: "mainExpanded",
                        type: "mainExpanded",
                        "staticScroll": true,
                        deactivate: function() {
                            that.standBy(this);
                        },
                        activate: function() {
                            that.initExpandedContent(this);
                            that.initAdditionalSockets(this);
                        }
                    }
                };
                if (params.userId == core.user.id) {

                    var newBlog = new Button({
                        name:"submit",
                        icon: "ok",
                        color: "success"
                    });
                    newBlog.on("click", function() {
                        var msg = that.textarea.val();
                        if (msg.replace(/\s/g, "").length) {
                            that.emit('blog', {
                                message: msg,
                                editing: that.editingBlog
                            });
                            that.textarea.val("");
                            that.switchMode();
                        }
                    });
                    panes.writerMode = {
                        title: "Новый блог",
                        type: "modeExpanded",
                        name: "writerMode",
                        icon: "pencil",
                        initialize: function() {
                            var area = that.textarea = $('<textarea class="form-control blogArea" name="message">');
                            this.content.append(area);
                        },
                        activate: function(options) {
                            if (options) {
                                that.editingBlog = options.id;
                                that.textarea.val(options.message);
                            }
                        },
                        deactivate: function() {
                            that.textarea.val("");
                            that.editingBlog = undefined;
                        },
                        controls: [newBlog]
                    }
                }
                var baseOptions = {
                    "name": "Блог",
                    "path": "blog",
                    "userId": "", //REQUIRED IN PARAMS!
                    "panes": panes
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;
                that.blogs = {};
                that.writerModeOn = false;

                Widget.fn.constructor.call(that, baseOptions);
                that.blogs = [];
            },
            "appendLittleBlog": function(data) {
                var that = this;
                var placeholder = $('.placeholder', that.container[0]);
                if (placeholder.length){
                    placeholder.remove();
                }
                var blogs = $('p.blog-little', that.container[0]);
                if (blogs.length) {
                    blogs.first().before($('<p class="bg-info blog-little">').html(data.message));
                } else {
                    that.container.append($('<p class="bg-info blog-little">').html(data.message));
                }
                if (blogs.length == 5) {
                    blogs.last().remove();
                }
            },
            "initContent": function(pane) {
                var that = this;

                Widget.fn.initContent.call(that);
                that.emit('requestBlogShort', that.options.userId);
            },
            "initSockets": function(pane) {
                var that = this;

                that.on('responseBlogListShort', function(data) {
                    pane.content.empty();
                    for (var i=0; i<data.length; i++) {
                        pane.content.append($('<p class="bg-info blog-little">').html(data[i]));
                    }
                    if (data.length == 0) {
                        pane.content.append($('<p class="placeholder">').html(that.options.userId == core.user.id ? "Вы пока не писали ничего в блог": "Пользователь еще не делал заметок в блог"))
                    }
                }, true);

                that.on('newBlog', function(data) {
                    that.appendLittleBlog(data);
                    if (that.fullSized) {
                        that.blogs[data._id] = new CBlog(data);
                        that.panes.mainExpanded.content.prepend(that.blogs[data._id].wrapper);
                    }
                }, true);

                that.on('remarkedBlog', function(data) {
                    that.emit('requestBlogShort', that.options.userId);
                    if (that.fullSized) {
                        that.blogs[data._id].set(data);
                    }

                }, true);

                that.on('removed blog', function(data) {
                    that.emit('requestBlogShort', that.options.userId);
                    if (that.fullSized) {
                        $('#'+data, pane.content[0]).remove();
                    }
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "initExpandedContent": function(container) {
                var that = this;
                that.emit('requestBlogFull', that.options.userId);
            },
            "initAdditionalSockets": function(pane) {
                var that = this;

                that.on('responseBlogListFull', function(data) {
                    for (var i=0; i<data.length; i++) {
                        that.blogs[data[i]._id] = new CBlog(data[i]);
                        pane.content.append(that.blogs[data[i]._id].wrapper);
                    }
                });
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);

                for (var key in that.blogs) {
                    if (that.blogs.hasOwnProperty(key)) {
                        that.blogs[key].destructor();
                    }
                }
                that.blogs = {};
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();

