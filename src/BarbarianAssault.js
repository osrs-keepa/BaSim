"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbarianAssault = void 0;
var FoodType_1 = require("./FoodType");
var Position_1 = require("./Position");
var BarbarianAssaultMap_1 = require("./BarbarianAssaultMap");
var RunnerPenance_1 = require("./RunnerPenance");
var DefenderPlayer_1 = require("./DefenderPlayer");
var RunnerPenanceRng_1 = require("./RunnerPenanceRng");
var BarbarianAssault = /** @class */ (function () {
    function BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, runnerMovements, defenderLevel) {
        this.ticks = 0;
        this.defenderFoodCall = FoodType_1.FoodType.TOFU;
        this.eastTrapCharges = 2;
        this.westTrapCharges = 2;
        this.northwestLogsArePresent = true;
        this.southeastLogsArePresent = true;
        this.eastTrapPosition = new Position_1.Position(45, 26);
        this.westTrapPosition = new Position_1.Position(15, 25);
        this.runnersToRemove = [];
        this.runnersAlive = 0;
        this.runnersKilled = 0;
        this.collectorPlayerPosition = null;
        this.runners = [];
        this.runnerMovementsIndex = 0;
        this.currentRunnerId = 1;
        this.wave = wave;
        this.requireRepairs = requireRepairs;
        this.requireLogs = requireLogs;
        this.infiniteFood = infiniteFood;
        this.runnerMovements = runnerMovements;
        this.defenderLevel = defenderLevel;
        switch (wave) {
            case 1:
                this.maxRunnersAlive = 2;
                this.totalRunners = 2;
                break;
            case 2:
                this.maxRunnersAlive = 2;
                this.totalRunners = 3;
                break;
            case 3:
                this.maxRunnersAlive = 2;
                this.totalRunners = 4;
                break;
            case 4:
                this.maxRunnersAlive = 3;
                this.totalRunners = 4;
                break;
            case 5:
                this.maxRunnersAlive = 4;
                this.totalRunners = 5;
                break;
            case 6:
                this.maxRunnersAlive = 4;
                this.totalRunners = 6;
                break;
            case 7:
            case 10:
                this.maxRunnersAlive = 5;
                this.totalRunners = 6;
                break;
            case 8:
                this.maxRunnersAlive = 5;
                this.totalRunners = 7;
                break;
            case 9:
                this.maxRunnersAlive = 5;
                this.totalRunners = 9;
                break;
        }
        if (wave === 10) {
            this.northwestLogsPosition = new Position_1.Position(29, 39);
            this.southeastLogsPosition = new Position_1.Position(30, 38);
            this.defenderPlayer = new DefenderPlayer_1.DefenderPlayer(new Position_1.Position(28, 8));
        }
        else {
            this.northwestLogsPosition = new Position_1.Position(28, 39);
            this.southeastLogsPosition = new Position_1.Position(29, 38);
            this.defenderPlayer = new DefenderPlayer_1.DefenderPlayer(new Position_1.Position(33, 8));
        }
        this.map = new BarbarianAssaultMap_1.BarbarianAssaultMap(wave);
    }
    BarbarianAssault.prototype.tick = function () {
        this.ticks++;
        this.runnersToRemove.length = 0;
        for (var i = 0; i < this.runners.length; i++) {
            this.runners[i].tick(this);
        }
        for (var i = 0; i < this.runnersToRemove.length; i++) {
            this.runners.splice(this.runners.indexOf(this.runnersToRemove[i]), 1);
        }
        if (this.ticks > 1 && this.ticks % 10 === 1) {
            this.northwestLogsArePresent = true;
            this.southeastLogsArePresent = true;
        }
        if (this.ticks > 2 && this.ticks % 50 === 2) {
            this.changeDefenderFoodCall();
        }
        if (this.ticks > 1 && this.ticks % 10 === 1 && this.runnersAlive < this.maxRunnersAlive && this.runnersKilled + this.runnersAlive < this.totalRunners) {
            var movements = void 0;
            if (this.runnerMovements.length > this.runnerMovementsIndex) {
                movements = this.runnerMovements[this.runnerMovementsIndex];
                this.runnerMovementsIndex++;
            }
            else {
                movements = "";
            }
            if (this.wave === 10) {
                this.runners.push(new RunnerPenance_1.RunnerPenance(new Position_1.Position(42, 38), new RunnerPenanceRng_1.RunnerPenanceRng(movements), this.currentRunnerId, this.defenderLevel < 2 ? 4 : 5));
            }
            else {
                this.runners.push(new RunnerPenance_1.RunnerPenance(new Position_1.Position(36, 39), new RunnerPenanceRng_1.RunnerPenanceRng(movements), this.currentRunnerId, this.defenderLevel < 2 ? 4 : 5));
            }
            this.currentRunnerId++;
            this.runnersAlive++;
        }
        this.defenderPlayer.tick(this);
    };
    BarbarianAssault.prototype.changeDefenderFoodCall = function () {
        switch (this.defenderFoodCall) {
            case FoodType_1.FoodType.TOFU:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType_1.FoodType.CRACKERS;
                }
                else {
                    this.defenderFoodCall = FoodType_1.FoodType.WORMS;
                }
                break;
            case FoodType_1.FoodType.CRACKERS:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType_1.FoodType.WORMS;
                }
                else {
                    this.defenderFoodCall = FoodType_1.FoodType.TOFU;
                }
                break;
            case FoodType_1.FoodType.WORMS:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType_1.FoodType.TOFU;
                }
                else {
                    this.defenderFoodCall = FoodType_1.FoodType.CRACKERS;
                }
                break;
        }
    };
    BarbarianAssault.prototype.tileBlocksPenance = function (position) {
        if (position.equals(this.defenderPlayer.position)) {
            return true;
        }
        if (this.collectorPlayerPosition !== null && position.equals(this.collectorPlayerPosition)) {
            return true;
        }
        if (position.y === 22) {
            if (position.x >= 20 && position.x <= 22) {
                return true;
            }
            if (this.wave !== 10 && position.x >= 39 && position.x <= 41) {
                return true;
            }
        }
        else if (position.x === 46 && position.y >= 9 && position.y <= 12) {
            return true;
        }
        else if (this.wave !== 10 && position.equals(new Position_1.Position(27, 24))) {
            return true;
        }
        return false;
    };
    return BarbarianAssault;
}());
exports.BarbarianAssault = BarbarianAssault;
