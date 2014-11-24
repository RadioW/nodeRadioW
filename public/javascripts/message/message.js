/**
 * Created by betrayer on 19.11.14.
 */
"use strict";
(function messagejs() {
    var moduleName = m.$message;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function comment_module(){
        var Class = require(m.$class);

        var Message = Class.inherit({
            "className": "Message",
            "constructor": function(param) {
                var that = this;

                Class.call(that);

                that.stateList = {};
                that.initParams(param);
                that.initWrapper();
                that.initContent(param);
                that.initHrefs();
            },
            "initHrefs": function() {
                core.explorer.clickers($('a', this.wrapper[0]));
            },
            "initParams": function(param) {
                var that = this;

                that.user = {
                    id: param.user.id,
                    name: param.user.name
                };
                that.type = param.type;
                that.state = param.state;
                that.id = param.id;
            },
            "initWrapper": function() {
                var that = this;
                var main = that.wrapper = $('<div class="comment" id="'+that.id+'">');
                var leftLayout = $('<div>');
                var authorPicture = $('<a href="/user/'+that.user.id+'/">');
                var authorImg = $('<img src="/data/' + that.user.id + '/avatar-xs.jpg">');
                authorPicture.append(authorImg);
                leftLayout.append(authorPicture);

                var rightLayout = that.rLayout = $('<div>').css("width", "calc(100% - 70px)");
                var infoDiv = that.infoDiv = $('<div>');
                var authorLink = $('<a href="/user/'+that.user.id+'/">');
                authorLink.html(that.user.name);
                infoDiv.append(authorLink);
                var date = that.dateWrapper = $('<span>');
                infoDiv.append(date);

                var message = that.messageWrapper = $('<div>');
                rightLayout.append(infoDiv);
                rightLayout.append(message);
                main.append(leftLayout);
                main.append(rightLayout);
            },
            "initContent": function(_params) {
                var that = this;
                that.message = _params.message;
                that.messageWrapper.html(_params.message);
                that.dateWrapper.html(" " + datify(_params.date) + " ");
            },
            "status": function(state) {
                var that = this;

                if (state && typeof state == "string") {
                    if (state in that.stateList) {
                        that.stateList[state].call(that);
                        that.state = state;
                    }
                } else {
                    return that.status;
                }
            },
            "remove": function() {
                this.wrapper.remove();
                this.destructor()
            }
        });

        requirejs._moduleExecute(moduleName);
        return Message;
    });
})();