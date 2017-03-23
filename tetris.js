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
    var style = "#container div{";
    style += "position:absolute;";
    style += "transition:0.2s;}\n";
    for (var j = -3; j <= h + 1; j++) {
        var color = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
        for (var i = 1; i <= w; i++) {
            style += "." + getClassName(i, j) + "{";
            style += "background-color:" + color + ";";
            style += "width:" + (wPixels / w - 4) + "px;";
            if (j === h+1) {//touch the bottom
                style += "height:" + 0 + "px;";
                style += "margin-left:" + (wPixels / w * (i-1) + 2) + "px;margin-top:" + (hPixels + 2) + "px;}\n"
            } else if (j < 1) {//higher than the roof
                style += "height:" + 0 + "px;";
                style += "margin-left:" + (wPixels / w * (i-1) + 2) + "px;margin-top:" + 0 + "px;}\n"
            } else {
                style += "height:" + (hPixels / h - 4) + "px;";
                style += "margin-left:" + (wPixels / w * (i-1) + 2) + "px;margin-top:" + (hPixels / h * (j-1) + 2) + "px;}\n";
            }

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




function Piece(position, shape, pose) {
    this.initState();
    Piece.prototype.getPosition = function () {
        return position;
    }
    Piece.prototype.setPosition = function (newPos) {
        if (newPos[0] < 1) {
            newPos[0] = 1;
        } else {
            shape[pose].forEach(function (x) {
                if (newPos[0] + x[0] > w) {
                    newPos[0] -= newPos[0] + x[0] - w;
                }
            });
        }
        if (newPos[1] < 0) {
            newPos[1] = 0;
        }
        if (this.canPlace(newPos)) {
            position[0] = newPos[0];
            position[1] = newPos[1];
            return true;
        } else {
            return false;
        }
    }
    Piece.prototype.getShape = function () {
        return shape;
    }
    Piece.prototype.getPose = function () {
        return pose;
    }
    Piece.prototype.changePose = function (direct) {
        switch (true) {
            case direct < 0:
                pose = (pose + 3) % shape.length;
                break;
            case direct > 0:
                pose = (pose + 1) % shape.length;
                break;
            default:
        }
        if (this.canPlace()) {
            return pose;
        } else {
            return false;
        }

    }
    if (this.setPosition(position)) {
        this.updatePiece();
    } else {
        this.gameOver();
        return;
    }
    document.onkeydown = function (e) {
        var keycode = e.which;
        switch (keycode) {
            case 38://up
                onePiece.turnLeft();
                break;
            case 37://left
                onePiece.moveLeft();
                break;
            case 39://right
                onePiece.moveRight();
                break;
            case 40://down
                //TODO
                console.warn("down key not implemented.");
                break;
            default:
        }
    }
}
Piece.prototype.state = [];
Piece.prototype.initState = function () {
    if (this.state.length === 0) {
        for (var i = 0; i <= w; i++) {
            var col = [];
            for (var j = 0; j <= h; j++) {
                col.push(0);
            }
            this.state.push(col);
        }
    }
}
Piece.prototype.gameOver = function () {
    if (this.gameOverDiv === undefined) {
        Piece.prototype.gameOverDiv = document.createElement("div");
        var style = "width:100%;height:100%;opacity:0.5;user-select:none;";
        style += "text-align:center;font-size:3.5em;font-weight:bolder;line-height:"+hPixels+"px;"
        Piece.prototype.gameOverDiv.setAttribute("style", style);
        Piece.prototype.gameOverDiv.innerText = "GAME OVER";
    }
    container.appendChild(Piece.prototype.gameOverDiv);
}
Piece.prototype.getAllPosition = function () {
    var positions = [];
    var _this = this;
    this.getShape()[this.getPose()].forEach(function (p) {
        positions.push([_this.getPosition()[0] + p[0], _this.getPosition()[1] + p[1]]);
    });
    return positions;
}
Piece.prototype.canPlace = function (curPos) {
    if (curPos === undefined) {
        curPos = this.getPosition();
    }
    var ps = [];
    this.getShape()[this.getPose()].forEach(function (p) {
        ps.push([curPos[0] + p[0], curPos[1] + p[1]]);
    });
    for (var i in ps) {
        if (this.state[ps[i][0]][ps[i][1]] !== 0 && ps[i][1] >= 0) {
            return false;
        }
    }
    return true;
}
Piece.prototype.updatePiece = function () {
    var positions = this.getAllPosition();
    if (this.divs === undefined) {
        this.divs = [];
        var _this = this;
        positions.forEach(function (p) {
            var newDiv = document.createElement("div");
            newDiv.setAttribute("class", getClassName(p[0], p[1]));
            container.appendChild(newDiv);
            _this.divs.push(newDiv);
        })
    } else {
        for (var i in positions) {
            this.divs[i].setAttribute("class", getClassName(positions[i][0], positions[i][1]));
        }
    }
}
Piece.prototype.turnLeft = function () {
    if (this.changePose(-1)) {
        this.updatePiece();
        return true;
    } else {
        return false;
    }
}
Piece.prototype.turnRight = function () {
    if (this.changePose(1)) {
        this.updatePiece();
        return true;
    } else {
        return false;
    }
}
Piece.prototype.moveDown = function () {
    var curPos = this.getPosition();
    if (this.setPosition([curPos[0], curPos[1] + 1])) {
        this.updatePiece();
        return true;
    } else {
        var _this = this;
        this.getAllPosition().forEach(function (p) {
            _this.state[p[0]][p[1]] = 1;
        });
        return false;
    }
}
Piece.prototype.moveLeft = function () {
    var curPos = this.getPosition();
    if (this.setPosition([curPos[0] - 1, curPos[1]])) {
        this.updatePiece();
        return true;
    } else {
        return false;
    }
}
Piece.prototype.moveRight = function () {
    var curPos = this.getPosition();
    if (this.setPosition([curPos[0] + 1, curPos[1]])) {
        this.updatePiece();
        return true;
    } else {
        return false;
    }
}




function PieceLine(position, pose) {
    var shape = [
        [[0, 0], [1, 0], [2, 0], [3, 0]],
        [[0, 0], [0, -1], [0, -2], [0, -3]]
    ];
    Piece.call(this, position, shape, pose);
}
extend(PieceLine, Piece);

var onePiece;
function main() {
    if (onePiece === undefined || !onePiece.moveDown()) {
        onePiece = new PieceLine([0, -1], 0);
    }
}
setInterval(main, 100);