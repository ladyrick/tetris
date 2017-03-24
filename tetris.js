"use strict"
var w = 11;
var h = 20;
var totalHeight = 800;
var containerBorderSize = 3;
var wPixels = totalHeight / h * w;
var hPixels = totalHeight;
var container;
function getClassName(x, y) {
    return "pos_" + (x >= 0 && x < 10 ? "0" + x : x) + "_" + (y >= 0 && y < 10 ? "0" + y : y);
}
(function () {
    /*构造一个style节点。屏幕左上角为坐标(0,0)，横向变x，纵向变y。*/
    var style = "";
    style += "body{font-size:100%;background-color:#1e1e1e;}\n";
    style += "#container{position:fixed;left:50%;right:50%;top:50%;bottom:50%;";
    style += "width:" + wPixels + "px;height:" + hPixels + "px;";
    style += "margin-left:-" + (wPixels / 2 + containerBorderSize) + "px;";
    style += "margin-top:-" + (hPixels / 2 + 3) + "px;";
    style += "border:solid chocolate " + containerBorderSize + "px;}\n";
    style += "#container div{";
    style += "position:absolute;";
    style += "transition:0.1s;transition-timing-function:linear;}\n";
    for (var j = -3; j <= h + 1; j++) {
        var color = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
        for (var i = 1; i <= w; i++) {
            style += "." + getClassName(i, j) + "{";
            style += "background-color:" + color + ";";
            style += "width:" + (wPixels / w - 4) + "px;";
            if (j === h + 1) {//touch the bottom
                style += "height:" + 0 + "px;";
                style += "margin-left:" + (wPixels / w * (i - 1) + 2) + "px;margin-top:" + (hPixels + 2) + "px;}\n"
            } else if (j < 1) {//higher than the roof
                style += "height:" + 0 + "px;";
                style += "margin-left:" + (wPixels / w * (i - 1) + 2) + "px;margin-top:" + 0 + "px;}\n"
            } else {
                style += "height:" + (hPixels / h - 4) + "px;";
                style += "margin-left:" + (wPixels / w * (i - 1) + 2) + "px;margin-top:" + (hPixels / h * (j - 1) + 2) + "px;}\n";
            }
        }
    }

    var styleDOM = document.createElement("style");
    styleDOM.innerHTML = style;
    document.getElementsByTagName("head")[0].appendChild(styleDOM);
    container = document.createElement("div");
    container.id = "container";
    document.getElementsByTagName("body")[0].appendChild(container);
})();





function extend(Child, Parent) {
    /*实现原型链继承的函数*/
    var F = function () { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
}




function Piece(position, shape, pose) {
    this.getPosition = function () {
        return position;
    }
    this.setPosition = function (newPos) {
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
    this.getShape = function () {
        return shape;
    }
    this.getPose = function () {
        return pose;
    }
    this.changePose = function (direct) {
        var newPose;
        switch (true) {
            case direct < 0:
                newPose = (pose + 3) % shape.length;
                break;
            case direct > 0:
                newPose = (pose + 1) % shape.length;
                break;
            default:
        }
        var positions = new Array(shape[0].length);
        for (var i in positions) {
            positions[i] = [[position[0] + shape[newPose][i][0], position[1] + shape[newPose][i][1]]];
        }
        var width = 0;
        var newWidth = 0;
        for (var i = 0; i < shape[0].length; i++) {
            if (shape[pose][i][0] > width) {
                width = shape[pose][i][0];
            }
            if (shape[newPose][i][0] > newWidth) {
                newWidth = shape[newPose][i][0];
            }
        }
        for (var shift = 0; shift <= Math.max(newWidth - width, 0); shift++) {
            var newShape = shape[newPose];
            var newPosition = [position[0] - shift, position[1]];
            var flag = true;
            for (var i in newShape) {
                if (this.state[newShape[i][0] + newPosition[0]] === undefined
                    || (this.state[newShape[i][0] + newPosition[0]][newShape[i][1] + newPosition[1]] !== 0
                        && (newShape[i][1] + newPosition[1]) >= 0)) {
                    flag = false;
                }
            }
            if (flag) {
                pose = newPose;
                position = newPosition;
                this.updatePiece();
                return pose;
            }
        }
        return false;
    }
}
Piece.prototype.init = function () {
    this.initState(false);
    if (this.setPosition(this.getPosition())) {
        this.updatePiece();
    } else {
        this.gameOver();
        return;
    }
    var _this = this;
    document.onkeydown = function (e) {
        var keycode = e.which;
        switch (keycode) {
            case 38://up
                _this.turnLeft();
                break;
            case 37://left
                _this.moveLeft();
                break;
            case 39://right
                _this.moveRight();
                break;
            case 40://down
                while (_this.moveDownAndCheck());
                break;
            default:
        }
    }
}
Piece.prototype.state = [];
Piece.prototype.initState = function (force) {
    if (force || this.state.length === 0) {
        Piece.prototype.state = [undefined];
        for (var i = 1; i <= w; i++) {
            var col = [];
            for (var j = 0; j <= h; j++) {
                col.push(0);
            }
            this.state.push(col);
        }
    }
}
Piece.prototype.gameOver = function () {
    clearInterval(timeInterval);
    timeOut = setTimeout(startGame, 5000);
    document.onkeydown = null;
    if (this.gameOverDiv === undefined) {
        Piece.prototype.gameOverDiv = document.createElement("div");
        Piece.prototype.gameOverDiv.id = "gameover";
        var style = "color:white;width:100%;height:100%;opacity:0.5;user-select:none;cursor:pointer;";
        style += 'font-family:"Arial","Microsoft YaHei","黑体",sans-serif;';
        style += "text-align:center;font-size:3.5em;font-weight:bolder;line-height:" + hPixels + "px;"
        Piece.prototype.gameOverDiv.setAttribute("style", style);
        Piece.prototype.gameOverDiv.innerText = "GAME OVER";
        Piece.prototype.gameOverDiv.setAttribute("onclick", "startGame()");
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
    for (var i = 1; i <= w; i++) {
        if (this.state[i][0] !== 0) {
            return false;
        }
    }
    if (curPos === undefined) {
        curPos = this.getPosition();
    }
    var shape = this.getShape()[this.getPose()];
    for (var i in shape) {
        if (this.state[curPos[0] + shape[i][0]][curPos[1] + shape[i][1]] !== 0
            && curPos[1] + shape[i][1] >= 0) {
            return false;
        }
    }
    return true;
}
Piece.prototype.updatePiece = function () {
    var positions = this.getAllPosition();
    if (this.divs === undefined) {
        this.divs = [];
        var color = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
        var _this = this;
        positions.forEach(function (p) {
            var newDiv = document.createElement("div");
            newDiv.setAttribute("class", getClassName(p[0], p[1]));
            newDiv.setAttribute("style", "background-color:" + color + ";");
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
Piece.prototype.rowsToDelete = [];
Piece.prototype.moveDownAndCheck = function () {
    if (this.divs.length === 0) {
        return false;
    }
    var curPos = this.getPosition();
    if (this.setPosition([curPos[0], curPos[1] + 1])) {
        this.updatePiece();
        return true;
    } else {
        document.onkeydown = null;
        var positions = this.getAllPosition();
        for (var i in positions) {
            var p = positions[i];
            this.state[p[0]][p[1]] = this.divs.shift();
        }
        for (var j = 1; j <= h; j++) {
            var d = true;
            for (var i = 1; i <= w; i++) {
                if (this.state[i][j] === 0) {
                    d = false;
                    break;
                }
            }
            if (d) {
                this.rowsToDelete.push(j);
            }
        }
        if (this.rowsToDelete.length > 0) {
            var skipRowNum = 0;
            for (var j = h; j >= 1; j--) {
                if (this.rowsToDelete[this.rowsToDelete.length - 1] === j) {
                    skipRowNum++;
                    this.rowsToDelete.pop();
                    for (var i = 1; i <= w; i++) {
                        if (this.state[i][j]) {
                            container.removeChild(this.state[i][j]);
                            this.state[i][j] = 0;
                        }
                    }
                } else if (skipRowNum > 0) {
                    for (var i = 1; i <= w; i++) {
                        if (this.state[i][j] !== 0) {
                            this.state[i][j].setAttribute("class", getClassName(i, j + skipRowNum));
                            this.state[i][j + skipRowNum] = this.state[i][j];
                            this.state[i][j] = 0;
                        }
                    }
                }
            }
        }
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
Piece.prototype.setProperPositionAndPose = function () {
    var shape = this.getShape();
    for (var s in shape) {
        var width = 0;
        var curShape = shape[s];
        for (var p in shape[s]) {
            if (width < curShape[p][0]) {
                width = curShape[p][0];
            }
        }
        for (var p = 1; p <= w - width; p++) {














        }
    }
}


function getRotatedShape(oneShape) {
    var allShape = [0, 0, 0, 0];
    var temp = oneShape;
    allShape[0] = temp.slice();
    for (var i = 1; i < 4; i++) {
        var xMin = undefined;
        var yMax = undefined;
        for (var j = 0; j < temp.length; j++) {
            temp[j] = [-temp[j][1], temp[j][0]];
            if (xMin === undefined || xMin > temp[j][0]) {
                xMin = temp[j][0];
            }
            if (yMax === undefined || yMax < temp[j][1]) {
                yMax = temp[j][1];
            }
        }
        if (xMin !== 0) {
            for (var j = 0; j < temp.length; j++) {
                temp[j][0] -= xMin;
            }
        }
        if (yMax !== 0) {
            for (var j = 0; j < temp.length; j++) {
                temp[j][1] -= yMax;
            }
        }
        allShape[i] = temp.slice();
    }
    return allShape;
}

function PieceLine(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [2, 0], [3, 0]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceLine, Piece);

function PieceT(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [2, 0], [1, -1]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceT, Piece);

function PieceLLeft(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [0, -1], [0, -2]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceLLeft, Piece);

function PieceLRight(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [1, -1], [1, -2]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceLRight, Piece);

function PieceZLeft(position, pose) {
    var shape = getRotatedShape([[0, -1], [1, -1], [1, 0], [2, 0]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceZLeft, Piece);

function PieceZRight(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [1, -1], [2, -1]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceZRight, Piece);

function PieceBlock(position, pose) {
    var shape = getRotatedShape([[0, 0], [1, 0], [1, -1], [0, -1]]);
    Piece.call(this, position, shape, pose);
}
extend(PieceBlock, Piece);

var timeInterval;
var timeOut;
var timeIntervalDuring = 500;
var AIplayer = true;
var pieceTypes = [PieceLine, PieceT, PieceLLeft, PieceLRight, PieceZLeft, PieceZRight, PieceBlock];
var onePiece;
var nextPiece = new pieceTypes[Math.floor(Math.random() * pieceTypes.length)]([Math.ceil(Math.random() * w), 0], Math.floor(Math.random() * 4));
if (AIplayer) {
    nextPiece.setProperPositionAndPose();
    timeIntervalDuring = 100;
}
function main() {
    if (onePiece === undefined || !onePiece.moveDownAndCheck()) {
        onePiece = nextPiece;
        onePiece.init();
        nextPiece = new pieceTypes[Math.floor(Math.random() * pieceTypes.length)]([Math.ceil(Math.random() * w), 0], Math.floor(Math.random() * 4));
        if (AIplayer) {
            nextPiece.setProperPositionAndPose();
            timeIntervalDuring = 200;
        }
    }
}
function startGame() {
    clearTimeout(timeOut);
    container.innerHTML = "";
    if (onePiece) {
        onePiece.initState(true);
        onePiece = undefined;
    }
    timeInterval = setInterval(main, timeIntervalDuring);
}
window.onload = startGame;
