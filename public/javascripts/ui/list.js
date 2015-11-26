/**
 * Created by betrayer on 31.08.15.
 */
"use strict";
(function list_js() {
    var moduleName = m.ui.$list;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$ui);
    defineArray.push(m.ui.$button);

    define(moduleName, defineArray, function list_module() {
        var Ui = require(m.$ui);
        var Button = require(m.ui.$button);

        var List = Ui.inherit({
            "className": "List",
            "constructor": function(options) {
                var that = this;
                var baseOptions = {
                    "height": "100%",
                    "textField": "name",
                    "sort": null,
                    "idField": "id",
                    "buttons": []
                };
                $.extend(baseOptions, options);
                Ui.fn.constructor.call(that, baseOptions);

                that._data = [];
                that._index = {};

                that.wrapper = $("<div class='col-lg-4 w-list' style='height:"+that.options.height+";'>");

                that._initWrapper();
            },
            "destructor": function() {
                this.clear();

                Ui.fn.destructor.call(this);
            },

            "_initWrapper": function() {

            },
            "data": function(data) {
                var that = this;
                if (data instanceof Array) {
                    that.clear();
                    for (var i = 0; i < data.length; ++i) {
                        var item = new Item({
                            "textField": this.options.textField,
                            "idField": this.options.idField,
                            "data": data[i],
                            "buttons": this.options.buttons
                        });
                        that._data.push(item);
                        that._index[data[i][this.options.idField]] = item;
                        item.on("click", this._onItemClick, this);
                    }
                    that.sort();
                    that.refresh();
                } else {
                    return this._data.slice();
                }
            },
            "clear": function() {
                for (var i = 0; i < this._data.length; ++i) {
                    this._data[i].destructor();
                }
                this._data = [];
                this._index = {};
            },
            "sort": function() {
                if (this.options.sort instanceof Function) {
                    this._data.sort(this.options.sort);
                }
            },
            "refresh": function() {
                var container = this.wrapper;

                container.find().detach();
                for (var i = 0; i < this._data.length; ++i) {
                    this._data[i].refresh();
                    container.append(this._data[i].wrapper);
                }
            },
            "_onItemClick": function(name, data) {
                this.trigger(name, data);
            }
        });

        var Item = Ui.inherit({
            "className": "ListItem",
            "constructor": function(options) {
                var that = this;
                var baseOptions = {
                    textField: "name",
                    idField: "id",
                    buttons: []
                };
                $.extend(baseOptions, options);
                Ui.fn.constructor.call(that, baseOptions);

                that.wrapper.addClass("row w-list-item");
                that.panel = $("<div class='w-list-panel'>");
                that.content = $("<div class='w-list-content'>");
                that._data = that.options.data;
                that.buttons = [];
                delete that.options.data;

                if (this.options.buttons) {
                    this._initButtons();
                }

                that._initWrapper();
            },
            "destructor": function() {
                for (var i = 0; i < this.buttons.length; ++i) {
                    this.buttons[i].destructor();
                }

                this.content.remove();
                this.panel.remove();

                Ui.fn.destructor.call(this);
            },
            "_initButtons": function() {
                var that = this;
                var onButtonClick = function() {
                    that.trigger("click", this.name(), that._data);
                };

                for (var i = 0; i < this.options.buttons.length; ++i) {
                    var button = new Button(this.options.buttons[i]);
                    button.on("click", onButtonClick, button);
                    this.buttons.push(button);
                    this.panel.append(button.wrapper);
                }
                var width = this.buttons.length * 40;

                this.panel.width(width);
                this.wrapper.css({
                    "padding-right": width + "px"
                });

                this.wrapper.append(this.panel);

                this._uncyclic.push(function() {
                    that = null;
                });
            },
            "_initWrapper": function() {

                this.wrapper.append(this.content);


            },
            "refresh": function() {
                this.content.html(this._data[this.options.textField]);
            }
        });

        requirejs._moduleExecute(moduleName);
        return List;
    });
})();