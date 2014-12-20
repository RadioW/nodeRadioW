/**
 * Created by betrayer on 15.12.14.
 */
(function tooljs(){
    var moduleName = m.$tool;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function tool_module() {
        var Class = require(m.$class);

        var Tool = Class.inherit({
            "className": "Tool",
            "constructor": function(options) {
                var that = this;
                var baseOptions = {
                    "title": "tool",
                    "display": {},
                    "maxHeight": 600,
                    "minHeight": 100,
                    "maxWidth": 800,
                    "minWidth": 100
                };
                that.options = $.extend(baseOptions, options);
                Class.fn.constructor.call(that);
                that.active = false;
                that.toggable = true;
                that.monitor = {};
                that.initWrapper();
                that.initWindow();
                that.initContent();
                that.initListeners();
            },
            "activate": function() {
                var that = this;
                that.active = true;
                that.toggable = false;
                that.draggy.css("display", "block");
                setTimeout(function() {
                    that.draggy.removeClass('tool-deactivated');
                    setTimeout(function() {
                        that.toggable = true;
                    },300);
                }, 20);
            },
            "deactivate": function() {
                var that = this;
                that.active = false;
                that.toggable = false;
                that.draggy.addClass('tool-deactivated');
                setTimeout(function() {
                    that.draggy.css("display", "none");
                    that.toggable = true;
                }, 300);
            },
            "display": function(key, value) {
                this.monitor[key].html(value);
            },
            "initContent": function() {
                var that = this;
                that.content = $('<div class="tool-content">');
                that.wnd.append(that.content);

                that.wndHandler.append($('<p class="title">').html(that.options.title));
            },
            "initHandler": function(options, key) {
                var that = this;
                core.connection.listen({
                    route: options.route || "main",
                    event: options.event,
                    handler: function(data) {
                        that.display(key, options.handler(data));
                    }
                })
            },
            "initListeners": function() {},
            "initWindow": function() {
                var that = this;
                that.draggy = $('<div class="tool-window tool-deactivated">');
                that.wnd = $('<div class="tool-inside">');
                that.draggy.append(that.wnd);
                that.wndHandler = $('<div class="tool-handler tool-color-'+ (that.options.color || "grey") +'">');
                var close = $('<div class="tool-action">').html('<i class="glyphicon glyphicon-remove"> </i>');
                close.on("click", function() {
                    that.deactivate();
                });
                $('#toolsLayer').prepend(that.draggy);
                that.wnd.append(that.wndHandler);
                that.wndHandler.append($('<div class="tool-toolbar">').append(close));

                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-n tool-resize n">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-ne tool-resize ne">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-e tool-resize e">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-se tool-resize se">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-s tool-resize s">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-sw tool-resize sw">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-w tool-resize w">'));
                that.draggy.append($('<div class="ui-resizable-handle ui-resizable-nw tool-resize nw">'));

                that.draggy.draggable({
                    containment: "#toolsRestrictor",
                    distance: 5,
                    handle: ".tool-handler",
                    cursor: "move"
                });
                that.draggy.resizable({
                    containment: "#toolsRestrictor",
                    handles: {
                        n: ".n",
                        ne: ".ne",
                        e: ".e",
                        se: ".se",
                        s: ".s",
                        sw: ".sw",
                        w: ".w",
                        nw: ".nw"
                    },
                    minWidth: that.options.minWidth,
                    maxWidth: that.options.maxWidth,
                    minHeight: that.options.minHeight,
                    maxHeight: that.options.maxHeight
                });
            },
            "initWrapper": function() {
                var that = this;
                that.wrapper = $('<div class="tool-button tool-color-'+ (that.options.color || "grey") +'">');
                var content = $('<div>');
                var counter = 0;
                for (var key in that.options.display) {
                    if(that.options.display.hasOwnProperty(key)) {
                        that.monitor[key] = $('<span>');
                        var display = that.options.display[key];
                        var icon = display.icon;
                        content.append($('<div>').html(icon?'<i class="glyphicon glyphicon-'+icon+'"></i> ':'').append(that.monitor[key]));
                        ++counter;
                        if (display.socket) {
                            that.initHandler(display.socket, key);
                        }
                    }
                }
                that.wrapper.append(content);
                that.wrapper.on('click', function() {
                    if (!that.toggable) return;
                    if (that.active) {
                        that.deactivate();
                    } else {
                        that.activate();
                    }
                });
                content.css("margin-top", (((that.options.height || 63)/2) - (21*counter)/2)+"px");
                $('#toolBar').append(that.wrapper);
            }
        });

        requirejs._moduleExecute(moduleName);
        return Tool;
    });
})();