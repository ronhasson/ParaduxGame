"use strict";
var Board = /** @class */ (function () {
    function Board(size) {
        this.size = 8;
        this.size = size;
        this.field = [];
        for (var i = 0; i < this.size; i++) {
            this.field[i] = [];
            for (var j = 0; j < this.size; j++) {
                this.field[i][j] = new Land(tType.Normal, i, j);
            }
        }
        //temp map
        /*
        this.field[5][2].terrain = tType.Blocked;
        this.field[2][5].terrain = tType.Blocked;

        this.field[0][0].terrain = tType.Hidden;
        this.field[0][1].terrain = tType.Hidden;
        this.field[1][0].terrain = tType.Hidden;

        this.field[7][7].terrain = tType.Hidden;
        this.field[6][7].terrain = tType.Hidden;
        this.field[7][6].terrain = tType.Hidden;
        */
        //base board
        this.field[0][0].terrain = tType.Blocked;
        this.field[0][1].terrain = tType.Blocked;
        this.field[1][0].terrain = tType.Blocked;
        this.field[1][1].terrain = tType.Blocked;
        this.field[2][0].terrain = tType.Blocked;
        this.field[0][2].terrain = tType.Blocked;
        this.field[6][6].terrain = tType.Blocked;
        this.field[5][6].terrain = tType.Blocked;
        this.field[6][5].terrain = tType.Blocked;
        this.field[5][5].terrain = tType.Blocked;
        this.field[6][4].terrain = tType.Blocked;
        this.field[4][6].terrain = tType.Blocked;
        this.field[2][3].cont = new Unit(2);
        this.field[4][3].cont = new Unit(1);
        this.field[6][3].cont = new Unit(2);
        this.field[0][3].cont = new Unit(1);
        this.field[6][2].cont = new Unit(1);
        this.field[6][1].cont = new Unit(2);
        this.field[6][0].cont = new Unit(1);
        this.field[5][4].cont = new Unit(1);
        this.field[4][5].cont = new Unit(2);
        this.field[3][6].cont = new Unit(1);
        this.field[0][4].cont = new Unit(2);
        this.field[0][5].cont = new Unit(1);
        this.field[0][6].cont = new Unit(2);
        this.field[1][2].cont = new Unit(2);
        this.field[2][1].cont = new Unit(1);
        this.field[3][0].cont = new Unit(2);
        this.field[1][6].cont = new Unit(1);
        this.field[2][6].cont = new Unit(2);
        this.field[4][0].cont = new Unit(1);
        this.field[5][0].cont = new Unit(2);
    }
    return Board;
}());
var tType;
(function (tType) {
    tType[tType["Normal"] = 0] = "Normal";
    tType[tType["Hidden"] = 1] = "Hidden";
    tType[tType["Blocked"] = 2] = "Blocked";
})(tType || (tType = {}));
var Land = /** @class */ (function () {
    function Land(terrain, x, y) {
        this.cont = Object.create(null);
        this.terrain = terrain;
        this.x = x;
        this.y = y;
    }
    Land.prototype.setUnit = function (u) {
        this.cont = u;
    };
    Land.prototype.removeHidden = function () {
        if (this.terrain == tType.Hidden) {
            this.terrain = tType.Normal;
        }
    };
    return Land;
}());
