/**
 * Created by betrayer on 25.01.15.
 */
"use strict";
(function panejs() {
    var moduleName = m.ui.$pane;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function pane_module() {
        var Class = require(m.$class);

        var Pane = Class.inherit({
            "className": "Pane",
            "constructor": function(options) {
                var that = this;
                var baseOptions = {
                    "name": "Pane",
                    "title": "Pane",
                    "type": "main",
                    "staticScroll": false
                };
                $.extend(baseOptions, options);
                that.options = baseOptions;
                that.initialized = false;
                that.deactivated = false;
                that.activated = false;
                that.type = that.options.type;
                that.name = that.options.name;
                that.noSwitch = that.options.noSwitch === true;
                that.noFade = false;
                Class.call(that);
                that.initWrapper();
                if (that.type.indexOf("mode") !== -1) {
                    that.initSwitches();
                }
                if (that.options.controls instanceof Array) {
                    that.initControls();
                }
            },
            "destructor": function() {
                var that = this;

                for (var i in that.controls) {
                    if (that.controls.hasOwnProperty(i)) {
                        that.controls[i].off();
                        that.controls[i].remove();
                    }
                }
                if (that.switchOn) {
                    that.switchOn.off();
                    that.switchOn.remove();
                }
                that.switchOn = undefined;
                if (that.switchOff) {
                    that.switchOff.off();
                    that.switchOff.remove();
                }
                that.switchOff = undefined;
                that.controls = {};

                that.wrapper.remove();
                Class.fn.destructor.call(that);
            },
            "activate": function (param) {
                var that = this;
                if (that.deactivated || !that.initialized) {
                    that.deactivated = false;
                    that.wrapper.css("display", "block");
                    that.initialize();
                    if (that.options.activate instanceof Function) {
                        that.options.activate.call(that, param);
                    }
                    that.activated = true;
                }
            },
            "deactivate": function(param) {
                var that = this;
                if (that.activated) {
                    that.activated = false;
                    that.wrapper.css({
                        "display": "none"
                    });
                    if (that.options.deactivate instanceof Function) {
                        that.options.deactivate.call(that, param);
                    }
                    that.deactivated = true;
                }
            },
            "initialize": function() {
                var that = this;
                if (!that.initialized) {
                    if (that.options.initialize instanceof Function) {
                        that.options.initialize.call(that);
                    }
                    that.initialized = true;
                }
            },
            "destroy": function() {
                var that = this;
                that.deactivate();
                if (that.options.destroy instanceof Function) {
                    that.options.destroy.call(that);
                }
                that.destructor();
            },
            "initControls": function () {
                var that = this;
                that.controls = {};
                for (var i = 0; i<that.options.controls.length; ++i) {
                    var opt = that.options.controls[i];
                    if (!opt.name) continue;
                    if (opt.wrapper) {
                        that.controls[opt.name] = opt.wrapper;
                        that.controlsSlot.append(opt.wrapper);
                        continue;
                    }
                    var wrapper = $('<button class="btn">');
                    if (opt.color) {
                        if (opt.color == "default" || opt.color == "primary" || opt.color == "default" || opt.color == "danger" || opt.color == "success" || opt.color == "warning" || opt.color == "info") {
                            wrapper.addClass("btn-" + opt.color + "");
                        } else {
                            wrapper.css("color", opt.color);
                        }
                    }
                    if (opt.icon) {
                        wrapper.append($('<i class="glyphicon glyphicon-'+ opt.icon +'">'));
                    } else if (opt.text) {
                        wrapper.html(opt.text);
                    } else {
                        wrapper.html(opt.name);
                    }
                    wrapper.on("click", (function(click) {
                        return function () {click.call(that)}
                    })(opt.click));
                    that.controls[opt.name] = wrapper;
                    that.controlsSlot.append(wrapper);
                }
            },
            "initSwitches": function() {
                var that = this;
                if (!that.noSwitch) {
                    that.switchOn = $('<button class="btn btn-primary">');
                    var switchOnText = that.options.switchOnText || that.options.name;
                    var switchOnInner;
                    if (that.options.icon) {
                        switchOnInner = $('<i class="glyphicon glyphicon-' + that.options.icon + '">');
                    } else {
                        switchOnInner = $('<p>' + switchOnText + '</p>');
                    }
                    that.switchOn.append(switchOnInner).css({
                        float: "left"
                    }).on("click", function () {
                        that.wrapper.parent().trigger("switchMode", [that.options.name]);
                    });
                }

                that.switchOff = $('<button class="btn btn-danger">')
                    .append($('<i class="glyphicon glyphicon-chevron-down">'))
                    .css({float: "left"})
                    .on("click", function() {
                        that.wrapper.parent().trigger("switchMode");
                    });
                that.switchSlot.append(that.switchOff);
            },
            "initWrapper": function() {
                var that = this;
                that.wrapper = $('<div class="w-pane">');
                that.header = $('<p class="lead w-pane-header">').html(that.options.title);
                that.content = $('<div class="w-pane-content">');
                if (that.options.staticScroll) {
                    that.content.addClass("static-scroll");
                }
                that.wrapper.append($('<div class="w-pane-container">').append(that.header).append(that.content));
                if (that.options.name === "main") {
                    that.wrapper.css({
                        "cursor": "pointer"
                    });
                }
                that.switchSlot = $('<div>').css({
                    position: "absolute",
                    top: 0,
                    right: 0
                });
                that.wrapper.append(that.switchSlot);
                that.controlsSlot = $('<div>').css({
                    position: "absolute",
                    top: 0,
                    left: 0
                });
                that.wrapper.append(that.controlsSlot);
            },
            "setTitle": function(str) {
                this.header.html(str);
            }
        });
        requirejs._moduleExecute(moduleName);
        return Pane;
    });
})();