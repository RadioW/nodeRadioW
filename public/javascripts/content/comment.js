/**
 * Created by betrayer on 16.10.14.
 */
"use strict";

(function commentjs(){
    var moduleName = m.$comment;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function comment_module(){
        var Class = require(m.$class);

        var Comment = Class.inherit({
            "className": "Comment",
            "constructor": function(param) {
                var that = this;

                Class.call(that);

                that.author = param.commentator.id;
                that.authorName = param.commentator.name;
                that.type = param.type;
                that.status = param.status;
                that.id = param.commentID;
                that.contentId = param.id;

                that.initWrapper();
                if (that.status == "removed") {
                    that.pseudoRemove();
                } else {
                    that.remark(param);
                }
            },
            "initWrapper": function() {
                var that = this;
                var main = that.wrapper = $('<div class="comment" id="'+that.id+'">');
                var leftLayout = $('<div>');
                var authorPicture = $('<a href="/user/'+that.author+'/">');
                var authorImg = $('<img src="/data/' + that.author + '/avatar-xs.jpg">');
                authorPicture.append(authorImg);
                leftLayout.append(authorPicture);

                var rightLayout = that.rLayout = $('<div style="width:90%">');
                var infoDiv = that.infoDiv = $('<div>');
                var authorLink = $('<a href="/user/'+that.author+'/">');
                authorLink.html( that.authorName);
                infoDiv.append(authorLink);
                var date = that.dateWrapper = $('<span>');
                infoDiv.append(date);

                if (that.author == core.user.id) {
                    var editButton = that.editButton = $('<button class="btn btn-primary btn-xs">');
                    editButton.on("click", function () {
                        that.initRemark();
                    });
                    editButton.html("<i class='glyphicon glyphicon-pencil'></i>");

                    var removeButton = that.removeButton = $('<button class="btn btn-danger btn-xs">');
                    removeButton.on("click", function() {
                        core.activePage.emit("comment remove", {
                            type: that.type,
                            id: that.contentId,
                            oid: that.commentID
                        });
                    });
                    removeButton.html("<i class='glyphicon glyphicon-remove'></i>");

                    infoDiv.append(editButton);
                    infoDiv.append(removeButton);
                }
                var message = that.messageWrapper = $('<div>');
                rightLayout.append(infoDiv);
                rightLayout.append(message);
                main.append(leftLayout);
                main.append(rightLayout);
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

                var button = $('<button value="Сохранить" class="btn btn-primary">');
                button.on("click", function() {
                    core.activePage.emit('comment remark', {
                        type: that.type,
                        id: that.contentId,
                        oid: that.id,
                        message: area.val()
                    });
                    form.remove();
                    that.messageWrapper.css("display", "block");
                });
                form.append(button);
            },
            "remark": function(_params) {
                var that = this;
                that.message = _params.message;
                that.messageWrapper.html(_params.message);
                that.dateWrapper.html(" " + datify(_params.date) + " ");
            },
            "pseudoRemove": function() {
                var that = this; //todo baaaad solution;
                that.status = "removed";
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