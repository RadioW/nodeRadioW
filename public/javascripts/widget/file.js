/**
 * Created by betrayer on 19.01.15.
 */
"use strict";
(function filejs() {
    var moduleName = m.widget.$file;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.ui.$fileinput);
    defineArray.push(m.ui.$grid);

    define(moduleName, defineArray, function file_module() {
        var Widget = require(m.$widget);
        var Fileinput = require(m.ui.$fileinput);
        var Grid = require(m.ui.$grid);

        var File = Widget.inherit({
            "className": "Files",
            "constructor": function (params) {
                var that = this;
                var mainExpanded = {
                    title: "Хранилище",
                    name: "mainExpanded",
                    type: "mainExpanded",
                    "staticScroll": true,
                    deactivate: function() {
                        that.standBy(this);
                    },
                    activate: function() {
                        that.initExpandedContent(this);
                    }
                };
                if (params.userId === core.user.id) {
                    that.file = new Fileinput({
                        "url": "/user/saveFile",
                        "multiple": true,
                        "successMessage": "Файлы успешно загружены"
                    });
                    mainExpanded.controls = [{
                        name: "file",
                        wrapper: that.file.wrapper
                    }];
                    mainExpanded.destroy = function() {
                        that.file.destructor();
                    }
                }
                var baseOptions = {
                    "name": "Хранилище",
                    "path": "file",
                    "userId": "", //REQUIRED IN PARAMS!
                    "panes": {
                        mainExpanded: mainExpanded
                    }
                };
                that.size = {};
                $.extend(baseOptions, params);
                that.options = baseOptions;
                Widget.fn.constructor.call(that, baseOptions);
            },
            "initExpandedContent": function (pane) {
                var that = this;

                var cols = [
                    {key: "image", title: ""},
                    {key: "name", title:"Название"},
                    {key: "size", title: "Размер", template: function(data) {
                        return bytify(data);
                    }},
                    {key: "description", title: "Описание"},
                    {key: "date", title: "Дата", template: function(data) {return datify(data)}},
                    {key: "link", title: "Ссылка", template: function(data) {
                        var elem = $('<a href="'+data+'?download" type="button" class="btn btn-primary">').html("Скачать");
                        elem.attr('download', data.substr(data.lastIndexOf('/') + 1, data.length));
                        return elem;
                    }}
                ];
                if (that.options.userId === core.user.id) {
                    cols.push({key: "remove", title: " ", template: function(data, model) {
                        var elem = $('<button type="button" class="btn btn-danger">').html("Удалить");
                        elem.on("click", (function(id) {
                            return function() {
                                core.connection.socket.emit('event', {
                                    route: "content",
                                    event: "contentRemove",
                                    data: {
                                        uid: that.options.userId,
                                        type: "file",
                                        oid: id
                                    }
                                });
                            }
                        })(model.id));
                        return elem;
                    }})
                }
                that.grid = new Grid({
                    columns: cols,
                    sort: {field: "date", descending: true}
                });
                that.on("filesResponse", function(data) {
                    that.grid.data(data);
                });
                that.emit("filesRequest", that.options.userId);
                pane.content.append(that.grid.wrapper);
            },
            "initContent": function(pane) {
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
                pane.content.append(that.smallSizeBar.wrapper);
            },
            "initSockets": function () {
                var that = this;
                that.on("sizeResponse", function (data) {
                    that.setSize(data);
                }, true);
                that.on("new file", function(data) {
                    if (that.fullSized && that.grid) {
                        for (var i = 0; i < data.length; ++i) {
                            that.grid.add(data[i]);
                        }
                    }
                }, true);
                that.on("remove file", function(data) {
                    if (that.fullSized && that.grid) {
                        that.grid.remove(data);
                    }
                    that.emit("sizeRequest", that.options.userId);
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "setSize": function(size) {
                var that = this;
                that.size.total = size.total || that.size.total || 1;
                that.size.used = size.used || that.size.used;

                that.smallSizeBar.inside.css("width", (100*(size.used / size.total)) + "%");
                that.smallSizeBar.title.html("Использовано " + bytify(size.used) + " из " + bytify(size.total));
            },
            "standBy": function() {
                var that = this;

                Widget.fn.standBy.call(that);

                if (that.grid) {
                    that.grid.destructor();
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return File;
    });
})();