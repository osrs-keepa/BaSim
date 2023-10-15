"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerPenance = void 0;
var Position_1 = require("./Position");
var Direction_1 = require("./Direction");
var RunnerPenance = /** @class */ (function () {
    function RunnerPenance(position, rng, id, sniffDistance) {
        this.cycleTick = 1;
        this.targetState = 0;
        this.foodTarget = null;
        this.blughhhhCountdown = 0;
        this.ticksStandingStill = 0;
        this.despawnCountdown = null;
        this.isDying = false;
        this.forcedMovementsIndex = 0;
        this.position = position;
        this.destination = position;
        this.rng = rng;
        this.id = id;
        this.sniffDistance = sniffDistance;
    }
    RunnerPenance.prototype.tick = function (barbarianAssault) {
        this.cycleTick++;
        if (this.cycleTick > 10) {
            this.cycleTick = 1;
        }
        this.ticksStandingStill++;
        if (this.despawnCountdown !== null) {
            this.despawnCountdown--;
            if (this.despawnCountdown === 0) {
                barbarianAssault.runnersToRemove.push(this);
                if (!this.isDying) {
                    barbarianAssault.runnersAlive--;
                }
                else {
                    if (this.isInDeathRange(barbarianAssault.eastTrapPosition)) {
                        if (barbarianAssault.eastTrapCharges > 0) {
                            barbarianAssault.eastTrapCharges--;
                        }
                    }
                    if (this.isInDeathRange(barbarianAssault.westTrapPosition)) {
                        if (barbarianAssault.westTrapCharges > 0) {
                            barbarianAssault.westTrapCharges--;
                        }
                    }
                }
            }
        }
        else {
            if (!this.isDying) {
                switch (this.cycleTick) {
                    case 1:
                        this.doTick1(barbarianAssault);
                        break;
                    case 2:
                    case 5:
                        this.doTick2Or5(barbarianAssault);
                        break;
                    case 3:
                        this.doTick3(barbarianAssault);
                        break;
                    case 4:
                        this.doTick4(barbarianAssault);
                        break;
                    case 6:
                        this.doTick6(barbarianAssault);
                        break;
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                        this.doTick7Through10(barbarianAssault);
                        break;
                }
            }
            if (this.isDying) {
                if (this.ticksStandingStill >= 3) {
                    barbarianAssault.runnersKilled++;
                    barbarianAssault.runnersAlive--;
                    this.print("Urghhh!", barbarianAssault);
                    this.despawnCountdown = 2;
                }
            }
        }
    };
    RunnerPenance.prototype.move = function (barbarianAssault) {
        var startX = this.position.x;
        if (this.destination.x > startX) {
            if (!barbarianAssault.tileBlocksPenance(new Position_1.Position(startX + 1, this.position.y)) && barbarianAssault.map.canMoveEast(new Position_1.Position(startX, this.position.y))) {
                this.position.x++;
                this.ticksStandingStill = 0;
            }
        }
        else if (this.destination.x < startX) {
            if (!barbarianAssault.tileBlocksPenance(new Position_1.Position(startX - 1, this.position.y)) && barbarianAssault.map.canMoveWest(new Position_1.Position(startX, this.position.y))) {
                this.position.x--;
                this.ticksStandingStill = 0;
            }
        }
        if (this.destination.y > this.position.y) {
            if (!barbarianAssault.tileBlocksPenance(new Position_1.Position(startX, this.position.y + 1)) && !barbarianAssault.tileBlocksPenance(new Position_1.Position(this.position.x, this.position.y + 1)) && barbarianAssault.map.canMoveNorth(new Position_1.Position(startX, this.position.y)) && barbarianAssault.map.canMoveNorth(new Position_1.Position(this.position.x, this.position.y))) {
                this.position.y++;
                this.ticksStandingStill = 0;
            }
        }
        else if (this.destination.y < this.position.y) {
            if (!barbarianAssault.tileBlocksPenance(new Position_1.Position(startX, this.position.y - 1)) && !barbarianAssault.tileBlocksPenance(new Position_1.Position(this.position.x, this.position.y - 1)) && barbarianAssault.map.canMoveSouth(new Position_1.Position(startX, this.position.y)) && barbarianAssault.map.canMoveSouth(new Position_1.Position(this.position.x, this.position.y))) {
                this.position.y--;
                this.ticksStandingStill = 0;
            }
        }
    };
    RunnerPenance.prototype.tryTargetFood = function (barbarianAssault) {
        var xZone = this.position.x >> 3;
        var yZone = this.position.y >> 3;
        var endXZone = Math.max(xZone - 1, 0);
        var endYZone = Math.max(yZone - 1, 0);
        var firstFoodFound = null;
        for (var x = Math.min(xZone + 1, barbarianAssault.map.foodZonesWidth - 1); x >= endXZone; x--) {
            for (var y = Math.min(yZone + 1, barbarianAssault.map.foodZonesHeight - 1); y >= endYZone; y--) {
                var foodZone = barbarianAssault.map.getFoodZone(x, y);
                for (var foodIndex = foodZone.foodList.length - 1; foodIndex >= 0; foodIndex--) {
                    var food = foodZone[foodIndex];
                    if (!barbarianAssault.map.hasLineOfSight(new Position_1.Position(this.position.x, this.position.y), new Position_1.Position(food.position.x, food.position.y))) {
                        continue;
                    }
                    if (firstFoodFound === null) {
                        firstFoodFound = food;
                    }
                    if (Math.max(Math.abs(this.position.x - food.position.x), Math.abs(this.position.y - food.position.y)) <= this.sniffDistance) {
                        this.foodTarget = firstFoodFound;
                        this.destination.x = firstFoodFound.position.x;
                        this.destination.y = firstFoodFound.position.y;
                        this.targetState = 0;
                        return;
                    }
                }
            }
        }
    };
    RunnerPenance.prototype.tryEatAndCheckTarget = function (barbarianAssault) {
        if (this.foodTarget !== null) {
            var foodZone = barbarianAssault.map.getFoodZone(this.foodTarget.position.x >>> 3, this.foodTarget.position.y >>> 3);
            var foodIndex = foodZone.foodList.indexOf(this.foodTarget);
            if (foodIndex === -1) {
                this.foodTarget = null;
                this.targetState = 0;
                return true;
            }
            if (this.position.equals(this.foodTarget.position)) {
                if (this.foodTarget.isGood) {
                    this.print("Chomp, chomp.", barbarianAssault);
                    if (this.isInDeathRange(barbarianAssault.eastTrapPosition)) {
                        if (barbarianAssault.eastTrapCharges > 0 || !barbarianAssault.requireRepairs) {
                            this.isDying = true;
                        }
                    }
                    if (this.isInDeathRange(barbarianAssault.westTrapPosition)) {
                        if (barbarianAssault.westTrapCharges > 0 || !barbarianAssault.requireRepairs) {
                            this.isDying = true;
                        }
                    }
                }
                else {
                    this.print("Blughhhh.", barbarianAssault);
                    this.blughhhhCountdown = 3;
                    this.targetState = 0;
                    if (this.cycleTick > 5) {
                        this.cycleTick -= 5;
                    }
                    this.setDestinationBlughhhh(barbarianAssault);
                }
                foodZone.foodList.splice(foodIndex, 1);
                return true;
            }
        }
        return false;
    };
    RunnerPenance.prototype.cancelDestination = function () {
        this.destination.x = this.position.x;
        this.destination.y = this.position.y;
    };
    RunnerPenance.prototype.setDestinationBlughhhh = function (barbarianAssault) {
        this.destination.x = this.position.x;
        if (barbarianAssault.wave === 10) {
            this.destination.y = barbarianAssault.eastTrapPosition.y - 4;
        }
        else {
            this.destination.y = barbarianAssault.eastTrapPosition.y + 4;
        }
    };
    RunnerPenance.prototype.setDestinationRandomWalk = function (barbarianAssault) {
        if (this.position.x <= 27) {
            if (this.position.y === 8 || this.position.y === 9) {
                this.destination = new Position_1.Position(30, 8);
                return;
            }
            if (this.position.equals(new Position_1.Position(25, 7))) {
                this.destination = new Position_1.Position(26, 8);
                return;
            }
        }
        else if (this.position.x <= 32) {
            if (this.position.y <= 8) {
                this.destination = new Position_1.Position(30, 6);
                return;
            }
        }
        else if (this.position.y === 7 || this.position.y === 8) {
            this.destination = new Position_1.Position(31, 8);
            return;
        }
        var direction = this.rng.rollMovement(this.forcedMovementsIndex);
        this.forcedMovementsIndex++;
        switch (direction) {
            case Direction_1.Direction.SOUTH:
                this.destination = new Position_1.Position(this.position.x, this.position.y - 5);
                break;
            case Direction_1.Direction.WEST:
                this.destination = new Position_1.Position(Math.max(this.position.x - 5, barbarianAssault.westTrapPosition.x - 1), this.position.y);
                break;
            case Direction_1.Direction.EAST:
                if (barbarianAssault.wave === 10) {
                    this.destination = new Position_1.Position(Math.min(this.position.x + 5, barbarianAssault.eastTrapPosition.x - 1), this.position.y);
                }
                else {
                    this.destination = new Position_1.Position(Math.min(this.position.x + 5, barbarianAssault.eastTrapPosition.x), this.position.y);
                }
                break;
        }
    };
    RunnerPenance.prototype.isInDeathRange = function (position) {
        return Math.abs(this.position.x - position.x) <= 1 && Math.abs(this.position.y - position.y) <= 1;
    };
    RunnerPenance.prototype.doTick1 = function (barbarianAssault) {
        if (this.position.y === 6) {
            this.despawnCountdown = 3;
            this.print("Raaa!", barbarianAssault);
            return;
        }
        if (this.blughhhhCountdown > 0) {
            this.blughhhhCountdown--;
        }
        else {
            this.targetState++;
            if (this.targetState > 3) {
                this.targetState = 1;
            }
        }
        var ateOrTargetGone = this.tryEatAndCheckTarget(barbarianAssault);
        if (this.blughhhhCountdown === 0 && this.foodTarget === null) {
            this.cancelDestination();
        }
        if (!ateOrTargetGone) {
            this.move(barbarianAssault);
        }
    };
    RunnerPenance.prototype.doTick2Or5 = function (barbarianAssault) {
        if (this.targetState === 2) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    };
    RunnerPenance.prototype.doTick3 = function (barbarianAssault) {
        if (this.targetState === 3) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    };
    RunnerPenance.prototype.doTick4 = function (barbarianAssault) {
        if (this.targetState === 1) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    };
    RunnerPenance.prototype.doTick6 = function (barbarianAssault) {
        if (this.position.y === 6) {
            this.despawnCountdown = 3;
            this.print("Raaa!", barbarianAssault);
            return;
        }
        if (this.blughhhhCountdown > 0) {
            this.blughhhhCountdown--;
        }
        if (this.targetState === 3) {
            this.tryTargetFood(barbarianAssault);
        }
        var ateOrTargetGone = this.tryEatAndCheckTarget(barbarianAssault);
        if (this.blughhhhCountdown === 0 && (this.foodTarget === null || ateOrTargetGone)) {
            this.setDestinationRandomWalk(barbarianAssault);
        }
        if (!ateOrTargetGone) {
            this.move(barbarianAssault);
        }
    };
    RunnerPenance.prototype.doTick7Through10 = function (barbarianAssault) {
        if (!this.tryEatAndCheckTarget(barbarianAssault)) {
            this.move(barbarianAssault);
        }
    };
    RunnerPenance.prototype.print = function (message, barbarianAssault) {
        console.log(barbarianAssault.ticks + ": Runner " + this.id + ": " + message);
    };
    return RunnerPenance;
}());
exports.RunnerPenance = RunnerPenance;
