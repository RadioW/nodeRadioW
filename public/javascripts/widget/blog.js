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

    define(moduleName, defineArray, function blog_module() {
        var Widget = require(m.$widget);
        var CBlog = require(m.$blog);

        var Blog = Widget.inherit({
            "className": "Blog",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "name": "Блог",
                    "path": "blog",
                    "userId": "" //REQUIRED IN PARAMS!
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
                var blogs = $('p.blog-little', that.container[0]);
                blogs.first().before($('<p class="bg-info blog-little">').html(data.message));
                if (blogs.length == 5) {
                    blogs.last().remove();
                }
            },
            "initContent": function() {
                var that = this;

                Widget.fn.initContent.call(that);
                that.emit('requestBlogShort', that.options.userId);
            },
            "initSockets": function() {
                var that = this;

                that.on('responseBlogListShort', function(data) {
                    $('p.blog-little', that.container[0]).remove();
                    for (var i=0; i<data.length; i++) {
                        that.container.append($('<p class="bg-info blog-little">').html(data[i]));
                    }
                }, true);

                that.on('newBlog', function(data) {
                    that.appendLittleBlog(data);
                    if (that.fullSized) {
                        that.blogs[data._id] = new CBlog(data);
                        that.blogRoll.prepend(that.blogs[data._id].wrapper);
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
                        $('#'+data, that.expanded[0]).remove();
                    }
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "getExpandedContent":function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);
                var roll = that.blogRoll = $('<div class="col-xs-12" style="overflow-y:auto; float:right;" id="blogRoll">');
                container.append($('<div class="row">').append(roll));

                that.initAdditionalSockets();
                that.emit('requestBlogFull', that.options.userId);

                if (that.options.userId == core.user.id) {
                    var buttonEdit = $('<button class="btn btn-primary">').append($('<i class="glyphicon glyphicon-pencil">')).css({
                        position: "absolute",
                        top: 0,
                        right: 0
                    });
                    container.append(buttonEdit);
                    buttonEdit.on("click", function() {
                        that.writerMode();
                    });
                }

                setTimeout(function() {
                    container.css("opacity", 1);
                    that.blogRoll.height(that.expanded.height() - that.expandedHeader.height() - parseInt(that.expandedHeader.css('margin-bottom')));
                }, 500);
            },
            "initAdditionalSockets": function() {
                var that = this;

                that.on('responseBlogListFull', function(data) {
                    for (var i=0; i<data.length; i++) {
                        that.blogs[data[i]._id] = new CBlog(data[i]);
                        that.blogRoll.append(that.blogs[data[i]._id].wrapper);
                    }
                });
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);
                if (that.writerModeOn) {
                    that.writerMode();
                }

                for (var key in that.blogs) {
                    if (that.blogs.hasOwnProperty(key)) {
                        that.blogs[key].destructor();
                    }
                }
                that.blogs = {};
            },
            "writerMode": function() {
                var that = this;

                if (that.writerModeOn) {
                    that.expanded.css("height", "100%");
                    setTimeout(function() {
                        that.editor.css("display", "none");
                        that.writerModeOn = false;
                        if (that.editingBlog) {
                            that.textarea.val("");
                            that.editingBlog = undefined;
                        }
                    }, 500);
                } else {
                    var editor = that.editor;
                    if (!editor) {
                        editor = that.editor = $('<div class="container-fluid">');
                        editor.css({
                            "position": "relative",
                            "height": "100%",
                            "display": "none",
                            "background-color": "white"
                        });
                        that.border.append(editor);
                        editor.append($('<p class="text-center lead">').html('Новый блог'));
                        var area = that.textarea = $('<textarea class="form-control blogArea" name="message">');
                        editor.append(area.height(that.expanded.height() - that.expandedHeader.height() - parseFloat(that.expandedHeader.css("margin-bottom")) - 8));
                        var closeButton = $('<button class="btn btn-primary">').append($('<i class="glyphicon glyphicon-pencil">')).css({
                            position: "absolute",
                            top: 0,
                            right: 0
                        }).on("click", function() {
                            that.writerMode();
                        });
                        var submitButton = $('<button class="btn btn-primary">').append($('<i class="glyphicon glyphicon-ok">')).css({
                            position: "absolute",
                            top: 0,
                            right: "45px"
                        }).on("click", function() {
                            var msg = area.val();
                            if (msg.replace(/\s/g, "").length) {
                                that.emit('blog', {
                                    message: msg,
                                    editing: that.editingBlog
                                });
                                area.val("");
                                that.writerMode();
                            }
                        });
                        editor.append(closeButton);
                        editor.append(submitButton);
                    }
                    that.writerModeOn = true;
                    editor.css({
                        "display": "block"
                    });
                    that.expanded.css("height", 0);
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();

