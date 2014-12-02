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

    define(moduleName, defineArray, function widget_module() {
        var Class = require(m.$class);
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
                that.initSockets();
                that.initContent();
                that.initHandlers();
            },
            "destructor": function() {
                var that = this;

                that.container.remove();
                that.border.remove();
                that.wrapper.remove();
            },
            "initWrapper": function() {
                var that = this;
                that.wrapper = $('<div class="col-lg-4 col-md-6 col-lg-4-v col-md-6-v col-sm-6 col-sm-6-v">');
                var border = that.border = $('<div class="thumbnail widgetBorder">');
                border.css("overflow", "hidden");
                that.wrapper.append(border);
                var container = that.container = $('<div class="container-fluid" id="widget_'+ that.options.path +'" style="height:100%; overflow:hidden">');
                border.append(container);
                $("#pseudoBody").append(that.wrapper);
            },
            "initContent": function() {
                var that = this;

                var header = that.header = $('<p class="text-center lead">').html(that.options.name);
                that.container.append(header);
            },
            "initHandlers": function() {
                var that = this;
                that.wrapper.on("click", that.proxy.expand)
            },
            "initSockets": function() {
                var that = this;

                console.log("Sockets for widget "+ that.options.path +" are ready");
            },
            "expand": function() {
                var that = this;
                that.fullSized = true;
                that.wrapper.off("click", that.proxy.expand);

                var tool = that.expanded = $('<div class="container-fluid widget-container">');
                that.getExpandedContent(tool);
                that.container.css('display', 'none');
                that.container.after(tool);

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
                    top: that.place.top+'px',
                    left: that.place.left-carett.place.left+'px'
                });
                that.expanded.css("opacity",0);
                setTimeout (function() {
                    cover.css('display', 'none');
                    that.wrapper.append(that.border);
                    carett.css("display", 'none');
                    that.expanded.remove();
                    car.remove();
                    delete that.expanded;
                    that.container.css("display", 'block');
                    history.pushState(null, null, "/user/" + that.options.userId + "/");
                    that.wrapper.on("click", that.proxy.expand);
                }, 500);
                that.standBy();
            },
            "initProxy": function() {
                var that = this;
                that.proxy = {
                    "expand": $.proxy(that.expand, that),
                    "collapse": $.proxy(that.collapse, that)
                }
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
            "getExpandedContent": function(container) {
                var that = this;
                $.ajax({
                    url: that.href || "/",
                    method: 'GET',
                    data: null,
                    statusCode:{
                        200: function(jqXHR) {
                            container.html(jqXHR);
                            container.css("opacity", 1);
                            var script = $('script', container.get(0)).get(0); // Если в инструменте есть тег скрипт - эта приписка его запустит
                            if (script) {
                                var start = new Function ('', script.innerHTML);
                                start();
                            }
                        }
                    }
                });
            },
            "standBy": function() {
                var that = this;
                for(var i=0; i<that.listeners.length; i++) {
                    that.off(that.listeners[i]);
                }
                that.listeners = [];
            }
        });

        requirejs._moduleExecute(moduleName);
        return Widget;
    });
})();
