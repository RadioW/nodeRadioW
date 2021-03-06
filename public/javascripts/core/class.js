/**
 * Created by betrayer on 02.10.14.
 */
"use strict";
(function classjs() {
    var moduleName = m.$class;
    requirejs._moduleLoad(moduleName);

    var defineArray = [];

    define(moduleName, defineArray, function class_module() {
        var CClass = function () {
        };

        CClass.inherit = function (proto) {
            var that = this;
            var lBase = function () {
            };
            var lMember, lFn, lSubclass;

            lSubclass = proto && proto.init || proto.constructor ? proto.init || proto.constructor : function () {
                that.apply(this, arguments);
            };

            lBase.prototype = that.prototype;
            lFn = lSubclass.fn = lSubclass.prototype = new lBase();

            for (lMember in proto) {
                if (typeof proto[lMember] === "object" && !(proto[lMember] instanceof Array) && proto[lMember] !== undefined) {
                    // Merge object members
                    lFn[lMember] = $.extend(true, {}, lBase.prototype[lMember], proto[lMember]);
                } else {
                    lFn[lMember] = proto[lMember];
                }
            }

            lFn.constructor = lSubclass;
            lSubclass.inherit = that.inherit;

            return lSubclass;
        };

        requirejs._moduleExecute(moduleName);

        return CClass.inherit({
            "constructor": function () {
                var that = this;

                if (!(that instanceof CClass)) {
                    throw new SyntaxError("Didn't call \"new\" operator");
                }

                CClass.call(that);
                that._uncyclic = [];
            },
            "destructor": function () {
                var that = this;

                for (var i = 0; i < this._uncyclic.length; ++i) {
                    this._uncyclic[i]();
                }

                for (var key in that) {
                    if (that.hasOwnProperty(key)) {
                        that[key] = undefined;
                        delete that[key];
                    }
                }
            }
        });
    });
})();
