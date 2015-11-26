/**
 * Created by betrayer on 20.10.14.
 */
"use strict";

(function fileinputjs() {
    var moduleName = m.ui.$fileinput;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$ui);

    define(moduleName, defineArray, function fileinput_module() {
        var Ui = require(m.$ui);

        var Fileinput = Ui.inherit({
            "className": "Fileinput",
            "constructor": function (params) {
                var that = this;
                var baseOptions = {
                    "title": "Browse",
                    "inputName": "file",
                    "url": "/",
                    "multiple": false,
                    "successMessage": 'Файл успешно загружен',
                    "maxFileSize": 5368709120,
                    "allowedTypes": []
                };
                $.extend(baseOptions, params);
                Ui.fn.constructor.call(that, baseOptions);
                that.allowedTypes = {};
                for (var i = 0; i < baseOptions.allowedTypes.length; ++i) {
                    that.allowedTypes[baseOptions.allowedTypes[i]] = true;
                }
                that.initWrapper();
            },
            "destructor": function() {
                var that = this;

                delete this.allowedTypes;
                that.form.off();
                that.input.off();
                that.wrapper.remove();
                Ui.fn.destructor.call(that);
            },
            "initWrapper": function() {
                var that = this;

                var wrapper = that.wrapper.css("overflow", "hidden");
                var input = that.input = $('<input type="file" name="'+ that.options.inputName +'"'+ (that.options.multiple ? "multiple": "") +'>');
                var form = that.form = $('<form enctype="multipart/form-data" method="POST">');
                that.button = $('<span class="btn btn-primary btn-file">').css("position", "relative");
                form.append(that.button.html(that.options.title)
                    .append(input));

                var progressBar = that.progressBar = $('<div class="progress-bar" role="progressbar" style="width:0">');
                wrapper.append(form);
                wrapper.append($('<div class="progress progress-striped active" style="display:none">')
                    .append(progressBar));

                form.on('change', '.btn-file :file', function() {
                    var data = new FormData();

                    for (var i in this.files) {
                        if (this.files.hasOwnProperty(i)) {
                            if (i != 'length' && i != 'item') {
                                if (this.files[i].name.length < 1) {
                                    launchModal('Как минимум один из файлов не имеет имени, загрузка отменена');
                                    return false;
                                }
                                if (this.files[i].size > that.options.maxFileSize) {
                                    launchModal('Как минимум один из файлов слишком велик, загрузка отменена');
                                    return false;
                                }
                                if (that.options.allowedTypes.length > 0 && !that.allowedTypes[this.files[i].type]) {
                                    launchModal('Как минимум один из файлов не прошел проверку типа, загрузка отменена');
                                    return false;
                                }
                                data.append('file-' + i, this.files[i]);
                            }
                        }
                    }
                    $(this).trigger('fileselect', data);
                });

                input.on('fileselect', function(event, data) {
                    $.ajax({
                        url: that.options.url,
                        type: 'POST',
                        data: data,
                        processData: false,
                        xhr: function() {
                            var settings = $.ajaxSettings.xhr();
                            if (settings.upload) {
                                settings.upload.addEventListener('progress', moveProgress)
                            }
                            return settings;
                        },
                        contentType: false,
                        cache: false,
                        statusCode: {
                            200: function() {
                                afterAll(that.options.successMessage);
                            },
                            500: function(jqXHR) {
                                var ans = JSON.parse(jqXHR.responseText);
                                afterAll(ans.message);
                            },
                            403: function(jqXHR) {
                                afterAll("Ошибка. Файлы не будут загружены, не хватает доступного места");
                            },
                            404: function(jqXHR) {
                                var ans = JSON.parse(jqXHR.responseText);
                                afterAll(ans.message);
                            }
                        },
                        beforeSend: function() {
                            progressBar.parent().css('display', 'block');
                            that.button.css({
                                "height": "10px",
                                "top": "-10px",
                                "opacity": "0"
                            });
                            progressBar.css('width', 0);
                        }
                    });
                    function moveProgress(e) {
                        progressBar.css('width', 100*e.loaded/e.total+'%');
                    }
                    function afterAll(message) {
                        progressBar.parent().css('display', 'none');
                        that.button.css({
                            "height": "",
                            "top": "0",
                            "opacity": "1"
                        });
                        progressBar.css('width', 0);
                        form[0].reset();
                        launchModal(message);
                    }
                });
                that.wrapper.css("minWidth", that.button.width() + "px");
            }
        });

        requirejs._moduleExecute(moduleName);
        return Fileinput;
    });
})();