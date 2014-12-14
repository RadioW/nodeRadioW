/**
 * Created by betrayer on 05.10.14.
 */
"use strict";

(function registrationjs(){
    var moduleName = m.page.$registration;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$page);

    define(moduleName, defineArray, function registration_module(){
        var Page = require(m.$page);
        var Registration = Page.inherit({
            "className": "Registration",
            "websocket": true,
            "name": "Регистрация",
            "constructor": function (param) {
                var that = this;

                Page.fn.constructor.call(that, {
                    html: param.html,
                    route: "registration"
                });
            },
            "run": function() {
                var that = this;

                that.usernameForm = false;
                that.password1Form = false;
                that.password2Form = false;
                var timeout;
                var form = $(document.forms['registration-form']);

                var submit = that.submit = $(':submit', form);
                submit.prop('disabled', true);

                var name = $('#input-username');
                var pass1 = $('#input-password1');
                var pass2 = $('#input-password2');

                name.get(0).autocmplete = "off";
                pass1.get(0).autocmplete = "off";
                pass2.get(0).autocmplete = "off";

                form.on('submit', function(e) {
                    var form = $(this);
                    e.preventDefault();
                    var error = $('.error', form);
                    error.html('');

                    if (!that.formValid()) {
                        return;
                    }
                    submit.button('loading');
                    $.ajax({
                        url: '/registration',
                        method: 'POST',
                        data: form.serialize(),
                        complete: function() {
                            submit.button('reset');
                        },
                        statusCode: {
                            403: function(jqXHR) {
                                var err = JSON.parse(jqXHR.responseText);
                                error.html(err.message).addClass('alert-danger');
                            },
                            200: function() {
                                form.html("Поздравляем, регистрация прошла успешно!").addClass('alert-success');
                                window.location.href = "/";
                            }
                        }
                    });
                });
                var iconR = '<i class="glyphicon glyphicon-remove"></i>';
                var iconS = '<i class="glyphicon glyphicon-ok"></i>';

                that
                    .on('connection', function() {
                        name.on('input', function() {
                            clearTimeout(timeout);
                            if ($('#input-username').val() == '') {
                                $('#status-username span').html(iconR).removeClass().addClass('label label-warning');
                                submit.prop('disabled', true);
                                return
                            }
                            timeout = setTimeout(function() {
                                that.emit('check', $('#input-username').val());
                            }, 500)
                        });
                    })

                    .on('buzy', function() {
                        $('#status-username span').html(iconR).removeClass().addClass('label label-warning');
                        that.usernameForm = false;
                        submit.prop('disabled', true);
                    })
                    .on('free', function() {
                        $('#status-username span').html(iconS).removeClass().addClass('label label-success');
                        that.usernameForm = true;
                        that.validate();
                    })
                    .on('error', function(err) {
                        $('.error', form).html(err).addClass('alert-danger');
                        that.usernameForm = false;
                        submit.prop('disabled', true);
                    });

                pass1.on('input', function() {
                    if ($(this).val().length < 4) {
                        $('#status-password1 span').html(iconR).removeClass().addClass('label label-warning');
                        that.password1Form = false;
                    } else {
                        $('#status-password1 span').html(iconS).removeClass().addClass('label label-success');
                        that.password1Form = true;
                        if ($(this).val() != $('#input-password2').val()) {
                            $('#status-password2 span').html(iconR).removeClass().addClass('label label-warning');
                            that.password2Form = false;
                        } else {
                            $('#status-password2 span').html(iconS).removeClass().addClass('label label-success');
                            that.password2Form = true;
                        }
                    }
                    that.validate()
                });

                pass2.on('input', function() {
                    if ($(this).val() != $('#input-password1').val()) {
                        $('#status-password2 span').html(iconR).removeClass().addClass('label label-warning');
                        that.password2Form = false;
                    } else {
                        $('#status-password2 span').html(iconS).removeClass().addClass('label label-success');
                        that.password2Form = true;
                    }
                    that.validate();
                });



                Page.fn.run.call(that);
            },
            "validate": function() {
                var that = this;

                if (that.password1Form && that.password2Form && that.usernameForm) {
                    that.submit.prop('disabled', false);
                } else {
                    that.submit.prop('disabled', true);
                }
            },
            "formValid": function() {
                var that = this;
                var form = $(this);
                var error = $('.error', form);
                var name = $('#input-username');
                var pass1 = $('#input-password1');
                var pass2 = $('#input-password2');

                if (name.val() == '') {
                    error.html('Вы не ввели имя пользователя').addClass('alert-warning');
                    return false;
                }
                if (pass1.val() == '') {
                    error.html('Вы не ввели пароль').addClass('alert-warning');
                    return false;
                }
                if (pass2.val() == '') {
                    error.html('Вы не ввели подтверждение пароля').addClass('alert-warning');
                    return false;
                }
                if (pass1.val() != pass2.val()) {
                    error.html('Введенные Вами пароли не совпадают').addClass('alert-warning');
                    return false;
                }
                return true;
            }
        });

        $.extend(Registration, {
            "title": "registration"
        });

        requirejs._moduleExecute(moduleName);
        return Registration;
    });
})();