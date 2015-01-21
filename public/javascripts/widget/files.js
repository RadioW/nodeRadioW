/**
 * Created by betrayer on 19.01.15.
 */
"use strict";
(function filesjs() {
    var moduleName = m.widget.$files;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.ui.$fileinput);
    defineArray.push(m.ui.$grid);

    define(moduleName, defineArray, function files_module() {
        var Widget = require(m.$widget);
        var Fileinput = require(m.ui.$fileinput);
        var Grid = require(m.ui.$grid);

        var Files = Widget.inherit({
            "className": "Files",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "name": "Хранилище",
                    "path": "files",
                    "userId": "" //REQUIRED IN PARAMS!
                };
                that.size = {};
                $.extend(baseOptions, params);
                that.options = baseOptions;
                Widget.fn.constructor.call(that, baseOptions);
            },
            "getExpandedContent": function (container) {
                var that = this;

                that.expandedHeader = $('<p class="text-center lead">').html(that.options.name);
                container.append(that.expandedHeader);

                if (core.user.id == that.options.userId) {
                    var fileInput = that.fileInput = new Fileinput({
                        "url": "/user/saveFile",
                        "multiple": true,
                        "successMessage": "Файлы успешно загружены"
                    });
                    container.append(fileInput.wrapper);
                    fileInput.wrapper.css({
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        "text-align": "right"
                    })
                }

                that.grid = new Grid({
                    columns: [
                        {key: "image", title: ""},
                        {key: "name", title:"Название"},
                        {key: "size", title: "Размер"},
                        {key: "description", title: "Описание"},
                        {key: "buttons", title: ""}
                    ]
                });

                that.grid.data([
                    {
                        image: "test1",
                        name: "someName",
                        size: "100500",
                        description: "hate Grids!"
                    }
                ]);
                container.append(that.grid.wrapper);

                setTimeout(function () {
                    container.css("opacity", 1);
                }, 500);
            },
            "initContent": function() {
                var that = this;
                Widget.fn.initContent.call(that);

                that.smallSizeBar = {
                    wrapper: $('<div style="width:100%; height:80px; margin:100px 0 0 0; padding:0; overflow:hidden; text-align: center">'),
                    outside: $('<div class="progress progress-striped">'),
                    inside: $('<div class="progress-bar progress-bar-success" role="progressbar" style="width:0">'),
                    title: $('<p class="size-title">')
                };
                that.smallSizeBar.wrapper.append(that.smallSizeBar.outside.append(that.smallSizeBar.inside)).append(that.smallSizeBar.title);
                that.emit("sizeRequest", that.options.userId);
                that.container.append(that.smallSizeBar.wrapper);
            },
            "initSockets": function () {
                var that = this;
                that.on("sizeResponse", function (data) {
                    that.setSize(data);
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "setSize": function(size) {
                var that = this;
                that.size.total = size.total || that.size.total || 1;
                that.size.used = size.used || that.size.used;

                that.smallSizeBar.inside.css("width", (100*(size.used / size.total)) + "%");
                that.smallSizeBar.title.html("Использовано " + Math.round(size.used/1048576) + "Mb из " + Math.round(size.total/1048576) + "Mb");
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);

                if (that.fileInput) {
                    that.fileInput.destructor();
                    delete that.fileInput;
                }
                if (that.grid) {
                    that.grid.destructor();
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Files;
    });
})();