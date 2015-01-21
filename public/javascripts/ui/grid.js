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
                    "height": "100%"
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
            "data": function(array) {
                var that = this;
                var content = "";
                for (var i = 0; i < array.length; ++i) {
                    var row = new Array(that.options.columns.length);
                    content += '<tr>';
                    for (var key in that.columns) {
                        if (that.columns.hasOwnProperty(key)) {
                            var col = that.columns[key];
                            row[col.number] = '<td>';
                            if (array[i].hasOwnProperty && array[i].hasOwnProperty(key)) {
                                var item = array[i][key];
                                if (col.template instanceof Function) {
                                    row[col.number] += col.template(item) || "";
                                } else {
                                    row[col.number] += item.toString();
                                }
                            }
                            row[col.number] += '</td>';
                        }
                    }
                    content += row.join('') + '</tr>';
                }
                that.table.find('tbody').html(content);
                that._data = array;
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
            }
        });

        requirejs._moduleExecute(moduleName);
        return Grid;
    });
})();