import { Position } from "./Position.js";
import { Food } from "./Food.js";
export class DefenderPlayer {
    constructor(position) {
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
        this.repairTicksRemaining = 0;
        this.pathQueueIndex = 0;
        this.pathQueuePositions = [];
        this.shortestDistances = [];
        this.waypoints = [];
        this.ticksStandingStill = 0;
        this.logsInInventory = 0;
        this.foodInInventory = {
            TOFU: 9,
            CRACKERS: 9,
            WORMS: 9,
        };
        this.position = position;
    }
    tick(barbarianAssault) {
        this.ticksStandingStill++;
        if (this.repairTicksRemaining > 0) {
            this.repair(barbarianAssault);
        }
        if (this.foodBeingPickedUp !== null) {
            this.pickUpFood(barbarianAssault);
        }
        if (this.isPickingUpLogs) {
            this.pickUpLogs(barbarianAssault);
        }
        this.move();
    }
    findPath(barbarianAssault, destination) {
        for (let i = 0; i < barbarianAssault.map.width * barbarianAssault.map.height; i++) {
            this.shortestDistances[i] = 99999999;
            this.waypoints[i] = 0;
        }
        this.waypoints[this.position.x + this.position.y * barbarianAssault.map.width] = 99;
        this.shortestDistances[this.position.x + this.position.y * barbarianAssault.map.width] = 0;
        this.pathQueueIndex = 0;
        let pathQueueEnd = 0;
        this.pathQueuePositions[pathQueueEnd] = new Position(this.position.x, this.position.y);
        pathQueueEnd++;
        let currentPosition;
        let foundDestination = false;
        while (this.pathQueueIndex !== pathQueueEnd) {
            currentPosition = new Position(this.pathQueuePositions[this.pathQueueIndex].x, this.pathQueuePositions[this.pathQueueIndex].y);
            this.pathQueueIndex++;
            if (currentPosition.equals(destination)) {
                foundDestination = true;
                break;
            }
            const newDistance = this.shortestDistances[currentPosition.x + currentPosition.y * barbarianAssault.map.width] + 1;
            let index = currentPosition.x - 1 + currentPosition.y * barbarianAssault.map.width;
            if (currentPosition.x > 0 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136776) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x - 1, currentPosition.y);
                pathQueueEnd++;
                this.waypoints[index] = 2;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x + 1 + currentPosition.y * barbarianAssault.map.width;
            if (currentPosition.x < barbarianAssault.map.width - 1 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136896) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x + 1, currentPosition.y);
                pathQueueEnd++;
                this.waypoints[index] = 8;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x + (currentPosition.y - 1) * barbarianAssault.map.width;
            if (currentPosition.y > 0 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136770) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x, currentPosition.y - 1);
                pathQueueEnd++;
                this.waypoints[index] = 1;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x + (currentPosition.y + 1) * barbarianAssault.map.width;
            if (currentPosition.y < barbarianAssault.map.height - 1 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136800) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x, currentPosition.y + 1);
                pathQueueEnd++;
                this.waypoints[index] = 4;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x - 1 + (currentPosition.y - 1) * barbarianAssault.map.width;
            if (currentPosition.x > 0 && currentPosition.y > 0 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136782) === 0
                && (barbarianAssault.map.map[currentPosition.x - 1 + currentPosition.y * barbarianAssault.map.width] & 19136776) === 0
                && (barbarianAssault.map.map[currentPosition.x + (currentPosition.y - 1) * barbarianAssault.map.width] & 19136770) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x - 1, currentPosition.y - 1);
                pathQueueEnd++;
                this.waypoints[index] = 3;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x + 1 + (currentPosition.y - 1) * barbarianAssault.map.width;
            if (currentPosition.x < barbarianAssault.map.width - 1 && currentPosition.y > 0 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136899) === 0
                && (barbarianAssault.map.map[currentPosition.x + 1 + currentPosition.y * barbarianAssault.map.width] & 19136896) === 0
                && (barbarianAssault.map.map[currentPosition.x + (currentPosition.y - 1) * barbarianAssault.map.width] & 19136770) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x + 1, currentPosition.y - 1);
                pathQueueEnd++;
                this.waypoints[index] = 9;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x - 1 + (currentPosition.y + 1) * barbarianAssault.map.width;
            if (currentPosition.x > 0 && currentPosition.y < barbarianAssault.map.height - 1 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136824) === 0
                && (barbarianAssault.map.map[currentPosition.x - 1 + currentPosition.y * barbarianAssault.map.width] & 19136776) === 0
                && (barbarianAssault.map.map[currentPosition.x + (currentPosition.y + 1) * barbarianAssault.map.width] & 19136800) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x - 1, currentPosition.y + 1);
                pathQueueEnd++;
                this.waypoints[index] = 6;
                this.shortestDistances[index] = newDistance;
            }
            index = currentPosition.x + 1 + (currentPosition.y + 1) * barbarianAssault.map.width;
            if (currentPosition.x < barbarianAssault.map.width - 1 && currentPosition.y < barbarianAssault.map.height - 1 && this.waypoints[index] === 0 && (barbarianAssault.map.map[index] & 19136992) === 0
                && (barbarianAssault.map.map[currentPosition.x + 1 + currentPosition.y * barbarianAssault.map.width] & 19136896) === 0
                && (barbarianAssault.map.map[currentPosition.x + (currentPosition.y + 1) * barbarianAssault.map.width] & 19136800) === 0) {
                this.pathQueuePositions[pathQueueEnd] = new Position(currentPosition.x + 1, currentPosition.y + 1);
                pathQueueEnd++;
                this.waypoints[index] = 12;
                this.shortestDistances[index] = newDistance;
            }
        }
        if (!foundDestination) {
            let bestDistanceStart = 0x7FFFFFFF;
            let bestDistanceEnd = 0x7FFFFFFF;
            const deviation = 10;
            for (let x = destination.x - deviation; x <= destination.x + deviation; x++) {
                for (let y = destination.y - deviation; y <= destination.y + deviation; y++) {
                    if (x >= 0 && y >= 0 && x < barbarianAssault.map.width && y < barbarianAssault.map.height) {
                        const distanceStart = this.shortestDistances[x + y * barbarianAssault.map.width];
                        if (distanceStart < 100) {
                            const distanceEnd = Math.max(destination.x - x) ** 2 + Math.max(destination.y - y) ** 2;
                            if (distanceEnd < bestDistanceEnd || (distanceEnd === bestDistanceEnd && distanceStart < bestDistanceStart)) {
                                bestDistanceStart = distanceStart;
                                bestDistanceEnd = distanceEnd;
                                currentPosition = new Position(x, y);
                                foundDestination = true;
                            }
                        }
                    }
                }
            }
            if (!foundDestination) {
                this.pathQueueIndex = 0;
                return;
            }
        }
        this.pathQueueIndex = 0;
        while (!currentPosition.equals(this.position)) {
            const waypoint = this.waypoints[currentPosition.x + currentPosition.y * barbarianAssault.map.width];
            this.pathQueuePositions[this.pathQueueIndex] = new Position(currentPosition.x, currentPosition.y);
            this.pathQueueIndex++;
            if ((waypoint & 2) !== 0) {
                currentPosition.x++;
            }
            else if ((waypoint & 8) !== 0) {
                currentPosition.x--;
            }
            if ((waypoint & 1) !== 0) {
                currentPosition.y++;
            }
            else if ((waypoint & 4) !== 0) {
                currentPosition.y--;
            }
        }
    }
    dropFood(barbarianAssault, foodType) {
        if ((this.foodInInventory[foodType] > 0 || barbarianAssault.infiniteFood) && this.repairTicksRemaining === 0) {
            this.foodInInventory[foodType]--;
            barbarianAssault.map.addFood(new Food(new Position(this.position.x, this.position.y), foodType, foodType === barbarianAssault.defenderFoodCall));
        }
    }
    startRepairing(barbarianAssault) {
        if (this.repairTicksRemaining === 0 && ((this.isInRepairRange(barbarianAssault.eastTrapPosition) && barbarianAssault.eastTrapCharges < 2) || (this.isInRepairRange(barbarianAssault.westTrapPosition) && barbarianAssault.westTrapCharges < 2))) {
            if (this.logsInInventory > 0 || !barbarianAssault.requireLogs) {
                this.repairTicksRemaining = (this.ticksStandingStill === 0) ? 6 : 5;
            }
        }
    }
    repair(barbarianAssault) {
        if (this.repairTicksRemaining === 1) {
            this.repairTrap(barbarianAssault);
        }
        this.repairTicksRemaining--;
        this.pathQueueIndex = 0;
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
    }
    repairTrap(barbarianAssault) {
        if (this.isInRepairRange(barbarianAssault.eastTrapPosition)) {
            barbarianAssault.eastTrapCharges = 2;
            this.logsInInventory--;
        }
        else if (this.isInRepairRange(barbarianAssault.westTrapPosition)) {
            barbarianAssault.westTrapCharges = 2;
            this.logsInInventory--;
        }
    }
    pickUpFood(barbarianAssault) {
        if (this.foodBeingPickedUp === null) {
            return;
        }
        const foodZone = barbarianAssault.map.getFoodZone(this.position.x >>> 3, this.position.y >>> 3);
        for (let i = 0; i < foodZone.foodList.length; i++) {
            const food = foodZone.foodList[i];
            if (this.position.x === food.position.x && this.position.y === food.position.y && food.type === this.foodBeingPickedUp) {
                foodZone.foodList.splice(i, 1);
                this.foodInInventory[this.foodBeingPickedUp]++;
                break;
            }
        }
        this.pathQueueIndex = 0;
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
    }
    pickUpLogs(barbarianAssault) {
        if (!this.isPickingUpLogs) {
            return;
        }
        if (this.position.equals(barbarianAssault.northwestLogsPosition)) {
            if (barbarianAssault.northwestLogsArePresent) {
                this.logsInInventory++;
                barbarianAssault.northwestLogsArePresent = false;
            }
        }
        else if (this.position.equals(barbarianAssault.southeastLogsPosition)) {
            if (barbarianAssault.southeastLogsArePresent) {
                this.logsInInventory++;
                barbarianAssault.southeastLogsArePresent = false;
            }
        }
        this.pathQueueIndex = 0;
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
    }
    move() {
        if (this.takeSteps(2) === 0) {
            this.ticksStandingStill++; // TODO: having this here might lead to bug
        }
        else {
            this.ticksStandingStill = 0;
        }
    }
    takeSteps(steps) {
        let stepsTaken = 0;
        while (stepsTaken < steps && this.pathQueueIndex > 0) {
            this.pathQueueIndex--;
            this.position = this.pathQueuePositions[this.pathQueueIndex];
            stepsTaken++;
        }
        return stepsTaken;
    }
    isInRepairRange(position) {
        return Math.abs(this.position.x - position.x) + Math.abs(this.position.y - position.y) <= 1;
    }
    clone() {
        let defenderPlayer = new DefenderPlayer(this.position);
        defenderPlayer.position = this.position === null ? null : this.position.clone();
        defenderPlayer.foodBeingPickedUp = this.foodBeingPickedUp;
        defenderPlayer.isPickingUpLogs = this.isPickingUpLogs;
        defenderPlayer.repairTicksRemaining = this.repairTicksRemaining;
        defenderPlayer.pathQueueIndex = this.pathQueueIndex;
        defenderPlayer.pathQueuePositions = [];
        for (let i = 0; i < this.pathQueuePositions.length; i++) {
            defenderPlayer.pathQueuePositions.push(this.pathQueuePositions[i] === null ? null : this.pathQueuePositions[i].clone());
        }
        defenderPlayer.shortestDistances = [...this.shortestDistances];
        defenderPlayer.waypoints = [...this.waypoints];
        defenderPlayer.ticksStandingStill = this.ticksStandingStill;
        defenderPlayer.logsInInventory = this.logsInInventory;
        defenderPlayer.foodInInventory = Object.assign({}, this.foodInInventory);
        return defenderPlayer;
    }
}
