/**
 * Created by betrayer on 24.08.14.
 */
"use strict";
function Comment(_opts) {
    var that = this;
    that.author = _opts.commentator.id;
    that.type = _opts.type;
    var main = that.wrapper = document.createElement("div");
    main.className = "comment";
    main.id = that.id = _opts.commentID;
    that.status = _opts.status; //todo

    var leftLayout = document.createElement("div");
    var authorPicture = document.createElement("a");
    authorPicture.href = "/user/" + that.author;
    var authorImg = document.createElement("img");
    authorImg.src = "/data/" + that.author + "/avatar-xs.jpg";
    authorPicture.appendChild(authorImg);
    leftLayout.appendChild(authorPicture);

    var rightLayout = that.rLayout = document.createElement("div");
    rightLayout.style.width = "90%";
    var infoDiv = document.createElement("div");
    var authorLink = document.createElement("a");
    authorLink.href = "/user/" + that.author;
    authorLink.innerHTML = _opts.commentator.name;
    infoDiv.appendChild(authorLink);
    var date = that.dateWrapper = document.createElement("span");
    date.innerHTML = " " + datify(_opts.date) + " ";
    infoDiv.appendChild(date);

    if (that.author == _myID) {
        var editButton = document.createElement('button');
        editButton.className = "btn btn-primary btn-xs";
        editButton.onclick = function () {
            that.initRemark();
        };
        editButton.innerHTML = "<i class='glyphicon glyphicon-pencil'></i>";

        var removeButton = document.createElement('button');
        removeButton.className = "btn btn-danger btn-xs";
        removeButton.onclick = function(type, id, oid) {
            return function() {
                socket.emit("comment remove", type, id, oid);
            }
        }(_opts.type, _opts.id, _opts.commentID);
        removeButton.innerHTML = "<i class='glyphicon glyphicon-remove'></i>";

        infoDiv.appendChild(editButton);
        infoDiv.appendChild(removeButton);
    }
    // TODO buttons

    var message = that.messageWrapper = document.createElement("div");
    message.innerHTML = that.message = _opts.message;
    rightLayout.appendChild(infoDiv);
    rightLayout.appendChild(message);

    main.appendChild(leftLayout);
    main.appendChild(rightLayout);

    that.initRemark = function() {
        that.messageWrapper.style.display = "none";
            var form = document.createElement('form');
            form.onsubmit = function(){return false};
            form.className = 'comment';
            that.rLayout.appendChild(form);

            var area = document.createElement('textarea');
            area.innerHTML = that.message.replace(/<br\/>/g, "\n");
            area.className = 'form-control';
            form.appendChild(area);

            var button = document.createElement('input');
            button.type = "submit";
            button.value = "Сохранить";
            button.className = "btn btn-primary";
            button.onclick = function() {
                socket.emit('comment remark', area.value, that.type, _opts.id, _opts.index);
                that.rLayout.removeChild(form);
                that.messageWrapper.style.display = "block";
            };
            form.appendChild(button);
    };

    that.remark = function(_params) {
        that.messageWrapper.innerHTML = that.message = _params.message;
        that.dateWrapper.innerHTML = " " + datify(_params.date) + " ";
    };

    that.pseudoRemove = function() {
        that.status = "removed";
        //that.wrapper.style.backgroundColor = "#DDDDDD"; that looks not so good =(
        that.message = "";
        message.innerHTML = "";
        message.style.display = "none";
        if (removeButton)
            removeButton.style.display = "none";
        if (editButton)
            editButton.style.display = "none";
        var removedMessage = document.createElement("span");
        removedMessage.innerHTML = "Сообщение удалено";
        infoDiv.appendChild(removedMessage);
    };

    that.remove = function() {
        that.wrapper.remove();
    };

    if (that.status == "removed") {
        that.pseudoRemove();
    }
}

function CommentRoll(_opts) {
    var that = this;

    that.wrapper = $('<div id="comments">');

    that.add = function (_comment) {
        var comment = that[_comment.commentID] = new Comment(_comment);
        that.wrapper.prepend(comment.wrapper);
        clickers();
    };

    that.remove = function(_commentID) {
        that[_commentID].remove();
        delete that[_commentID];
    };

    if (_opts && _opts instanceof Array) {
        for (var i=0; i<_opts.length; i++) {
            that.add(_opts[i]);
        }
    }
}


function Content(_opts) {
    var that = this;
    that.link = false;
    that.content = {
        id: _opts.content.id,
        type: _opts.content.type
    };
    that.user = {
        id: _opts.user.id
    };
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

    that.appendContent = function(_params) {
        if (_params.content.next) {
            var leftBar = $('<div class="contentScrollArrow" style="left:0">');
            leftBar.on('click', function() {
                subscribeContent(_params.user.id, _params.content.next.type, _params.content.next.id);
            });
            content.append(leftBar);
        }

        content.append(_params.content.tag);  //todo binary
        if (that.content.type != "photo") {
            that.contentWrapper.css("height", "");
        }

        if (_params.content.prev) {
            var rightBar = $('<div class="contentScrollArrow" style="right:0">');
            rightBar.on('click', function() {
                subscribeContent(_params.user.id, _params.content.prev.type, _params.content.prev.id);
            });
            content.append(rightBar);
        }
    };

    that.appendContent(_opts);

    var uploadDate = that.uploadDateWrapper = $("<p>");
    that.setUploadDate = function (_params) {
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
    };
    that.setUploadDate(_opts);
    _subWrapb11.append(uploadDate);
    var descriptionForm = $('<form id="contentDescription">');
    _subWrapb21.append(descriptionForm);

    that.setDescription = function(_description) {
        if (that.content.type == "blog") {
            return;
        }
        if (that.descriptionWrapper) {
            that.descriptionWrapper.remove();
        }
        that.descriptionWrapper = $('<div>');
        that.description = _description;
        that.descriptionWrapper.html(_description);

        if (_myID == that.user.id) {
            that.descriptionWrapper.on("click", function () {
                that.editDescription()
            });
            that.descriptionWrapper.html(_description || "Редактировать описание");
            descriptionForm.append(that.descriptionWrapper);
        }
    };
    that.setDescription(_opts.content.description);

    var subWrap3 = $('<div class="row">');
    var buttonsBar = that.buttons = $('<div class="col-xs-12 text-right">');
    modalBody.append(subWrap3);
    subWrap3.append(buttonsBar);

    that.setButtons = function(_params) {
        switch (_params.content.type) {
            case 'photo':
                if (window._myID == _params.user.id && !_params.content.isAvatar) {
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
    };
    that.setButtons(_opts);

    if (window._myID) {
        var commentForm = $('<form class="comment">');
        commentForm.on('submit', function(e) {
            comment(commentForm.get(0), 'photo', that.content.id);
            e.preventDefault();
        });
        commentForm.append($('<textarea class="form-control">'));
        commentForm.append($('<input type="submit" class="btn btn-primary">'));
        modalFooter.append(commentForm);
    }

    var commentsRoll = that.comments = new CommentRoll(_opts.comments);
    modalFooter.append(commentsRoll.wrapper);

    $('body').prepend(that.wrapper);
    that.wrapper.modal('show');
    window.contentrW = that;
    history.pushState(null, null, '/user/'+that.user.id+'/'+that.content.type+'/'+that.content.id);
    clickers();

    that.wrapper.on('hidden.bs.modal', function() {
        that.isHidden = true;
        socket.emit('unsubscribe'); //todo
        if (!that.link) {
            history.pushState(null, null, '/user/' + that.user.id);
        }
        that.link = false;
    });
    that.wrapper.on('shown.bs.modal', function() {
        that.isHidden = false;
    });

    that.initPostEvents = function(type) {
        switch (type) {
            case 'photo':
                var img = $('#fullSizeImg');
                img.on('load', function () {
                    img.css("opacity", 1);
                    that.contentWrapper.css("height", "");
                });
                break;
        }
    };
    that.initPostEvents(_opts.content.type);

    that.rebuild = function(_params) {
        that.content.id = _params.content.id;
        that.content.type = _params.content.type;
        that.user.id = _params.user.id;
        var tempHeight = that.contentWrapper.height();
        that.contentWrapper.css("height", tempHeight+"px");
        that.contentWrapper.empty();

        that.appendContent(_params);
        that.setUploadDate(_params);
        that.setDescription(_params.content.description);
        that.buttons.empty();
        that.setButtons(_params);
        that.comments.wrapper.remove();
        that.comments = new CommentRoll(_params.comments);
        that.footer.append(that.comments.wrapper);
        that.initPostEvents(_params.content.type);
        if (!that.link) {
            history.pushState(null, null, '/user/' + that.user.id + '/' + that.content.type + '/' + that.content.id);
        }
        that.link = false;
        clickers();
    };
    that.refresh = function() {
        subscribeContent(that.user.id, that.content.type, that.content.id);
    };
    that.editDescription = function() {
        that.descriptionWrapper.remove();
        var area = that.descriptionArea =  $('<textarea placeholder="Введите описание" class="description" name="description">');
        if (that.description && that.description.toLowerCase() != 'редактировать описание') {
            area.val(that.description);
        }
        area.blur(function() {
            that.dropDescriptionEditing();
        });
        descriptionForm.append(area);
        area.focus();
    };

    that.dropDescriptionEditing = function() {
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
    }
}
$.extend(Content, {
    "getInstance": function(_opts) {
        var that = window.contentrW;
        if (that) {
            that.rebuild(_opts);
            if (that.isHidden) {
                that.wrapper.modal('show');
            }
        } else {
            return new Content(_opts);
        }
    }
});