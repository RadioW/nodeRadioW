/**
 * Created by betrayer on 01.10.14.
 */
"use strict";

(function widgetjs() {
    var moduleName = m.$widget;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.$page);
    defineArray.push(m.ui.$pane);

    define(moduleName, defineArray, function widget_module() {
        var Class = require(m.$class);
        var Pane = require(m.ui.$pane);
        var Page = require(m.$page);

        var Widget = Class.inherit({
            "className": "Widget",
            "title": "user",
            "constructor": function(options) {
                var that = this;

                var baseOptions = {
                    "name": "Widget",
                    "path": "",
                    "userId": ""
                };
                $.extend(baseOptions, options);
                that.options = baseOptions;

                Class.call(that);

                that.href = "/user/" + that.options.userId + "/" + that.options.path + "/";
                that.listeners = [];
                that.initWrapper();
                that.initProxy();
                that.initPanes();
            },
            "destructor": function() {
                var that = this;

                that.container.remove();
                that.border.remove();
                that.wrapper.off();
                that.wrapper.remove();
                $("#cover").off("click", that.proxy.collapse);

                for (var key in that.panes) {
                    if (that.panes.hasOwnProperty(key)) {
                        that.panes[key].destroy();
                    }
                }

                Class.fn.destructor.call(that);
            },
            "initPanes": function() {
                var that = this;
                that.panes = {};
                for (var name in that.options.panes) {
                    if (that.options.panes.hasOwnProperty(name) && name !== "main" && name !== "mainExpanded") {
                        var pane = new Pane(that.options.panes[name]);
                        that.container.append(pane.wrapper);
                        that.panes[pane.name] = pane;
                    }
                }
                var mOpts = that.options.panes && that.options.panes.main;
                that.panes.main = new Pane(mOpts || {
                    title: that.options.name,
                    name: "main",
                    type: "main",
                    initialize: function() {
                        that.initContent(this);
                        that.initSockets(this);
                    }
                });
                var eOpts = that.options.panes && that.options.panes.mainExpanded;
                that.panes.mainExpanded = new Pane(eOpts || {
                    title: that.options.name,
                    name: "mainExpanded",
                    type: "mainExpanded",
                    initialize: function() {
                        that.initExpandedContent(this);
                        //that.initSockets();
                    },
                    deactivate: function() {
                        that.standBy(this);
                    },
                    activate: function() {
                        that.initAdditionalSockets(this);
                    }
                });
                for (var key in that.panes) {
                    if (that.panes.hasOwnProperty(key) && !that.panes[key].noSwitch) {
                        if (that.panes[key].type === "mode") {
                            that.panes.main.switchSlot.append(that.panes[key].switchOn);
                        }
                        if (that.panes[key].type === "modeExpanded") {
                            that.panes.mainExpanded.switchSlot.append(that.panes[key].switchOn);
                        }
                    }
                }
                that.container.append(that.panes.mainExpanded.wrapper);
                that.container.append(that.panes.main.wrapper);
                that.wrapper.on("click", that.proxy.expand);
                that.panes.main.activate();
            },
            "initWrapper": function() {
                var that = this;
                that.wrapper = $('<div class="col-lg-4 col-md-6 col-lg-4-v col-md-6-v col-sm-6 col-sm-6-v">');
                var border = that.border = $('<div class="thumbnail widgetBorder">');
                border.css("overflow", "hidden");
                that.wrapper.append(border);
                border.on("switchMode", function(e, mode, param) {
                    that.switchMode(mode, param);
                });
                that.container = $('<div class="widget-container">');
                that.border.append(that.container);
                $("#pseudoBody").append(that.wrapper);
                that.container.css("opacity", 1);
            },
            "initContent": function() {
            },
            "initSockets": function() {
                var that = this;

                console.log("Sockets for widget "+ that.options.path +" are ready");
            },
            "initAdditionalSockets": function() {},
            "expand": function() {
                var that = this;
                that.switchMode();
                that.fullSized = true;
                that.wrapper.off("click", that.proxy.expand);

                that.panes.main.deactivate();
                that.container.css("opacity", 0);
                setTimeout(function() {
                    that.panes.mainExpanded.activate();
                    that.container.css("opacity", 1);
                }, 300);
                //that.container.after(tool);

                that.place = getCoords(that.wrapper.get(0));
                var carett = $('#carett');
                carett.css('display', 'block');
                carett.p = getCoords(carett.get(0));

                var car = $('<div class="col-lg-4 col-md-6 col-lg-4-v col-md-6-v col-sm-6 col-sm-6-v">');
                car.css({
                    width: that.place.right - that.place.left + 'px',
                    height: that.place.bottom - that.place.top+'px',
                    position: 'absolute',
                    top: that.place.top - carett.p.top+'px',
                    left: that.place.left-carett.p.left+'px'
                });

                carett.append(car);
                car.append(that.border);
                var cover = $('#cover');
                cover.css('display', 'block');

                setTimeout (function (){
                    cover.css('opacity', 0.5);
                    car.get(0).className = 'col-xs-12 expanded-widget';
                    car.css({
                        width: '',
                        height: cover.height(),
                        position: 'relative',
                        top: '0px',
                        left: '0px'
                    });

                    history.pushState(null, null, that.href);
                    cover.on("click", that.proxy.collapse);
                }, 20);
            },
            "collapse": function() {
                var that = this;
                that.switchMode();
                that.fullSized = false;
                var cover = $('#cover');
                cover.off("click", that.proxy.collapse);
                var carett = $('#carett');
                carett.place = getCoords(carett.get(0));
                cover.css('opacity', 0);
                var car = carett.children();
                car.css({
                    width: that.place.right - that.place.left+'px',
                    height: that.place.bottom - that.place.top+'px',
                    position: 'absolute',
                    top: that.place.top -carett.place.top +'px',
                    left: that.place.left-carett.place.left+'px'
                });
                that.panes.mainExpanded.deactivate();
                that.container.css("opacity", 0);
                setTimeout (function() {
                    cover.css('display', 'none');
                    that.wrapper.append(that.border);
                    setTimeout(function() {
                        that.container.css("opacity", 1);
                    }, 20);
                    carett.css("display", 'none');
                    that.panes.main.activate();
                    car.remove();
                    history.pushState(null, null, "/user/" + that.options.userId + "/");
                    that.wrapper.on("click", that.proxy.expand);
                }, 500);
            },
            "initProxy": function() {
                var that = this;
                that.proxy = {
                    "expand": $.proxy(that.expand, that),
                    "collapse": $.proxy(that.collapse, that)
                }
            },
            "initExpandedContent": function(container) {
                //it's a function for inheriters.
            },
            "on": function(event, handler, bothStates) {
                var that = this;
                if (!bothStates) {
                    that.listeners.push(event);
                }
                Page.fn.on.apply(this, [event, handler]);
            },
            "off": function() {
                Page.fn.off.apply(this, arguments);
            },
            "emit": function() {
                Page.fn.emit.apply(this, arguments);
            },
            "standBy": function() {
                var that = this;
                for(var i=0; i<that.listeners.length; i++) {
                    that.off(that.listeners[i]);
                }
                that.listeners = [];
            },
            "switchMode": function(name, param) {
                var that = this;
                if (!name) {
                    if (that.fullSized) {
                        that.panes.mainExpanded.wrapper.css("height", "100%");
                    } else {
                        that.panes.main.wrapper.css("height", "100%")
                    }
                    if (that.activeMode) {
                        setTimeout(function() {
                            that.panes[that.activeMode].deactivate(param);
                            that.activeMode = false;
                        }, 300);
                    }
                } else {
                    if (that.panes[name]) {
                        that.activeMode = name;
                        if (that.fullSized) {
                            that.panes.mainExpanded.wrapper.after(that.panes[name].wrapper);
                            that.panes.mainExpanded.wrapper.css("height", 0);
                        } else {
                            that.panes.main.wrapper.after(that.panes[name].wrapper);
                            that.panes.main.wrapper.css("height", 0);
                        }
                        that.panes[name].activate(param);
                    }
                }

            }
        });

        requirejs._moduleExecute(moduleName);
        return Widget;
    });
})();
