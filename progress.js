/**
 * Created by betrayer on 12.09.15.
 */
"use strict";

var Progress = function(stream) {
    this.done = 0;
    this.total = 0;
    this.cout = stream;

    this.width = stream.columns || 25;
    this.height = stream.rows || 80;

    var that = this;
    stream.on("resize", function() {
        that.width = stream.columns || 25;
        that.height = stream.rows || 80;
    });
};

Progress.prototype.paint = function(forced) {
    if (forced === true) {
        this.render();
    } else {
        if (!this.timeout) {
            var that = this;
            this.timeout = true;
            setTimeout(function () {
                that.render();
                that.timeout = false;
            }, 50);
        }
    }
};

Progress.prototype.render = function() {

    var p = ((this.done / this.total) || 0 );
    var pz = Math.floor(p * 100);

    this.clear();

    var pr = this.done + " / " + this.total;

    var barLength = this.width - pr.length - 5 - 2 - 1;
    var barFull = Math.floor((barLength * p) || 0);

    this.cout.write(pr + " [");

    for (var i = 0; i < barLength; ++i) {
        if (i < barFull) {
            this.cout.write("#");
        } else {
            this.cout.write(" ");
        }
    }

    this.cout.write("] " + pz + "%");
};

Progress.prototype.say = function(str) {
    if (this.progress) {
        this.clear();
    }
    this.cout.write(str + "\n");
    if (this.progress) {
        this.paint(true);
    }
};

Progress.prototype.clear = function() {
    this.cout.write(CSI + "1G");
    this.cout.write(CSI + "2K");
};

Progress.prototype.start = function() {
    var b = this.progress;
    this.progress = true;
    if (!b) {
        this.cout.write(CSI + "?25l");
        this.paint();
    }
};

Progress.prototype.stop = function() {
    var b = this.progress;
    this.progress = false;
    if (b) {
        this.paint(true);
        this.cout.write("\n");
        this.cout.write(CSI + "?25h");
    }
};

Progress.prototype.setTotal = function(number) {
    this.total = number;
    if (this.progress) {
        this.paint();
    }
};

Progress.prototype.setDone = function(number) {
    this.done = number;
    if (this.progress) {
        this.paint();
    }
};

Progress.prototype.step = function() {
    this.done++;
    if (this.progress) {
        this.paint();
    }
};

Progress.prototype.decTotal = function() {
    this.total--;
    if (this.progress) {
        this.paint();
    }
};

Progress.prototype.warn = function(warning) {
    if (this.progress) {
        this.clear();
    }
    this.cout.write(CSI + "1;33m");
    this.cout.write("Warning: ");
    this.cout.write(CSI + "0m");
    this.cout.write(warning + "\n");
    if (this.progress) {
        this.paint(true);
    }

};

var CSI = String.fromCharCode(27) + "[";

module.exports = Progress;