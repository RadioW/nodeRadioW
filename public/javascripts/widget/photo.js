/**
 * Created by betrayer on 30.10.14.
 */
"use strict";

(function photojs() {
    var moduleName = m.widget.$photo;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);

    define(moduleName, defineArray, function photo_module() {
        var Widget = require(m.$widget);

        var Photo = Widget.inherit({
            "className": "Photo",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "name": "Фото",
                    "path": "photo",
                    "userId": "" //REQUIRED IN PARAMS!
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;

                Widget.fn.constructor.call(that, baseOptions);
            },
            "initContent": function() {
                var that = this;
                Widget.fn.initContent.call(that);

                var littlePhotos = that.littlePhotos = $('<div class="col-xs-12" style="height:95%; overflow:hidden" id="miniPhotoRoll">'); //todo
                that.container.append($('<div class="row">').append(littlePhotos));

                that.emit("photoShortRequest", that.options.userId);
            },
            "initSockets": function() {
                var that = this;
                that.on("photoShortResponse", function(data) {
                    that.littlePhotos.css("opacity", 0);
                    setTimeout(function() {
                        that.littlePhotos.empty();
                        for (var i=0; i<data.length; i++) {
                            that.littlePhotos.append($('<div class="photoPrev">').append($('<img src="/data/' + that.options.userId + '/photo/'+ data[i] +'prev.jpg">')));
                        }
                        that.littlePhotos.css("opacity", 1);
                    }, 300);
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "getExpandedContent": function(container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);

                var photoRoll = that.photoRoll = $('<div class="row">');
                container.append($('<div class="col-xs-12 col-xs-11-vp" style="overflow-y:scroll; float:right;" id="photoRoll">').append(photoRoll));

                that.on("photoResponse", function(data) {
                    that.photoRoll.empty();
                    for (var i=0; i<data.length; i++) {
                        that.photoRoll.append($('<div class="photoPrev">')
                            .append($('<img src="/data/' + that.options.userId + '/photo/'+ data[i] +'prev.jpg">'))
                            .on("click", (function(i){
                                    return function() {
                                        core.activePage.subscribeContent(that.options.userId, "photo", data[i]);
                                    }
                                })(i))
                        );
                    }
                });
                that.emit('photoRequest', that.options.userId);

                setTimeout(function() {
                    container.css("opacity", 1)
                }, 300);
            }
        });

        requirejs._moduleExecute(moduleName);
        return Photo;
    });
})();