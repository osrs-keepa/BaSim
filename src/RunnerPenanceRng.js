"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerPenanceRng = void 0;
var Direction_1 = require("./Direction");
var RunnerPenanceRng = /** @class */ (function () {
    function RunnerPenanceRng(forcedMovements) {
        this.forcedMovements = forcedMovements;
    }
    RunnerPenanceRng.prototype.rollMovement = function (forcedMovementsIndex) {
        if (this.forcedMovements.length > forcedMovementsIndex) {
            var movement = this.forcedMovements.charAt(forcedMovementsIndex++);
            switch (movement) {
                case "s":
                    return Direction_1.Direction.SOUTH;
                case "w":
                    return Direction_1.Direction.WEST;
                case "e":
                    return Direction_1.Direction.EAST;
            }
        }
        var randomNumber = Math.floor(Math.random() * 6);
        if (randomNumber < 4) {
            return Direction_1.Direction.SOUTH;
            ;
        }
        if (randomNumber === 4) {
            return Direction_1.Direction.WEST;
        }
        return Direction_1.Direction.EAST;
    };
    return RunnerPenanceRng;
}());
exports.RunnerPenanceRng = RunnerPenanceRng;
