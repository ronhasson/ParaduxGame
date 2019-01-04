"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Unit = /** @class */ (function () {
    function Unit(team) {
        this.name = "default unit, testing";
        this.nativeString = "~";
        this.moves = [[1, 1]];
        this.movePower = 1;
        this.moveStrict = true;
        this.toString = function () {
            //return this.nativeString;
            return " ";
        };
        this.team = team;
    }
    return Unit;
}());
var Soldier = /** @class */ (function (_super) {
    __extends(Soldier, _super);
    function Soldier(team) {
        var _this = _super.call(this, team) || this;
        _this.name = "Soldier";
        _this.nativeString = "^";
        _this.moves = [[1, 1], [1, -1], [-1, 1]];
        _this.movePower = 1;
        _this.moveStrict = true;
        return _this;
    }
    return Soldier;
}(Unit));
var Ace = /** @class */ (function (_super) {
    __extends(Ace, _super);
    function Ace(team) {
        var _this = _super.call(this, team) || this;
        _this.name = "Ace(Queen)";
        _this.nativeString = "*";
        _this.moves = [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [0, -1], [0, 1], [-1, 0]];
        _this.movePower = 3;
        _this.moveStrict = false;
        return _this;
    }
    return Ace;
}(Unit));
var Jumper = /** @class */ (function (_super) {
    __extends(Jumper, _super);
    function Jumper(team) {
        var _this = _super.call(this, team) || this;
        _this.name = "Jumper";
        _this.nativeString = "J";
        _this.moves = [[1, 0], [0, -1], [0, 1], [-1, 0]];
        _this.movePower = 1;
        _this.moveStrict = true;
        return _this;
    }
    return Jumper;
}(Unit));
var Spy = /** @class */ (function (_super) {
    __extends(Spy, _super);
    function Spy(team) {
        var _this = _super.call(this, team) || this;
        _this.name = "Spy";
        _this.nativeString = "S";
        return _this;
    }
    return Spy;
}(Unit));
var Magnet = /** @class */ (function (_super) {
    __extends(Magnet, _super);
    function Magnet(team) {
        var _this = _super.call(this, team) || this;
        _this.name = "Magnet";
        _this.nativeString = "U";
        return _this;
    }
    return Magnet;
}(Unit));
