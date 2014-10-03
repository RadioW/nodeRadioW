/**
 * Created by betrayer on 02.10.14.
 */
"use strict";
(function corejs() {
    var moduleName = m.$core;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.$asyncExplorer);
    defineArray.push(m.$connection);

    define(moduleName, defineArray, function core_module() {
        var Class = require(m.$class);
        var AsyncExplorer = require(m.$asyncExplorer);
        var Connection = require(m.$connection);

        var Core = Class.inherit({
            "className": "Core",
            "constructor": function() {
                var that = this;

                Class.call(that);

                that.connetion = new Connection();
                that.explorer = new AsyncExplorer();
            }
        });

        requirejs._moduleExecute(moduleName);
        return Core;
    });
})();