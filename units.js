"use strict";
var Unit = /** @class */ (function () {
    function Unit(team) {
        this.name = "default unit, testing";
        this.nativeString = "~";
        this.toString = function () {
            //return this.nativeString;
            return " ";
        };
        this.team = team;
    }
    return Unit;
}());
