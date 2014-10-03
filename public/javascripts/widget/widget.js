/**
 * Created by betrayer on 01.10.14.
 */
"use strict";

(function widgetjs() {
    var moduleName = m.$widget;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function widget_module() {
        var Class = require(m.$class);

        var Widget = Class.inherit({
            "className": "Widget",
            "constructor": function(options) {
                var that = this;

                Class.call(that);

                that.href = "/";

                that.initWrapper();
                that.initroxy();
                that.initHandlers();
            },
            "initWrapper": function() {
                var that = this;
                that.wrapper = $('<div class="col-lg-4 col-md-6 col-lg-4-v col-md-6-v col-sm-6 col-sm-6-v">');
                var border = that.border = $('<div class="widgetBorder">');
                that.wrapper.append(border);
                var container = that.container = $('<div class="container-fluid" id="userBlogMini" style="height:100%">');
                border.append(container);
                $("#pseudoBody").append(that.wrapper);
            },
            "initHandlers": function() {
                var that = this;
                that.wrapper.on("click", that.proxy.expand)
            },
            "expand": function() {
                var that = this;
                that.wrapper.off("click", that.proxy.expand);

                var tool = that.expanded = $('<div class="container-fluid op">');
                tool.css("height", "100%");
                $.ajax({
                    url: that.href || "/",
                    method: 'GET',
                    data: null,
                    statusCode:{
                        200: function(jqXHR) {
                            tool.html(jqXHR);
                            tool.css("opacity", 1);
                            var script = $('script', tool.get(0)).get(0); // Если в инструменте есть тег скрипт - эта приписка его запустит
                            if (script) {
                                var start = new Function ('', script.innerHTML);
                                start();
                            }
                        }
                    }
                });
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
                    top: that.place.top+'px',
                    left: that.place.left-carett.p.left+'px'
                });

                carett.append(car);
                car.append(that.border);
                var cover = $('#cover');
                cover.css('display', 'block');

                setTimeout (function (){
                    cover.css('opacity', 0.5);
                    car.get(0).className = 'col-xs-12 col-lg-12-v col-md-12-v col-sm-12-v col-xs-12-v';
                    car.css({
                        width: '',
                        height: '',
                        position: 'relative',
                        top: '0px',
                        left: '0px'
                    });
                    cover.on("click", that.proxy.collapse);
                }, 1)
            },
            "collapse": function() {
                var that = this;
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
                    history.pushState(null, null, that.href.slice(0, that.href.lastIndexOf('/')));
                    that.wrapper.off("click", that.proxy.expand);
                }, 500)
            },
            "initProxy": function() {
                var that = this;
                that.proxy = {
                    "expand": $.proxy(that.expand, that),
                    "collapse": $.proxy(that.collapse, that)
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Widget;
    });
})();
