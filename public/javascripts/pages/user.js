/**
 * Created by betrayer on 05.10.14.
 */
"use strict";

(function userjs(){
    var moduleName = m.page.$user;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);
    defineArray.push(m.widget.$info);
    defineArray.push(m.widget.$blog);
    defineArray.push(m.widget.$photo);

    define(moduleName, defineArray, function registration_module(){
        var Page = require(m.$page);
        var Info = require(m.widget.$info);
        var Blog = require(m.widget.$blog);
        var Photo = require(m.widget.$photo);
        var User = Page.inherit({
            "className": "User",
            "websocket": true,
            "constructor": function(params) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "user"
                });
                that.widgets = {
                    info: new Info({
                        userId: params.id
                    }),
                    blog: new Blog({
                        userId: params.id
                    }),
                    photo: new Photo({
                        userId: params.id
                    })
                };
                that.jobs = [];
                that.openWidgets(params);
                that.executeJobs();
            },
            "destructor": function() {
                var that = this;

                that.jobs = undefined;
                that.widgets = undefined;

                Page.fn.destructor.call(that);
            },
            "run": function() {
                var that = this;

                that.on('connection', function() {
                    that.emit('join', core.user.id);
                });

                that.on('new photo', function(files) {
                    if (!$('#photoRoll').get(0)) return;
                    for (var i=0; i<files.length; i++) {
                        var img = document.createElement('img');
                        img.src = files[i]+'prev.jpg';
                        var slot = document.createElement('div');
                        slot.className = 'photoPrev';
                        slot.onclick = function() {
                            var file = files[i].slice(files[i].lastIndexOf('/')+1);
                            return function () {
                                that.subscribeContent('<%- user._id -%>', 'photo', file);
                            }
                        }();
                        slot.appendChild(img);
                        $('#photoRoll').children('.row').prepend(slot);
                    }
                });



                that.on('removed photo', function(id) {
                    if ($('#'+id).get(0)) $('#'+id).remove();
                });

                that.on('error', function(err) {
                    launchModal('Извините, произошла ошибка!</br>'+err);
                });

                $('.thumbnail-v').each(function (i, quad) {
                    quad.onclick = function() {
                        showQuad(quad);
                        return false;
                    }
                });

                Page.fn.run.call(that);
            },
            "subscribeContent": function (userId, type, contentId) {
                this.emit('subscribe', {
                    userId: userId,
                    contentType: type,
                    contentId: contentId
                });
            },
            "openWidgets": function(param) {
                var that = this;

                switch (param.type) {
                    case "info":
                        that.jobs.push(function() {
                            that.widgets.info.expand();
                        });
                        break;
                    case "blog":
                        that.jobs.push(function() {
                            that.widgets.blog.expand();
                        });
                        break;
                    case "photo":
                        that.jobs.push(function() {
                            that.widgets.photo.expand();
                        });
                }
            },
            "executeJobs": function() {
                var that = this;
                var timer = 500;

                for (var i=0; i<that.jobs.length; i++) {
                    setTimeout((function(i) {
                        return that.jobs[i];
                    })(i), (i+1)*timer);
                }
            }
        });

        $.extend(User, {
            "title": "user"
        });

        requirejs._moduleExecute(moduleName);
        return User;
    });
})();