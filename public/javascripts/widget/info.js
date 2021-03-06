/**
 * Created by betrayer on 09.10.14.
 */
"use strict";
(function infojs(){
    var moduleName = m.widget.$info;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);
    defineArray.push(m.ui.$fileinput);

    define(moduleName, defineArray, function info_module() {
        var Widget = require(m.$widget);
        var Fileinput = require(m.ui.$fileinput);

        var Info = Widget.inherit({
            "className": "Info",
            "constructor": function(params) {
                var that = this;
                var baseOptions = {
                    "name": "Информация",
                    "path": "info",
                    "userId": "" //REQUIRED IN PARAMS!
                };

                $.extend(baseOptions, params);
                Widget.fn.constructor.call(that, baseOptions);
            },
            "initContent": function(pane) {
                var that = this;

                Widget.fn.initContent.call(that);

                pane.leftLayout = $('<div class="row">');
                pane.rightLayout = $('<div class="col-xs-6">');
                pane.content.append($('<div class="col-xs-6">').append(pane.leftLayout));
                pane.content.append(pane.rightLayout);
                that.emit("requestInfoShort", that.options.userId);
                pane.rightLayout.append($('<img src="/data/' + that.options.userId + '/avatar-sm.jpg?'+ Math.random() +'" id="avatar-sm" class="avatar-sm">'));
            },
            "initSockets": function(pane) {
                var that = this;

                that.on("responseInfoShort", function(user) {
                    that.userInfo = user.info;
                    that.userInfo.username = user.username;
                    that.setContent(pane);
                }, true);

                that.on('new avatar', function(avatarID) {
                    that.refreshAvatar();
                    that.userInfo.avatar = avatarID;
                }, true);
                Widget.fn.initSockets.call(that);
            },
            "wrap": function(name, value) {
                var wrapper = $('<div class="row">');
                var p = $('<p>');
                wrapper.append($('<div class="col-xs-12">').append(p));
                p.append(document.createTextNode(name + ":\n"));
                p.append(document.createElement('br'));
                p.append(document.createTextNode(value));
                return wrapper;
            },
            "refreshAvatar": function() {
                var that = this;
                var ava = $('#avatar-sm');
                var newAva = $('<img src="/data/' + that.options.userId + '/avatar-sm.jpg?'+ Math.random() +'" class="avatar-sm">').css({
                    "position": "absolute",
                    "top": 0,
                    "opacity": 0
                });
                that.panes.main.rightLayout.append(newAva);
                ava.css("opacity", 0);
                setTimeout(function() {
                    newAva.css("opacity", 1);
                } ,1);
                setTimeout(function() {
                    newAva.css({
                        "top": "",
                        "position": "static"
                    });
                    ava.remove();
                    newAva.attr("id", "avatar-sm");
                }, 300);

                if (that.fullSized) {
                    var avaFull = $('#avatar');
                    var newAvaFull = $('<img src="/data/' + that.options.userId + '/avatar.jpg?'+ Math.random() +'" class="avatar">').css({
                        "position": "absolute",
                        "top": 0,
                        "opacity": 0,
                        "left": 0
                    });
                    avaFull.parent().append(newAvaFull);
                    avaFull.css("opacity", 0);
                    setTimeout(function() {
                        newAvaFull.css("opacity", 1);
                    } ,10);
                    setTimeout(function() {
                        newAvaFull.css({
                            "top": "",
                            "left": "",
                            "position": "static"
                        });
                        avaFull.remove();
                        newAvaFull.attr("id", "avatar");
                    }, 300);
                }
            },
            "initAdditionalSockets": function(pane) {
                var that = this;
                if (core.user.id == that.options.userId) {
                    that.on('free', function () {
                        that.usernameInputDiv.attr('class', 'form-group has-success has-feedback');
                        that.feedback.attr('class', 'xs form-control-feedback glyphicon glyphicon-ok');
                    });

                    that.on('buzy', function () {
                        that.usernameInputDiv.attr('class', 'form-group has-error has-feedback');
                        that.feedback.attr('class', 'xs form-control-feedback glyphicon glyphicon-remove');
                    });
                }
            },
            "initExpandedContent": function(pane) {
                var that = this;

                var wrapper = $('<div class="row">');
                var firstSection = $('<div class="col-xs-6">');
                var secondSection = $('<div class="col-xs-6 text-right">');

                if (core.user.id == that.options.userId) {
                    that.initAdditionalSockets();
                    var form = $('<form  autocomplete="off" name="userInfo" class="form-inline" onsubmit="return false">');
                    var feedback = that.feedback = $('<span class="xs form-control-feedback glyphicon">');
                    var usernameInput = $('<input name="username" type="text" class="form-control xs" value="' + that.userInfo.username + '">')
                        .on("input", checkName);
                    var inputDiv = that.usernameInputDiv = $('<div class="form-group" id="usernameInput" style="width:100%; margin:0 0 5px 0; height:26px;">');
                    var nameRow = $('<div class="row">')
                        .append($('<div class="col-xs-6">').append($('<p class="control-label" style="text-align:left">').html("Псевдоним")))
                        .append($('<div class="col-xs-6">').append(inputDiv
                            .append(usernameInput)
                            .append(feedback)));
                    form.append(nameRow);

                    form.append(that.wrapInputItem('Имя', that.userInfo.name.first, 'info.name.first'));
                    form.append(that.wrapInputItem('Фамилия', that.userInfo.name.last, 'info.name.last'));
                    form.append(that.wrapInputItem('Отчество', that.userInfo.name.middle, 'info.name.middle'));
                    form.append(that.wrapInputItem('Страна', that.userInfo.birth.country, 'info.birth.country'));
                    form.append(that.wrapInputItem('День рождения', that.userInfo.birth.date ? convertDate(new Date(that.userInfo.birth.date)):"", 'info.birth.date', 'date')); //todo not sure date picker will work
                    form.append(that.wrapInputItem("Родной город", that.userInfo.birth.town, 'info.birth.town'));
                    form.append(that.wrapInputItem("Контактный телефон", that.userInfo.contacts.phone, 'info.contacts.phone'));
                    form.append(that.wrapInputItem("Адрес электронной почты", that.userInfo.contacts.email, 'info.contacts.email', 'email'));
                    form.append(that.wrapInputItem("Личный сайт", that.userInfo.contacts.site, 'info.contacts.site', 'url'));
                    form.append(that.wrapInputItem("Имя в Skype", that.userInfo.contacts.Skype, 'info.contacts.Skype'));
                    form.append(that.wrapInputItem("Адрес страницы ВК", that.userInfo.contacts.VK, 'info.contacts.VK', 'url'));
                    form.append(that.wrapInputItem("Адрес страницы на Facebook", that.userInfo.contacts.FB, 'info.contacts.FB', 'url'));
                    form.append(that.wrapInputItem("Адрес в Twitter", that.userInfo.contacts.Twitter, 'info.contacts.Twitter'));
                    form.append($('<div class="row text-center">')
                        .append($('<button class="btn btn-primary" data-loading-text="Отправляю...">').html('Сохранить').on('click', function() {
                            submitForm(document.forms['userInfo'], '/user/saveInfo'); //todo
                        })));

                    firstSection.append(form);
                } else {
                    firstSection.append(that.wrapFormItem("Псевдоним", that.userInfo.username));
                    firstSection.append(that.wrapFormItem("Имя", that.userInfo.name.first));
                    firstSection.append(that.wrapFormItem("Фамилия", that.userInfo.name.last));
                    firstSection.append(that.wrapFormItem("Отчество", that.userInfo.name.middle));
                    firstSection.append(that.wrapFormItem("Страна", that.userInfo.birth.country));
                    firstSection.append(that.wrapFormItem("День рождения", that.userInfo.birth.date ? datify(that.userInfo.birth.date, true) : ""));
                    firstSection.append(that.wrapFormItem("Родной город", that.userInfo.birth.town));
                    firstSection.append(that.wrapFormItem("Контактный телефон", that.userInfo.contacts.phone));
                    firstSection.append(that.wrapFormItem("Адрес электронной почты", that.userInfo.contacts.email));
                    firstSection.append(that.wrapFormItem("Личный сайт", that.userInfo.contacts.site));
                    firstSection.append(that.wrapFormItem("Имя в Skype", that.userInfo.contacts.Skype));
                    firstSection.append(that.wrapFormItem("Адрес страницы ВК", that.userInfo.contacts.VK));
                    firstSection.append(that.wrapFormItem("Адрес страницы на Facebook", that.userInfo.contacts.FB));
                    firstSection.append(that.wrapFormItem("Адрес в Twitter", that.userInfo.contacts.Twitter));
                }
                secondSection.append($('<div>').on('click', function() {
                    core.content.subscribe(that.options.userId, "photo", that.userInfo.avatar);
                }).append('<img src="/data/'+ that.options.userId +'/avatar.jpg?'+ Math.random() +'" style="max-width:100%" id="avatar">'));

                if (core.user.id == that.options.userId) {
                    var file = that.file = new Fileinput({
                        "url": "/user/saveAvatar",
                        "successMessage": "Аватар успешно загружен",
                        "maxFileSize": (20 * 1024 * 1024),
                        "allowedTypes" : ['image/png', 'image/jpg', 'image/gif', 'image/jpeg']
                    });
                    secondSection.append(file.wrapper);
                }
                wrapper.append(firstSection);
                wrapper.append(secondSection);
                pane.content.append(wrapper);

                function checkName() {
                    if (this.value.length < 3) {
                        that.usernameInputDiv.attr('class', 'form-group has-error has-feedback');
                        that.feedback.attr('class', 'xs form-control-feedback glyphicon glyphicon-remove');
                        return;
                    }
                    if (this.value == that.userInfo.username) {
                        that.usernameInputDiv.attr('class', 'form-group has-success has-feedback');
                        that.feedback.attr('class', 'xs form-control-feedback glyphicon glyphicon-ok');
                        return;
                    }
                    that.emit('check', this.value);
                }
            },
            "setContent": function(pane) {
                var that = this;

                pane.leftLayout.empty();
                if (that.userInfo.name.first) {
                    var value = that.userInfo.name.first;
                    value += that.userInfo.name.last ? (" " + that.userInfo.name.last) : "";
                    pane.leftLayout.append(that.wrap("Имя", value));
                }
                if (that.userInfo.birth.date) {
                    pane.leftLayout.append(that.wrap("День рождения", datify(that.userInfo.birth.date, true)));
                }
                if (that.userInfo.birth.town) {
                    pane.leftLayout.append(that.wrap("Родной город", that.userInfo.birth.town));
                }
            },
            "wrapFormItem": function (text, value) {
                return $('<div class="row">')
                    .append($('<div class="col-xs-6">')
                        .append($('<p>').html(text)))
                    .append($('<div class="col-xs-6">')
                        .append($('<p>').html(value)));
            },
            "wrapInputItem": function (text, value, name , type) {
                type = type || "text";

                return $('<div class="row">')
                    .append($('<div class="col-xs-6">')
                        .append($('<p class="control-label" style="text-align:left">').html(text)))
                    .append($('<div class="col-xs-6">')
                        .append($('<input name="'+ name +'" type="'+ type +'" class="form-control xs">').val(value)))
            }
        });

        requirejs._moduleExecute(moduleName);
        return Info;
    });
})();