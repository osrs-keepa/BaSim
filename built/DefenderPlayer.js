import { Position } from "./Position.js";
import { Food } from "./Food.js";
import { Player } from "./Player.js";
export class DefenderPlayer extends Player {
    constructor(position) {
        super(position);
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
