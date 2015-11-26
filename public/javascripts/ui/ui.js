/**
 * Created by betrayer on 02.09.15.
 */
"use strict";
(function ui_js() {
    var moduleName = m.$ui;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function ui_module() {
        var Class = require(m.$class);

        var Ui = Class.inherit({
            "className": "Ui",
            "constructor": function(options) {
                var that = this;

                var baseOptions = {
                    "name": "default"
                };

                Class.fn.constructor.call(that);
                $.extend(baseOptions, options);

                that.options = baseOptions;
                that.wrapper = $("<div>");
                that._events = {};
            },
            "destructor": function() {
                this.off();
                this.wrapper.remove();
                delete this.wrapper;
                delete this.options;
                delete this._events;

                Class.fn.destructor.call(this);
            },
            "on": function(name, handler, context) {
                var arr = this._events[name];
                if (!(arr instanceof Array)) {
                    arr = [];
                    this._events[name] = arr;
                }
                if (context === undefined) {
                    context = this;
                }
                arr.push({
                    handler: handler,
                    context: context,
                    one: false
                });
            },
            "one": function() {
                this.on(arguments);
                this._events[this._events.length-1].one = true;
            },
            "off": function(name, handler) {
                var arr = this._events[name];
                if (!name) {
                    this._events = {};
                } else {
                    if (arr instanceof Array) {
                        if (handler instanceof Function) {
                            for (var i = 0; i < arr.length; ++i) {
                                if (arr[i].handler === handler) {
                                    arr.splice(i, 1);
                                    break;
                                }
                            }
                            if (arr.length === 0) {
                                delete this._events[name];
                            }
                        } else {
                            delete this._events[name];
                        }
                    }
                }
            },
            "trigger": function() {
                var args = [].slice.call(arguments);
                if (args.length > 0) {
                    var type = args.splice(0, 1)[0];
                    var arr = this._events[type];
                    if (arr) {
                        for (var i = 0; i < arr.length; ++i) {
                            var answer = arr[i].handler.apply(arr[i].context, args);
                            if (arr[i].one) {
                                arr.splice(i, 1);
                                --i;
                            }
                            if (answer === false) {
                                break;
                            }
                        }
                    }
                }
            },
            "name": function() {
                return this.options.name;
            }
        });

        requirejs._moduleExecute(moduleName);
        return Ui;
    });
})();