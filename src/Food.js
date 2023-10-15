"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Food = void 0;
var Food = /** @class */ (function () {
    function Food(position, type, isGood) {
        this.colorBlue = 0;
        this.position = position;
        this.type = type;
        this.isGood = isGood;
        this.colorRed = isGood ? 0 : 255;
        this.colorGreen = isGood ? 255 : 0;
    }
    return Food;
}());
exports.Food = Food;
