/**
 * Created by betrayer on 07.10.14.
 */
"use strict";
var extend = require('extend');


var CClass = function () {
};

extend(CClass, {
    "inherit": function (proto) {
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
                lFn[lMember] = extend(true, {}, lBase.prototype[lMember], proto[lMember]);
            } else {
                lFn[lMember] = proto[lMember];
            }
        }

        lFn.constructor = lSubclass;
        lSubclass.inherit = that.inherit;

        return lSubclass;
    }
});

module.exports = CClass.inherit({
    "constructor": function () {
        var that = this;

        if (!(that instanceof CClass)) {
            throw new SyntaxError("Didn't call \"new\" operator");
        }

        CClass.call(that);
        that.uncyclic = [];
    },
    "destructor": function () {
        var that = this;
        var lIndex, lKey;

        for (lIndex = 0; lIndex < that.uncyclic.length; ++lIndex) {
            that.uncyclic[lIndex].call();
        }

        for (lKey in that) {
            if (that.hasOwnProperty(lKey)) {
                that[lKey] = undefined;
                delete that[lKey];
            }
        }
    }
});

