/**
 * Created by betrayer on 20.10.14.
 */
"use strict";

(function fileinputjs() {
    var moduleName = m.$fileinput;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function fileinput_module() {
        var Class = require(m.$class);

        var Fileinput = Class.inherit({
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
                that.options = baseOptions;

                Class.call(that);
                that.allowedTypes = {};
                for (var i = 0; i < baseOptions.allowedTypes.length; ++i) {
                    that.allowedTypes[baseOptions.allowedTypes[i]] = true;
                }
                that.initWrapper();
            },
            "destructor": function() {
                var that = this;

                that.wrapper.remove();
                Class.fn.destructor.call(that);
            },
            "initWrapper": function() {
                var that = this;

                var wrapper = that.wrapper = $('<div>');
                var input = that.input = $('<input type="file" name="'+ that.options.inputName +'"'+ (that.options.multiple ? "multiple": "") +'>');
                var form = that.form = $('<form enctype="multipart/form-data" method="POST">');
                form.append($('<span class="btn btn-primary btn-file">').html(that.options.title)
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
                                progressBar.parent().css('display', 'none');
                                launchModal(that.options.successMessage);
                            },
                            500: function(jqXHR) {
                                var ans = JSON.parse(jqXHR.responseText);
                                progressBar.parent().css('display', 'none');
                                launchModal(ans.message);
                            },
                            403: function(jqXHR) {
                                var ans = JSON.parse(jqXHR.responseText);
                                progressBar.parent().css('display', 'none');
                                launchModal(ans.message);
                            },
                            404: function(jqXHR) {
                                var ans = JSON.parse(jqXHR.responseText);
                                progressBar.parent().css('display', 'none');
                                launchModal(ans.message);
                            }
                        },
                        beforeSend: function() {
                            progressBar.parent().css('display', 'block');
                            progressBar.css('width', 0);
                        }
                    });
                    function moveProgress(e) {
                        progressBar.css('width', 100*e.loaded/e.total+'%');
                    }
                });
            }
        });

        requirejs._moduleExecute(moduleName);
        return Fileinput;
    });
})();