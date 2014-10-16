/**
 * Created by betrayer on 16.10.14.
 */
"use strict";
(function contentjs () {
    var moduleName = m.$content;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);
    defineArray.push(m.$comment);

    define(moduleName, defineArray, function content_module() {
        var Class = require(m.$class);
        var Comment = require(m.$comment);

        var Content = Class.inherit({
            "className": "Content",
            "constructor": function() {
                var that = this;

                Class.call(that);

                that.initWrapper();
                that.initHandlers();
                that.isHidden = true;
                that.content = {};
                that.user = {};
                that.comments = {};
            },
            "initWrapper": function() {
                var that = this;
                var mainWrapper = that.wrapper = $('<div class="modal fade" id="contentModal" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="contentModalLabel">');
                var _subWrap1 = $('<div class="modal-dialog modal-lg">');
                var _subWrap2 = $('<div class="modal-content">');
                var _subWrap3 = $('<div style="overflow:hidden;">');
                mainWrapper.append(_subWrap1);
                _subWrap1.append(_subWrap2);
                _subWrap2.append(_subWrap3);
                var modalBody = that.body = $('<div class="modal-body">');
                var modalFooter = that.footer = $('<div class="modal-footer">');
                _subWrap3.append(modalBody);
                _subWrap3.append(modalFooter);
                var _subWrapb1 = $('<div class="row">');
                var _subWrapb2 = $('<div class="row">');
                modalBody.append($('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'));
                modalBody.append(_subWrapb1);
                modalBody.append(_subWrapb2);
                var _subWrapb11 = $('<div class="col-xs-12">');
                var _subWrapb21 = $('<div class="col-xs-12">');
                _subWrapb1.append(_subWrapb11);
                _subWrapb2.append(_subWrapb21);

                var content = that.contentWrapper = $('<div class="contentWrap" id="contentModalMessage">');
                _subWrapb11.append(content);

                var uploadDate = that.uploadDateWrapper = $("<p>");
                _subWrapb11.append(uploadDate);

                var descriptionForm = that.descriptionForm = $('<form id="contentDescription">');
                _subWrapb21.append(descriptionForm);

                var subWrap3 = $('<div class="row">');
                var buttonsBar = that.buttons = $('<div class="col-xs-12 text-right">');
                modalBody.append(subWrap3);
                subWrap3.append(buttonsBar);

                var commentForm = $('<form class="comment">');
                commentForm.on('submit', function (e) {
                    core.activePage.emit("comment", {
                        type: that.content.type,
                        id: that.content.id,
                        message: that.commentArea.val()
                    });
                    that.commentArea.val("");
                    e.preventDefault();
                });
                that.commentArea = $('<textarea class="form-control">');
                commentForm.append(that.commentArea);
                commentForm.append($('<input type="submit" class="btn btn-primary">'));
                modalFooter.append(commentForm);

                var commentsWrapper = that.commentsWrapper = $('<div id="comments">');
                modalFooter.append(commentsWrapper);
                $('body').prepend(that.wrapper);
            },
            "appendContent": function(_params) {
                var that = this;
                if (_params.content.next) {
                    var leftBar = $('<div class="contentScrollArrow" style="left:0">');
                    leftBar.on('click', function () {
                        core.activePage.subscribeContent(_params.user.id, _params.content.next.type, _params.content.next.id);
                    });
                    that.contentWrapper.append(leftBar);
                }
                that.contentWrapper.append(_params.content.tag);  //todo binary
                if (that.content.type != "photo") {
                    that.contentWrapper.css("height", "");
                }
                if (_params.content.prev) {
                    var rightBar = $('<div class="contentScrollArrow" style="right:0">');
                    rightBar.on('click', function () {
                        core.activePage.subscribeContent(_params.user.id, _params.content.prev.type, _params.content.prev.id);
                    });
                    that.contentWrapper.append(rightBar);
                }
            },
            "setUploadDate": function (_params) {
                var that = this;
                var subWord = "";
                switch (_params.content.type) {
                    case 'photo':
                    case 'video':
                        subWord = "Загружено ";
                        break;
                    case 'blog':
                        subWord = "Написано ";
                        break;
                }
                that.uploadDateWrapper.html(subWord + datify(_params.content.date));
                that.uploadDate = _params.content.date;
            },
            "setDescription": function(_description) {
                var that = this;
                if (that.content.type == "blog") {
                    return;
                }
                if (that.descriptionWrapper) {
                    that.descriptionWrapper.remove();
                }
                that.descriptionWrapper = $('<div>');
                that.description = _description;
                that.descriptionWrapper.html(_description);

                if (core.user.id == that.user.id) {
                    that.descriptionWrapper.on("click", function () {
                        that.editDescription()
                    });
                    that.descriptionWrapper.html(_description || "Редактировать описание");
                    that.descriptionForm.append(that.descriptionWrapper);
                }
            },
            "setButtons": function(_params) {
                var that = this;
                switch (_params.content.type) {
                    case 'photo':
                        if (core.user.id == _params.user.id && !_params.content.isAvatar) {
                            var buttonRemove = $('<button type="button" class="btn btn-danger">');
                            buttonRemove.on('click', function () {
                                removePhoto(that.content.id);
                            });
                            buttonRemove.html('Удалить');
                            var buttonMakeAvatar = $('<button type="button" class="btn btn-primary">');
                            buttonMakeAvatar.on('click', function () {
                                makeThisAva(that.content.id);
                            });
                            buttonMakeAvatar.html('Сделать аватаркой');
                            that.buttons.append(buttonRemove);
                            that.buttons.append(buttonMakeAvatar);
                        }
                        break;
                }
            },
            "initHandlers": function() {
                var that = this;

                that.wrapper.on('hidden.bs.modal', function() {
                    that.isHidden = true;
                    that.clear();
                    core.activePage.emit('unsubscribe');
                    if (!that.notPushState) {
                        history.pushState(null, null, '/user/' + that.user.id + "/" + that.content.type + "/"); //todo it's a mistake!
                    }
                    that.notPushState = false;
                });
                that.wrapper.on('shown.bs.modal', function() {
                    that.isHidden = false;
                });
            },
            "show": function(_params, notPushState) {
                var that = this;
                if (!that.hidden) {
                    that.clear();
                }
                that.content.id = _params.content.id;
                that.content.type = _params.content.type;
                that.user.id = _params.user.id;
                that.contentWrapper.empty();
                that.initComments(_params.comments);
                that.appendContent(_params);
                that.setUploadDate(_params);
                that.setDescription(_params.content.description);
                that.setButtons(_params);

                if (!notPushState) {
                    history.pushState(null, null, '/user/' + that.user.id + '/' + that.content.type + '/' + that.content.id);
                }
                that.link = false;

                if (that.isHidden) {
                    that.wrapper.modal('show');
                }
                core.explorer.clickers($('a', that.wrapper[0]));

                switch (_params.content.type) {
                    case 'photo':
                        var img = $('#fullSizeImg');
                        img.on('load', function () {
                            img.css("opacity", 1);
                            that.contentWrapper.css("height", "");
                        });
                        break;
                }
            },
            "clear": function() {
                var that = this;
                var tempHeight = that.contentWrapper.height();
                that.contentWrapper.css("height", tempHeight+"px");
                that.contentWrapper.empty();
                that.buttons.empty();

                for (var key in that.comments) {
                    if (that.comments.hasOwnProperty(key)) {
                        that.removeComment(key);
                    }
                }
            },
            "hide": function() {
                var that = this;
                that.notPushState = true;
                that.wrapper.modal('hide');
            },
            "dropDescriptionEditing": function() {
                var that = this;
                $.ajax({
                    url: '/user/photoDescription/'+that.content.id,
                    method: 'POST',
                    data: $('#contentDescription').serialize(),
                    statusCode: {
                        200: function(jqXHR) {
                            that.setDescription(jqXHR);
                        },
                        404: function () {
                            launchModal('Фотография не найдена!');
                        },
                        403: function () {
                            launchModal('Вам запрещена данная операция');
                        },
                        500: function () {
                            launchModal('Ошибка! Что-то пошло не так.');
                        }
                    }
                });
                that.descriptionArea.remove();
                delete that.descriptionArea;
            },
            "editDescription": function() {
                var that = this;
                that.descriptionWrapper.remove();
                var area = that.descriptionArea =  $('<textarea placeholder="Введите описание" class="description" name="description">');
                if (that.description && that.description.toLowerCase() != 'редактировать описание') {
                    area.val(that.description);
                }
                area.blur(function() {
                    that.dropDescriptionEditing();
                });
                that.descriptionForm.append(area);
                area.focus();
            },
            "addComment": function(comment) {
                var that = this;
                var newComment = that.comments[comment.commentID] = new Comment(comment);
                that.commentsWrapper.prepend(newComment.wrapper);
                core.explorer.clickers(newComment.wrapper);
            },
            "removeComment": function(commentID) {
                this.comments[commentID].remove();
                delete this.comments[commentID];
            },
            "initComments": function(_opts) {
                var that = this;
                if (_opts && _opts instanceof Array) {
                    for (var i=0; i<_opts.length; i++) {
                        var newComment = that.comments[_opts[i].commentID] = new Comment(_opts[i]);
                        that.commentsWrapper.prepend(newComment.wrapper);
                    }
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Content;
    });
})();