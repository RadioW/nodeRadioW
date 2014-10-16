/**
 * Created by betrayer on 05.10.14.
 */
"use strict";

(function userjs(){
    var moduleName = m.page.$user;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);
    defineArray.push(m.widget.$info);

    define(moduleName, defineArray, function registration_module(){
        var Page = require(m.$page);
        var Info = require(m.widget.$info);
        var User = Page.inherit({
            "className": "User",
            "websocket": true,
            "constructor": function(params) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "user"
                });
                that.widgets = {
                    info: new Info({
                        userId: params.id
                    })
                }

            },
            "run": function() {
                var that = this;

                that.on('connection', function() {
                    that.emit('join', core.user.id);
                });
                that.on('free', function() {
                    var div = $('#usernameInput').get(0);
                    div.className = 'form-group has-success has-feedback';
                    div.children[1].className = 'xs form-control-feedback glyphicon glyphicon-ok';
                });

                that.on('buzy', function() {
                    var div = $('#usernameInput').get(0);
                    div.className = 'form-group has-error has-feedback';
                    div.children[1].className = 'xs form-control-feedback glyphicon glyphicon-remove';
                });

                that.on('newBlog', function(data) {
                    var message = data.message, date = data.date, user = data.author, id = data.id;

                    var blog = document.createElement('div');
                    blog.className = "blogPost";
                    blog.style.height = 0;
                    blog.innerHTML = "<div class='row'><div class='col-xs-12'><p>"+message+"</p></div></div>";
                    $('#miniBlogRoll').prepend(blog);
                    setTimeout(function() {blog.style.height = "";}, 50);

                    if ($('#blogRoll').get(0)) {
                        var bigBlog = document.createElement('div');
                        bigBlog.className = "blogPost";
                        bigBlog.style.height = 0;
                        bigBlog.onclick = function() {
                            subscribeContent('<%- user._id -%>', 'blog', id);
                        };
                        bigBlog.innerHTML = "<div class='row'><div class='col-xs-12'><p>"+message+"</p></div><div class='col-xs-12'><em>"+user+" "+datify(date)+"</em></div></div>";
                        $('#blogRoll').children().prepend(bigBlog);
                        setTimeout(function() {bigBlog.style.height = '';}, 50)
                    }

                });

                that.on('new photo', function(files) {
                    if (!$('#photoRoll').get(0)) return;
                    for (var i=0; i<files.length; i++) {
                        var img = document.createElement('img');
                        img.src = files[i]+'prev.jpg';
                        var slot = document.createElement('div');
                        slot.className = 'photoPrev';
                        slot.onclick = function() {
                            var file = files[i].slice(files[i].lastIndexOf('/')+1);
                            return function () {
                                that.subscribeContent('<%- user._id -%>', 'photo', file);
                            }
                        }();
                        slot.appendChild(img);
                        $('#photoRoll').children('.row').prepend(slot);
                    }
                });



                that.on('removed photo', function(id) {
                    if ($('#'+id).get(0)) $('#'+id).remove();
                });

                that.on('error', function(err) {
                    launchModal('Извините, произошла ошибка!</br>'+err);
                });

                that.on('new comment', function(ans) {
                    core.content.addComment(ans);
                });

                that.on('remark comment', function(ans){
                    if (window.contentrW && window.contentrW.comments && window.contentrW.comments[ans.commentID]) {
                        window.contentrW.comments[ans.commentID].remark(ans);
                    }
                });

                that.on('remove comment', function(ans){
                    if (window.contentrW && window.contentrW.comments && window.contentrW.comments[ans]) {
                        var comment = window.contentrW.comments[ans];
                        if (comment.author == core.user.id) {
                            comment.pseudoRemove();
                        } else {
                            window.contentrW.comments.remove(ans);
                        }
                    }
                });

                that.on("subscription", function(ans) {
                    core.content.show(ans);
                });

                $('.thumbnail-v').each(function (i, quad) {
                    quad.onclick = function() {
                        showQuad(quad);
                        return false;
                    }
                });

                Page.fn.run.call(that);
            },
            "subscribeContent": function (userId, type, contentId) {
                this.emit('subscribe', {
                    userId: userId,
                    contentType: type,
                    contentId: contentId
                });
            },
            "comment": function (form, type, id) {
                var that = this;
                var message = form.children[0].value;
                form.children[0].value = "";
                that.emit('comment', message, type, id);
                return false;
            }
        });

        $.extend(User, {
            "title": "user"
        });

        requirejs._moduleExecute(moduleName);
        return User;
    });
})();