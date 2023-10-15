"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
var Position = /** @class */ (function () {
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    Position.prototype.equals = function (position) {
        return this.x === position.x && this.y === position.y;
    };
    return Position;
}());
exports.Position = Position;
