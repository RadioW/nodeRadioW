/**
 * Created by betrayer on 15.12.14.
 */
(function tooljs(){
    var moduleName = m.$toolLauncher;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.tool.$visitors);
    defineArray.push(m.tool.$chat);

    define(moduleName, defineArray, function tool_module() {
        var Class = require(m.$class);
        var Visitors = require(m.tool.$visitors);
        var Chat = require(m.tool.$chat);

        var ToolLauncher = Class.inherit({
            "className": "ToolLauncher",
            "constructor": function() {
                var that = this;
                Class.fn.constructor.call(that);
                $(document.body).prepend($('<div id="toolBar">'));
                $(document.body).prepend($('<div id="toolsRestrictor">'));
                $(document.body).prepend($('<div id="toolsLayer">'));
                that.visitors = new Visitors();
                that.chat = new Chat();
            }
        });

        requirejs._moduleExecute(moduleName);
        return ToolLauncher;
    });
})();