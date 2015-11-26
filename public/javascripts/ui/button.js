/**
 * Created by betrayer on 02.09.15.
 */
"use strict";
(function button_js() {
    var moduleName = m.ui.$button;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$ui);

    define(moduleName, defineArray, function button_module() {
        var Ui = require(m.$ui);

        var Button = Ui.inherit({
            "className": "Button",
            "constructor": function(options) {
                var that = this;

                var baseOptions = {
                    "color": "primary",
                    "icon": "",
                    "name": "default",
                    "text": "",
                    "float": "left"
                };
                $.extend(baseOptions, options);
                Ui.fn.constructor.call(that, baseOptions);

                that._initWrapper();
                that._initHandlers();
            },
            "destructor": function() {
                this.wrapper.off();

                Ui.fn.destructor.call(this);
            },
            "_initWrapper": function() {
                var wrapper = this.wrapper = $('<button class="btn">');
                var opt = this.options;
                if (opt.color == "default" || opt.color == "primary" || opt.color == "default" || opt.color == "danger" || opt.color == "success" || opt.color == "warning" || opt.color == "info") {
                    wrapper.addClass("btn-" + opt.color + "");
                } else {
                    wrapper.css("color", opt.color);
                }
                if (opt.icon) {
                    wrapper.append($('<i class="glyphicon glyphicon-'+ opt.icon +'">'));
                } else if (opt.text) {
                    wrapper.html(opt.text);
                } else {
                    wrapper.html(opt.name);
                }
                if (this.options.float) {
                    wrapper.css({
                        float: this.options.float
                    })
                }
            },
            "_initHandlers": function() {
                var that = this;

                that.wrapper.on("click", function(e) {
                    that.trigger("click", e);
                });
                that.wrapper.on("mousedown", function(e) {
                    that.trigger("mousedown", e);
                });
                that.wrapper.on("mouseup", function(e) {
                    that.trigger("mouseup", e);
                });
                that.wrapper.on("tap", function(e) {
                    that.trigger("click", e);
                });
                that.wrapper.on("touchstart", function(e) {
                    that.trigger("mousedown", e);
                });
                that.wrapper.on("touchend", function(e) {
                    that.trigger("mouseup", e);
                });

                that._uncyclic.push(function() {
                    that = null;
                })
            }
        });

        requirejs._moduleExecute(moduleName);
        return Button;
    });
})();