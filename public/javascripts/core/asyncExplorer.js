/**
 * Created by betrayer on 03.10.14.
 */
"use strict";
(function asyncExplorerjs() {
    var moduleName = m.$asyncExplorer;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.$pageCollection);
    defineArray.push(m.$page);

    define(moduleName, defineArray, function asyncExplorer_module() {
        var Class = require(m.$class);
        var Page = require(m.$page);
        var PageCollection = require(m.$pageCollection);

        var AsyncExplorer = Class.inherit({
            "className": "AsyncExplorer",
            "constructor": function() {
                var that = this;

                Class.call(that);
                that.pages = PageCollection;
                that.clickers();
                window.setTimeout (function () {
                    window.addEventListener("popstate", function(e) {
                        that.goTo(location.pathname);
                    }, false)
                }, 1);
                var logout = $("#logoutHref").get(0);
                if (logout) {
                    logout.onclick = function() {
                        $.ajax({
                            url: "/logout",
                            method: "POST",
                            data: null
                        });
                        return false;
                    }
                }
            },
            "goTo": function (link) {
                var that = this;
                core.activePage.destructor();
                $('#errorModal').modal('hide');
                if (!core.content.isHidden) {
                    core.content.hide();
                }
                $('#carett').html('');
                $('#cover').css('display', 'none');
                $.ajax({
                    url: link,
                    method: "GET",
                    data: null,
                    statusCode: {
                        200: function(jqXHR) {
                            that.openPage(link, jqXHR);
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
                    return false;
                }
            },
            "clickers": function(collection) {
                var that = this;
                collection = collection || $('a');
                collection.each(function (index, link) {
                    that.aJump(link)
                });
            },
            "openPage": function(link, html) {
                var that = this;

                link = link.split ? link: link.href;

                var route;
                var address = link.split("/");
                var params = [];
                if (address[0].toLowerCase() === "http") {
                    address.splice(0, 2);
                }
                if (address[0].indexOf(location.host) !== -1) {
                    address.splice(0, 1);
                }
                if (address[address.length-1].length == 0) {
                    address.pop();
                }

                for (var i = 0; i < address.length; ++i) {
                    route = address[i].toLocaleLowerCase();
                    if (address[i+1] && address[i+1].length > 23) {
                        params = address.splice(i+1, address.length -1 - i);
                        break;
                    }
                }
                if (!route) {
                    route = "main";
                }

                if (route === "user") {
                    core.activePage = new that.pages[route]({
                        html: html,
                        type: params[1],
                        id: params[0],
                        oid: params[2]
                    })
                } else if (that.pages[route]) {
                    core.activePage = new that.pages[route]({
                        html: html
                    });
                } else {
                    core.activePage = new Page({
                        html: html,
                        route: route
                    });
                }
            }
        });
        requirejs._moduleExecute(moduleName);
        return AsyncExplorer;
    });
})();