/**
 * Created by betrayer on 16.10.14.
 */
"use strict";

(function commentjs(){
    var moduleName = m.message.$comment;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$message);

    define(moduleName, defineArray, function comment_module(){
        var Message = require(m.$message);

        var Comment = Message.inherit({
            "className": "Comment",
            "constructor": function(param) {
                var that = this;
                Message.fn.constructor.call(that, param);
            },
            "initParams": function(params) {
                var that = this;
                Message.fn.initParams.call(that, params);

                $.extend(that.stateList, {
                    "removed": that.pseudoRemove
                });
                that.contentId = params.contentId
            },
            "initWrapper": function() {
                var that = this;

                Message.fn.initWrapper.call(that);
                if (that.user.id == core.user.id) {
                    var editButton = that.editButton = $('<button class="btn btn-primary btn-xs">');
                    editButton.on("click", function () {
                        editButton.prop("disabled", true);
                        that.initRemark();
                    });
                    editButton.html("<i class='glyphicon glyphicon-pencil'></i>");

                    var removeButton = that.removeButton = $('<button class="btn btn-danger btn-xs">');
                    removeButton.on("click", function() {
                        core.content.emit("comment remove", {
                            type: that.type,
                            id: that.contentId,
                            oid: that.id
                        });
                    });
                    removeButton.html("<i class='glyphicon glyphicon-remove'></i>");

                    that.infoDiv.append(editButton);
                    that.infoDiv.append(removeButton);
                }
            },
            "initRemark": function() {
                var that = this;
                that.messageWrapper.css("display", "none");
                var form = $('<form class="comment">');
                form.on("submit", function(e){
                    e.preventDefault();
                    return false
                });
                that.rLayout.append(form);

                var area = $('<textarea class="form-control">');
                area.html(that.message.replace(/<br\/>/g, "\n"));
                form.append(area);
                form[0].onsubmit = function() {
                    return false;
                };

                var button = $('<button class="btn btn-primary">').html("Сохранить");
                button.on("click", function() {
                    core.content.emit('comment remark', {
                        type: that.type,
                        id: that.contentId,
                        oid: that.id,
                        message: area.val()
                    });
                    form.remove();
                    that.messageWrapper.css("display", "block");
                    that.editButton.prop("disabled", false);
                });
                form.append(button);
            },
            "remark": function(_params) {
                this.initContent(_params);
            },
            "pseudoRemove": function() {
                var that = this; //todo baaaad solution;
                that.state = "removed";
                //that.wrapper.style.backgroundColor = "#DDDDDD"; that looks not so good =(
                that.message = "";
                that.messageWrapper.empty();
                that.messageWrapper.css("display", "none");
                if (that.removeButton)
                    that.removeButton.css("display", "none");
                if (that.editButton)
                    that.editButton.css("display", "none");
                var removedMessage = $('<span>');
                removedMessage.html("Сообщение удалено");
                that.infoDiv.append(removedMessage);
            },
            "remove": function() {
                this.wrapper.remove();
                this.destructor()
            }
        });

        requirejs._moduleExecute(moduleName);
        return Comment;
    });
})();