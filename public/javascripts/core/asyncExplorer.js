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
                    $('#errorModal').modal('hide');
                    if (!core.content.isHidden) {
                        core.content.hide();
                    }
                    $('#carett').html('');
                    $('#cover').css('display', 'none');
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
                if (address[address.length-1].length == 0) {
                    address.pop();
                }
                address[address.length-1] = address[address.length-1].split("?")[0];
                route = (address.length == 1) || (address.length == 3 && address[1] === "") ? "main" : address[address.length-1].length > 23 ? address[address.length-2] : address[address.length-1];

                if (route == "blog" || route == "photo" || route == "info" || route == "messages") {
                    core.activePage = new that.pages[ route == address[address.length - 1] ? address[address.length - 3] :address[address.length - 4] ]({
                        html: html,
                        type: route,
                        id: route == address[address.length - 1] ? address[address.length - 2] : address[address.length - 3],
                        oid: route == address[address.length - 1] ? undefined : address[address.length - 1]
                    });
                } else if (route == "user") {
                    core.activePage = new that.pages[route]({
                        html: html,
                        id: address[address.length - 1]
                    });
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