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
                that.initPreviewWrapper();
                if (param.right) {
                    that.moveRight();
                } else {
                    that.moveLeft()
                }
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
            "initPreviewWrapper": function() {
                var that = this;
                that.previewWrapper = $('<div class="dialogue-label">');
                that.previewWrapper.append($('<img src="/data/' + that.user.id + '/avatar-md.jpg">'));
                that.previewWrapper.append($('<p>').html(that.user.name));

                that.previewUnreadedLabel = $('<h4 class="messages-label">').css("right", "0");
                that.previewUnreadedSpan = $('<span>').html(that.unreaded);
                that.previewWrapper.append(that.previewUnreadedLabel
                    .append($('<span  class="label label-primary">')
                        .html('<span class="glyphicon glyphicon-envelope"> </span>' + " ").append(that.previewUnreadedSpan)));
                if (that.unreaded == 0) {
                    that.previewUnreadedLabel.css("display", "none");
                }
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
                that.avatarWrapper = $('<img src="/data/' + param.user.id + '/avatar-md.jpg">');
                that.nicNameWrapper = $('<p>').html(param.user.name);
                that.wrapper
                    .append(that.avatarWrapper)
                    .append(that.nicNameWrapper);

                that.wrapper.append(that.container);
                that.container.append(that.message.wrapper);
                that.unreadedLabel = $('<h4 class="messages-label">');
                that.unreadedSpan = $('<span>').html(param.unreaded);
                that.wrapper.append(that.unreadedLabel.append($('<span  class="label label-primary">').html('<span class="glyphicon glyphicon-envelope"> </span>' +" ").append(that.unreadedSpan)));
                if (param.unreaded == 0) {
                    that.unreadedLabel.css("display", "none");
                }
                that.user = param.user;
                that.id = param.id;
                that.unreaded = param.unreaded;
            },
            "update": function(data) {
                var that = this;
                that.message.destructor();
                that.message = new Message(data.lastMessage);
                that.container.append(that.message.wrapper);
                that.user = data.user;
                that.id = data.id;
                that.unreaded = data.unreaded;
                that.previewUnreadedSpan.html(that.unreaded);
                that.unreadedSpan.html(that.unreaded);
                if (that.unreaded == 0) {
                    that.previewUnreadedLabel.css("display", "none");
                    that.unreadedLabel.css("display", "none");
                } else {
                    that.previewUnreadedLabel.css("display", "block");
                    that.unreadedLabel.css("display", "block");
                }
            },
            "moveLeft": function() {
                var that = this;
                that.avatarWrapper.css({right: "10px", left:""});
                that.nicNameWrapper.css({float:"right", "text-align":"right"});
                that.wrapper.css("padding", "0 120px 0 0");
                that.unreadedLabel.css({
                    right: 0,
                    left: ""
                })
            },
            "moveRight": function() {
                var that = this;
                that.avatarWrapper.css({right: "", left:"10px"});
                that.nicNameWrapper.css({float:"left", "text-align":"left"});
                that.wrapper.css("padding", "0 0 0 120px");
                that.unreadedLabel.css({
                    right: "",
                    left: 0
                })
            }
        });

        requirejs._moduleExecute(moduleName);
        return Dialogue;
    });
})();