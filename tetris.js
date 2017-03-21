"use strict"
var w = 8;
var h = 12;
var container = document.getElementById("container");
var wPixels = container.clientWidth;
var hPixels = container.clientHeight;
function getClassName(x, y) {
    return "pos_" + (x < 10 ? "0" + x : x) + "_" + (y < 10 ? "0" + y : y);
}
(function () {
    /*构造一个style节点。屏幕左上角为坐标(0,0)，横向变x，纵向变y。*/
    var style = "";
    for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
            style += "." + getClassName(i, j) + "{";
            style += "position:absolute;"
            style += "background-color:black;";
            style += "width:" + (wPixels / w - 4) + "px;height:" + (hPixels / h - 4) + "px;";
            style += "margin-left:" + (wPixels / w * i + 2) + "px;margin-top:" + (hPixels / h * j + 2) + "px;}\n";
        }
    }

    var styleDOM = document.createElement("style");
    styleDOM.innerHTML = style;
    document.getElementsByTagName("head")[0].appendChild(styleDOM);
})();

function extend(Child, Parent) {
    /*实现原型链继承的函数*/
    var F = function () { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
}
function Piece(position, shape) {
    var pose = 0;
    Piece.prototype.getPosition = function () {
        return position;
    }
    Piece.prototype.setPosition = function (newpos) {
        if (newpos[0] < 0) {
            position[0] = 0;
        } else {
            shape[pose].forEach(function (x) {
                if (newpos[0] + x[0] >= w) {
                    newpos[0] -= newpos[0] + x[0] - w + 1;
                }
            });
            position[0] = newpos[0];
        }
        if (newpos[1] < -1) {
            position[1] = -1;
        }
    }
    Piece.prototype.getShape = function () {
        return shape;
    }
    Piece.prototype.getPose = function () {
        return pose;
    }
    Piece.prototype.changePose = function () {
        pose = 1 - pose;
        this.setPosition(position);
        return pose;
    }
    this.setPosition(position);
}
Piece.prototype.getAllPosition = function () {
    var positions = [];
    var localThis = this;
    this.getShape()[this.getPose()].forEach(function (p) {
        positions.push([localThis.getPosition()[0] + p[0], localThis.getPosition()[1] + p[1]]);
    });
    return positions;
}
Piece.prototype.removePiece = function () {
    if (this.divs !== undefined) {
        this.divs.forEach(function (x) {
            container.removeChild(x);
        })
    }
}
Piece.prototype.putPiece = function () {
    this.removePiece();
    var positions = this.getAllPosition();
    this.divs = [];
    var localThis = this;
    positions.forEach(function (p) {
        var newDiv = document.createElement("div");
        newDiv.setAttribute("class", getClassName(p[0], p[1]));
        container.appendChild(newDiv);
        localThis.divs.push(newDiv);
    })
}
Piece.prototype.turn = function () {
    this.changePose();
    this.putPiece();
}

function PicecLine(pos) {
    var shape = [
        [[0, 0], [1, 0], [2, 0], [3, 0]],
        [[0, 0], [0, -1], [0, -2], [0, -3]]
    ];
    Piece.call(this, pos, shape);
}
extend(PicecLine, Piece);



var p1 = new PicecLine([100, 5]);
p1.putPiece();
p1.turn();
