/**
 * Created by betrayer on 30.10.14.
 */
"use strict";

(function photojs() {
    var moduleName = m.widget.$photo;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.ui.$fileinput);

    define(moduleName, defineArray, function photo_module() {
        var Widget = require(m.$widget);
        var Fileinput = require(m.ui.$fileinput);

        var Photo = Widget.inherit({
            "className": "Photo",
            "constructor": function (params) {
                var that = this;
                var panes = {
                    mainExpanded: {
                        title: "Фото",
                        name: "mainExpanded",
                        type: "mainExpanded",
                        "staticScroll": true,
                        initialize: function() {
                            this.content.css({
                                "padding-left": "10px",
                                "padding-right": 0
                            });
                        },
                        deactivate: function() {
                            this.content.empty();
                            that.standBy(this);
                        },
                        activate: function() {
                            var pane = this;
                            that.on("photoResponse", function(data) {
                                pane.content.empty();
                                for (var i=0; i<data.length; i++) {
                                    pane.content.append($('<div class="photoPrev" id="'+data[i]+'">')
                                            .append($('<img src="/data/' + that.options.userId + '/photo/'+ data[i] +'prev.jpg">'))
                                            .on("click", (function(i){
                                                return function() {
                                                    core.content.subscribe(that.options.userId, "photo", data[i]);
                                                }
                                            })(i))
                                    );
                                }
                            });
                            that.emit('photoRequest', that.options.userId);
                        }
                    }
                };
                if (core.user.id == params.userId) {
                    var file = that.file = new Fileinput({
                        "url": "/user/savePhoto",
                        "multiple": true,
                        "maxFileSize": (20 * 1024 * 1024),
                        "allowedTypes" : ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'],
                        "successMessage": "Фотографии успешно загружены"
                    });
                    panes.mainExpanded.controls = [{
                        name: "upload",
                        wrapper: file.wrapper
                    }];
                    panes.mainExpanded.destroy = function() {
                        that.file.destructor();
                    }
                }
                var baseOptions = {
                    "name": "Фото",
                    "path": "photo",
                    "userId": "", //REQUIRED IN PARAMS!
                    "panes": panes
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;

                Widget.fn.constructor.call(that, baseOptions);
            },
            "destructor": function() {
                var that = this;

                clearInterval(that.requester);
                Widget.fn.destructor.call(that);
            },
            "initContent": function(pane) {
                var that = this;
                Widget.fn.initContent.call(that);

                var littlePhotos = that.littlePhotos = $('<div class="col-xs-12" id="miniPhotoRoll">'); //todo
                pane.content.append($('<div class="row">').append(littlePhotos));

                that.emit("photoShortRequest", that.options.userId);
                that.requester = setInterval(function() {
                    that.emit("photoShortRequest", that.options.userId);
                }, 60000);
            },
            "initSockets": function(pane) {
                var that = this;
                that.on("photoShortResponse", function(data) {
                    that.littlePhotos.css("opacity", 0);
                    setTimeout(function() {
                        that.littlePhotos.empty();
                        for (var i=0; i<data.length; i++) {
                            that.littlePhotos
                                .append($('<div class="col-xs-6">')
                                    .append($('<div class="row">').append($('<div class="photoPrev">').css({
                                        "position": "relative",
                                        "left": "11px"
                                    })
                                        .append($('<img src="/data/' + that.options.userId + '/photo/'+ data[i] +'prev.jpg">')))));
                        }
                        if (data.length == 0) {
                            that.littlePhotos.append($('<p class="placeholder">').html(that.options.userId == core.user.id ? "Вы пока не загружали изображений":"Пользователь пока не загрузил ни одного изображения"))
                        }
                        that.littlePhotos.css("opacity", 1);
                    }, 300);
                }, true);
                that.on('new photo', function(data) {
                    if (that.fullSized) {
                        for (var i=0; i<data.length; i++) {
                            that.panes.mainExpanded.content.prepend($('<div class="photoPrev" id="'+data[i]+'">')
                                    .append($('<img src="/data/' + that.options.userId + '/photo/'+ data[i] +'prev.jpg">'))
                                    .on("click", (function(i){
                                        return function() {
                                            core.content.subscribe(that.options.userId, "photo", data[i]);
                                        }
                                    })(i))
                            );
                        }
                    } else {
                        that.emit("photoShortRequest", that.options.userId);
                    }
                }, true);

                that.on('removed photo', function(id) {
                    if (that.fullSized) {
                        if ($('#'+id, that.panes.mainExpanded.content[0])[0]) {
                            $('#'+id).remove();
                        }
                    } else {
                        that.emit("photoShortRequest", that.options.userId);
                    }
                }, true);
                Widget.fn.initSockets.call(that);
            }
        });

        requirejs._moduleExecute(moduleName);
        return Photo;
    });
})();