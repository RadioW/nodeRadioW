/**
 * Created by betrayer on 05.10.14.
 */
"use strict";
(function pageCollectionjs(){
    var moduleName = m.$pageCollection;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.page.$registration);
    defineArray.push(m.page.$user);
    defineArray.push(m.page.$chat);
    defineArray.push(m.page.$login);

    define(moduleName, defineArray, function pageCollection_module(){
        var PageCollection = {};
        var Page;
        for (var i=0; i<defineArray.length; i++) {
            Page = require(defineArray[i]);
            PageCollection[Page.title] = Page;
        }

        requirejs._moduleExecute(moduleName);
        return PageCollection;
    });
})();