/**
 * Created by betrayer on 09.10.14.
 */
"use strict";
(function infojs(){
    var moduleName = m.widget.$info;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$widget);

    define(moduleName, defineArray, function info_module() {
        var Widget = require(m.$widget);

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
                that.initSockets();
            },
            "initContent": function() {
                var that = this;

                Widget.fn.initContent.call(that);

                that.leftLayout = $('<div class="row">');
                that.rightLayout = $('<div class="col-xs-6">');
                that.container.append($('<div class="col-xs-6">').append(that.leftLayout));
                that.container.append(that.rightLayout);
                that.emit("requestInfoShort", that.options.userId);
                that.on("responseInfoShort", function(user) {
                    that.userInfo = user.info;
                    that.userInfo.username = user.username;
                    if (that.userInfo.name.first) {
                        var value = that.userInfo.name.first;
                        value += that.userInfo.name.last ? that.userInfo.name.last : "";
                        that.leftLayout.append(that.wrap("Имя", value));
                    }
                    if (that.userInfo.birth.date) {
                        that.leftLayout.append(that.wrap("День рождения", datify(that.userInfo.birth.date)));
                    }
                    if (that.userInfo.birth.town) {
                        that.leftLayout.append(that.wrap("Родной город", that.userInfo.birth.town));
                    }
                    that.off('responseInfoShort');
                });
                that.rightLayout.append($('<img src="/data/' + that.options.userId + '/avatar-sm.jpg?'+ Math.random() +'" id="avatar-sm" class="avatar-sm">'));
            },
            "initSockets": function() {
                var that = this;

                that.on('new avatar', function(avatarID) {
                    that.refreshAvatar();
                    that.userInfo.avatar = avatarID;
                });
            },
            "changeAvatar": function (size) {
                var that = this;
                size = size || '';
                if (size !== '') size = '-'+size;
                var oAva = $('#avatar'+size).get(0);
                oAva.style.opacity = 0;
                oAva.id = '';
                var ava = document.createElement('img');
                ava.src = "/data/<%- user._id %>/avatar"+size+".jpg?";
                ava.id = 'avatar'+size;
                ava.style.position = 'absolute';
                ava.style.left = 0;
                ava.style.right = 0;
                ava.style.opacity = 0;
                setTimeout(function() {
                    oAva.parentNode.appendChild(ava);
                    oAva.parentNode.removeChild(oAva);
                    ava.style.position = '';
                    setTimeout(function() {
                        ava.style.opacity = 1;
                    }, 1)
                }, 300);
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
                that.rightLayout.append(newAva);
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
                        "opacity": 0
                    });
                    avaFull.parent().append(newAvaFull);
                    avaFull.css("opacity", 0);
                    setTimeout(function() {
                        newAvaFull.css("opacity", 1);
                    } ,1);
                    setTimeout(function() {
                        newAvaFull.css({
                            "top": "",
                            "position": "static"
                        });
                        avaFull.remove();
                        newAvaFull.attr("id", "avatar");
                    }, 300);
                }
            },
            "getExpandedContent": function(container) {
                var that = this;

                var wrapper = $('<div class="row" style="height:50%">');
                var firstSection = $('<div class="col-xs-6 col-xs-12-vp">');
                var secondSection = $('<div class="col-xs-6 col-xs-12-vp text-right">');
                var thirdSection = $('<div class="col-xs-6 col-xs-12-vp">');
                var fourthSection = $('<div class="col-xs-6 col-xs-12-vp">');

                firstSection.append($('<p class="text-center lead">'+that.options.name+'</p>'));
                firstSection.append(wrap("Псевдоним", that.userInfo.username));
                firstSection.append(wrap("Имя", that.userInfo.name.first));
                firstSection.append(wrap("Фамилия", that.userInfo.name.last));
                firstSection.append(wrap("Отчество", that.userInfo.name.middle));
                firstSection.append(wrap("Страна", that.userInfo.birth.country));
                firstSection.append(wrap("День рождения", datify(that.userInfo.birth.date)));
                firstSection.append(wrap("Родной город", that.userInfo.birth.town));
                firstSection.append(wrap("Контактный телефон", that.userInfo.contacts.phone));
                firstSection.append(wrap("Адрес электронной почты", that.userInfo.contacts.email));
                firstSection.append(wrap("Личный сайт", that.userInfo.contacts.site));
                firstSection.append(wrap("Имя в Skype", that.userInfo.contacts.Skype));
                firstSection.append(wrap("Адрес страницы ВК", that.userInfo.contacts.VK));
                firstSection.append(wrap("Адрес страницы на Facebook", that.userInfo.contacts.FB));
                firstSection.append(wrap("Адрес в Twitter", that.userInfo.contacts.Twitter));

                secondSection.append($('<div>').on('click', function(){
                    core.activePage.subscribeContent(that.options.userId, "photo", that.userInfo.avatar);
                }).append('<img src="/data/'+ that.options.userId +'/avatar.jpg" style="max-width:100%" id="avatar">'));

                wrapper.append(firstSection);
                wrapper.append(secondSection);
                wrapper.append(thirdSection);
                wrapper.append(fourthSection);
                container.append(wrapper);

                setTimeout(function() {
                    container.css("opacity", 1)
                }, 300);
                function wrap (text, value) {
                   return $('<div class="row">')
                       .append($('<div class="col-xs-6">')
                           .append($('<p>').html(text)))
                       .append($('<div class="col-xs-6">')
                           .append($('<p>').html(value)));
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Info;
    });
})();