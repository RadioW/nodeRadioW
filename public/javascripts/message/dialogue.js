/**
 * Created by betrayer on 04.12.14.
 */
(function dialoguejs(){
    var moduleName = m.$dialogue;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.$message);

    define(moduleName, defineArray, function dialogue_module() {
        var Class = require(m.$class);
        var Message = require(m.$message);

        var Dialogue = Class.inherit({
            "className": "Dialogue",
            "constructor": function(param) {
                var that = this;

                Class.call(this);

                that.initWrapper(param);
            },
            "destructor": function() {
                var that = this;
                that.message.destructor();
                delete that.message;
                that.wrapper.empty();
                that.wrapper.off();
                that.wrapper.remove();
                delete that.wrapper;

                Class.fn.destructor.call(that);
            },
            "initWrapper": function(param) {
                var that = this;
                that.wrapper = $('<div class="dialogue" id="' + param.id + '">');
                that.container = $('<div>').css({
                    "height": "75px",
                    "width": "100%",
                    "margin-top": "-10px",
                    "float": "left"
                });
                that.message = new Message(param.lastMessage);

                if (param.right) {
                    that.wrapper
                        .append($('<img style="left:10px" src="/data/' + param.user.id + '/avatar-md.jpg">'))
                        .append($('<p style="float:left; text-align:left">').html(param.user.name));
                    that.wrapper.css("padding-left", "120px");
                } else {
                    that.wrapper
                        .append($('<img style="right:10px" src="/data/' + param.user.id + '/avatar-md.jpg">'))
                        .append($('<p style="float:right; text-align:right">').html(param.user.name));
                    that.wrapper.css("padding-right", "120px");
                }
                that.wrapper.append(that.container);
                that.container.append(that.message.wrapper);

                if (param.unreaded != 0) {
                    that.wrapper.append($('<h4 class="messages-label">').append($('<span  class="label label-primary">').html('<span class="glyphicon glyphicon-envelope"> </span>' +" " + param.unreaded)));
                }

                that.user = param.user;
                that.id = param.id;
                that.unreaded = param.unreaded;
            }
        });

        requirejs._moduleExecute(moduleName);
        return Dialogue;
    });
})();