/**
 * Created by betrayer on 22.10.14.
 */
"use strict";

(function blogjs() {
    var moduleName = m.widget.$blog;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);

    define(moduleName, defineArray, function blog_module() {
        var Widget = require(m.$widget);

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

                Widget.fn.constructor.call(that, baseOptions);
                that.blogs = [];
                that.initSockets();
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
                    var message = data.message, date = data.date, user = data.author, id = data.id;

                    var blog = document.createElement('div');
                    blog.className = "blogPost";
                    blog.style.height = 0;
                    blog.innerHTML = "<div class='row'><div class='col-xs-12'><p>"+message+"</p></div></div>";
                    $('#miniBlogRoll').prepend(blog);
                    setTimeout(function() {blog.style.height = "";}, 50);

                    if ($('#blogRoll').get(0)) {
                        var bigBlog = document.createElement('div');
                        bigBlog.className = "blogPost";
                        bigBlog.style.height = 0;
                        bigBlog.onclick = function() {
                            core.activePage.subscribeContent(that.options.userId, that.options.path, id);
                        };
                        bigBlog.innerHTML = "<div class='row'><div class='col-xs-12'><p>"+message+"</p></div><div class='col-xs-12'><em>"+user+" "+datify(date)+"</em></div></div>";
                        $('#blogRoll').children().prepend(bigBlog);
                        setTimeout(function() {bigBlog.style.height = '';}, 50)
                    }

                }, true);
            },
            "getExpandedContent":function(container) {
                var that = this;

                container.append($('<p class="text-center lead">').html(that.options.name));
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
                    container.append(buttonEdit)
                }

                setTimeout(function() {
                    container.css("opacity", 1)
                }, 300);
            },
            "initAdditionalSockets": function() {
                var that = this;

                that.on('responseBlogListFull', function(data) {
                    for (var i=0; i<data.length; i++) {
                        that.blogRoll.append(wrap(data[i]));
                    }
                });

                function wrap(data) {
                    var wrapper = $('<div class="bg-info blog-full">');
                    wrapper.append($('<p>').html(data.message));
                    wrapper.append($('<em>').html(data.author.username +' '+datify(data.date)));
                    return wrapper;
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Blog;
    });
})();

