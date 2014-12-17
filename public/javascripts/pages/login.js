/**
 * Created by betrayer on 08.10.14.
 */
"use strict";
(function loginjs() {
    var moduleName = m.page.$login;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);

    define(moduleName, defineArray, function login_module() {
        var Page = require(m.$page);

        var Login = Page.inherit({
            "className": "Login",
            "websocket": false,
            "name": "Вход",
            "constructor": function(params) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: params.html,
                    route: "login"
                });
            },
            "run": function() {
                var that = this;

                $(document.forms['login-form']).on('submit', function(e) {
                    var form = $(this);
                    e.preventDefault();

                    $('.error', form).html('');
                    var btn = $(".btn", form);
                    btn.addClass('disabled').attr('disabled', 'disabled');

                    $.ajax({
                        url: "/login",
                        method: "POST",
                        data: form.serialize(),
                        complete: function() {
                            btn.removeClass('disabled').removeAttr('disabled')
                        },
                        statusCode: {
                            200: function() {
                                form.html("Вы вошли в сайт").addClass('alert-success');
                                window.location.href = "/";
                            },
                            403: function(jqXHR) {
                                var error = JSON.parse(jqXHR.responseText);
                                $('.error', form).html(error.message).addClass('alert-warning');
                            }
                        }
                    });
                });
                Page.fn.run.call(that);
            }
        });
        $.extend(Login, {
            "title": "login"
        });

        requirejs._moduleExecute(moduleName);
        return Login
    });
})();