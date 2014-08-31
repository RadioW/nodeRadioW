/**
 * Created by betrayer on 24.08.14.
 */
"use strict";
function Comment(_opts) {
    var main = this.wrapper = document.createElement("div");
    main.className = "comment";
    main.id = this.id = _opts.commentID;

    var leftLayout = document.createElement("div");
    var authorPicture = document.createElement("a");
    authorPicture.href = "/user/" + _opts.commentator.id;
    var authorImg = document.createElement("img");
    authorImg.src = "/data/" + _opts.commentator.id + "/avatar-xs.jpg";
    authorPicture.appendChild(authorImg);
    leftLayout.appendChild(authorPicture);


    var rightLayout = this.rLayout = document.createElement("div");
    rightLayout.style.width = "90%";
    var infoDiv = document.createElement("div");
    var authorLink = document.createElement("a");
    authorLink.href = "/user/" + _opts.commentator.id;
    authorLink.innerHTML = _opts.commentator.name;
    infoDiv.appendChild(authorLink);
    var date = this.dateWrapper = document.createElement("span");
    date.innerHTML = " " + datify(_opts.date) + " ";
    infoDiv.appendChild(date);

    if (_opts.commentator.id == _myID) {
        var button = document.createElement('button');
        button.className = "btn btn-primary btn-xs";
        button.onclick = function(id, i) {
            return function() {
                return remarkComment(this, 'photo', id, i);
            };
        }(_opts.id, _opts.index);
        button.innerHTML = "<i class='glyphicon glyphicon-pencil'></i>";
        infoDiv.appendChild(button);
    }
    // TODO buttons

    var message = this.messageWrapper = document.createElement("div");
    message.innerHTML = this.message = _opts.message;
    rightLayout.appendChild(infoDiv);
    rightLayout.appendChild(message);

    main.appendChild(leftLayout);
    main.appendChild(rightLayout);

    this.remark = function(_params) {
        this.messageWrapper = document.createElement("div");
        this.messageWrapper.innerHTML = this.message = _params.message;
        this.rLayout.appendChild(this.messageWrapper);
        this.dateWrapper.innerHTML = " " + datify(_params.date) + " ";
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

    that.setDescription = function(_params) {
        that.descriptionWrapper = $('<div>');
        that.description = _params.content.description;
        that.descriptionWrapper.html(_params.content.description);

        if (_myID == _params.user.id) {
            that.descriptionWrapper.on("click", function () {
                transformDivToInput(this, _params.content.id)
            });
            that.descriptionWrapper.html(_params.content.description || "редактировать описание");
        }
    };
    that.setDescription(_opts);
    descriptionForm.append(that.descriptionWrapper);

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
    window.content = that;
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
        that.setDescription(_params);
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
    }
}
$.extend(Content, {
    "getInstance": function(_opts) {
        var that = window.content;
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