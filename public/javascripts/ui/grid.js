/**
 * Created by betrayer on 21.01.15.
 */
"use strict";
(function gridjs(){
    var moduleName = m.ui.$grid;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];
    defineArray.push(m.$class);

    define(moduleName, defineArray, function grid_module() {
        var Class = require(m.$class);

        var Grid = Class.inherit({
            "className": "Grid",
            "constructor": function(params) {
                var that = this;
                var baseOptions = {
                    "columns": false, //must be array of objects
                    "width": "100%",
                    "height": "",
                    "id": "id"
                };
                $.extend(baseOptions, params);
                that.options = baseOptions;

                Class.call(that);
                that.columns = {};
                that._data = [];
                that.initWrapper();
            },
            "destructor": function() {
                var that = this;

                that.wrapper.remove();
                Class.fn.destructor.call(that);
            },
            "createRow": function(model) {
                var that = this;
                var row = new Array(that.options.columns.length);
                var tr = $('<tr>');
                if (model[that.options.id]) {
                    tr.attr('id', 'w-grid-model-' + model[that.options.id] + '');
                }
                for (var key in that.columns) {
                    if (that.columns.hasOwnProperty(key)) {
                        var col = that.columns[key];
                        row[col.number] = $('<td>');
                        //if (model.hasOwnProperty && model.hasOwnProperty(key)) {
                            var item = model[key];
                            if (col.template instanceof Function) {
                                row[col.number].append(col.template(item, model));
                            } else {
                                row[col.number].html(item && item.toString());
                            }
                        //}
                    }
                }
                tr.append(row);
                model._wrapper = tr;
                return tr;
            },
            "data": function(array) {
                var that = this;
                if (that.options.sort) {
                    var field = that.options.sort.field;
                    var des = that.options.sort.descending;
                    array.sort(function (a, b) {
                        if (a[field] < b[field]) return des ? 1 : -1;
                        if (a[field] > b[field]) return des ? -1 : 1;
                        return 0;
                    });
                }
                var content = $('<tbody>');
                for (var i = 0; i < array.length; ++i) {
                    content.append(that.createRow(array[i]));

                }
                that.table.find('tbody').remove();
                that.table.append(content);
                that._data = array;
            },
            "add": function(model) {
                var that = this;
                var data = that._data;
                var sort = that.options.sort;
                var row = that.createRow(model);
                if (sort) {
                    if (sort.descending) {
                        for (var i = 0; i < data.length; ++ i) {
                            if (model[sort.field] > data[i][sort.field]) {
                                data[i]._wrapper.before(row);
                                data.splice(i, 0, model);
                                return;
                            }
                        }
                    } else {
                        for (var j = 0; j < data.length; ++j) {
                            if (model[sort.field] < data[j][sort.field]) {
                                data[j]._wrapper.before(row);
                                data.splice(j, 0, model);
                                return;
                            }
                        }
                    }
                }
                that.table.find('tbody').append(row);
                data.push(model);
            },
            "initHeader": function() {
                var that = this;
                var cols = that.options.columns;
                if (!(cols instanceof Array) || cols.length === 0) return;
                var tr = "<tr>";
                for (var i = 0; i < cols.length; ++i) {
                    var th = "<th>";
                    if (typeof cols[i] === "string") {
                        that.columns[cols[i]] = {
                            title: cols[i],
                            number: i
                        };
                        th +=cols[i];
                    } else {
                        if ((cols[i].key && typeof cols[i].key === "string") || (cols[i].title && typeof cols[i].title === "string")) {
                            th += cols[i].title;
                            that.columns[cols[i].key || cols[i].title] = {
                                title: cols[i].title || cols[i].key,
                                number: i,
                                template: cols[i].template
                            };
                        }
                    }
                    th += "</th>";
                    tr += th;
                }
                that.table.find("thead").html(tr);
            },
            "initWrapper": function() {
                var that = this;

                that.wrapper = $('<div class="w-grid-wrapper">').css({
                    width: that.options.width,
                    height: that.options.height
                });
                that.table = $('<table class="table">');
                that.wrapper.append(that.table);
                if (that.options.columns) {
                    that.table.html('<thead></thead>');
                    that.initHeader();
                }
                that.table.append($('<tbody>'));
            },
            "remove": function(id) {
                var that = this;
                for (var i = 0; i < that._data.length; ++i) {
                    if (that._data[i][that.options.id] === id) {
                        that._data.splice(i, 1)[0]._wrapper.remove();
                        break;
                    }
                }
            }
        });

        requirejs._moduleExecute(moduleName);
        return Grid;
    });
})();