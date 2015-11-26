/**
 * Created by betrayer on 25.01.15.
 */
"use strict";
(function panejs() {
    var moduleName = m.ui.$pane;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.ui.$button);
    defineArray.push(m.$ui);

    define(moduleName, defineArray, function pane_module() {
        var Button = require(m.ui.$button);
        var Ui = require(m.$ui);

        var Pane = Ui.inherit({
            "className": "Pane",
            "constructor": function(options) {
                var that = this;
                var baseOptions = {
                    "name": "Pane",
                    "title": "Pane",
                    "type": "main",
                    "staticScroll": false,
                    "switchOnText": ""
                };
                $.extend(baseOptions, options);
                Ui.fn.constructor.call(that, baseOptions);
                that.initialized = false;
                that.deactivated = false;
                that.activated = false;
                that.type = that.options.type;

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
                        that.controls[i].destructor();
                    }
                }
                if (that.switchOn) {
                    that.switchOn.destructor();
                }

                if (that.switchOff) {
                    that.switchOff.destructor()
                }
                that.switchOn = undefined;
                that.switchOff = undefined;
                that.controls = undefined;
                Ui.fn.destructor.call(that);
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
                    if (opt instanceof Ui) {
                        that.controls[opt.name()] = opt;
                        that.controlsSlot.append(opt.wrapper);
                    }
                }
            },
            "initSwitches": function() {
                var that = this;
                if (!that.options.noSwitch) {
                    that.switchOn = new Button({
                        name: that.options.name,
                        text: that.options.switchOnText,
                        icon: that.options.icon,
                        float: "left"
                    });
                    that.switchOn.on("click", function() {
                        that.trigger("switchMode");
                    });
                }
                that.switchOff = new Button({
                    name: that.options.name + "_off",
                    color: "danger",
                    icon: "chevron-down"
                });
                that.switchOff.on("click", function() {
                    that.trigger("switchOffMode");
                });

                that.switchSlot.append(that.switchOff.wrapper);

                that._uncyclic.push(function() {
                    that = null;
                });
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