/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
(function asyncExplorerjs() {
    var moduleName = m.$asyncExplorer;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function asyncExplorer_module() {
        var Class = require(m.$class);

        var AsyncExplorer = Class.inherit({
            "className": "AsyncExplorer",
            "constructor": function() {
                var that = this;

                Class.call(that);

                that.clickers();
                window.setTimeout (function () {
                    window.addEventListener("popstate", function(e) {
                        that.goTo(location.pathname);
                    }, false)
                }, 1);
            },
            "goTo": function (link) {
                var that = this;
                var pseudobody = $('#pseudoBody');
                $.ajax({
                    url: link,
                    method: "GET",
                    data: null,
                    statusCode: {
                        200: function(jqXHR) {
                            if (window.socket) {
                                window.socket.close();
                                window.socket = null;
                            }
                            if (window.contentrW) {
                                window.contentrW.link = true;
                                window.contentrW.wrapper.modal('hide');
                            }
                            $('#carett').html('');
                            $('#cover').css('display', 'none');
                            pseudobody.html(jqXHR);
                            var start = new Function ('callback', $('script', pseudobody.get(0)).get(0).innerHTML+'callback();');
                            start(function (){
                            });
                            that.clickers();

                        }
                    }
                });
            },
            "aJump": function(link) {
                var that = this;
                if (link.href == "http://"+location.host+"/log") return;
                link.onclick = function () {
                    that.goTo (link.href);
                    history.pushState(null, null, link.href);
                    $('#errorModal').modal('hide');
                    if (window.contentrW) {
                        window.contentrW.link = true;
                        window.contentrW.wrapper.modal('hide');
                    }
                    $('#carett').html('');
                    $('#cover').css('display', 'none');
                    return false;
                }
            },
            "clickers": function() {
                var that = this;
                $('a').each(function (index, link) {
                    that.aJump(link)
                });
            }
        });
        requirejs._moduleExecute(moduleName);
        return AsyncExplorer;
    });
})();