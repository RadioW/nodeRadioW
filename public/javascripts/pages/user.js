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
    defineArray.push(m.widget.$messages);

    define(moduleName, defineArray, function registration_module(){
        var Page = require(m.$page);
        var Info = require(m.widget.$info);
        var Blog = require(m.widget.$blog);
        var Photo = require(m.widget.$photo);
        var Messages = require(m.widget.$messages);
        var User = Page.inherit({
            "className": "User",
            "websocket": true,
            "constructor": function(params) {
                var that = this;
                that.userId = params.id;
                that.widgetCollection = {
                    info: Info,
                    blog: Blog,
                    photo: Photo,
                    messages: Messages
                };
                that.jobs = [];
                that.options = params;
                that.widgets = {};
                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "user"
                });
                /*that.widgets = {
                    info: new Info({
                        userId: params.id
                    }),
                    blog: new Blog({
                        userId: params.id
                    }),
                    photo: new Photo({
                        userId: params.id
                    }),
                    messages: new Messages({
                        userId: params.id
                    })
                };
                that.openWidgets(params);
                that.executeJobs();*/
            },
            "destructor": function() {
                var that = this;

                that.jobs = undefined;
                for (var key in that.widgets) {
                    if (that.widgets.hasOwnProperty(key)) {
                        that.widgets[key].destructor();
                    }
                }
                that.widgets = undefined;

                Page.fn.destructor.call(that);
            },
            "run": function() {
                var that = this;

                that.on('connection', function() {
                    that.emit('join', that.userId);
                });
                that.on('error', function(err) {
                    launchModal('Извините, произошла ошибка!</br>'+err);
                });
                that.on('responseWidgets', function(data) {
                    for (var i = 0; i<data.length; ++i) {
                        that.widgets[data[i].title] = new that.widgetCollection[data[i].title]($.extend(data[i].options, {userId: that.userId}));
                    }
                    that.openWidgets(that.options);
                    that.executeJobs();
                    delete that.options;
                    that.off('responseWidgets');
                });
                that.emit("requestWidgets", that.userId);

                Page.fn.run.call(that);
            },
            "openWidgets": function(param) {
                var that = this;

                if (that.widgets[param.type]) {
                    switch (param.type) {
                        case "info":
                            that.jobs.push(function () {
                                that.widgets.info.expand();
                            });
                            break;
                        case "blog":
                            that.jobs.push(function () {
                                that.widgets.blog.expand();
                            });
                            break;
                        case "photo":
                            that.jobs.push(function () {
                                that.widgets.photo.expand();
                            });
                            break;
                        case "messages":
                            that.jobs.push(function () {
                                that.widgets.messages.expand();
                            });
                            break;
                        default:
                            return;
                    }
                    if (param.oid) {
                        that.jobs.push(function () {
                            core.content.subscribe(param.id, param.type, param.oid);
                        });
                    }
                } else {
                    if (param.type) {
                        launchModal("Permission error! Widget is not available!");
                    }
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