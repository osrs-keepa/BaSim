import {Position} from "./Position.js";
import {FoodType} from "./FoodType.js";
import {BarbarianAssault} from "./BarbarianAssault.js";
import {FoodZone} from "./FoodZone.js";
import {Food} from "./Food.js";
import {Player} from "./Player.js";

export class DefenderPlayer extends Player {
    public foodBeingPickedUp: FoodType = null;
    public isPickingUpLogs: boolean = false;
    public repairTicksRemaining: number = 0;
    public pathQueueIndex: number = 0;
    public pathQueuePositions: Array<Position> = [];
    public shortestDistances: Array<number> = [];
    public waypoints: Array<number> = [];
    public ticksStandingStill: number = 0;
    public logsInInventory: number = 0;
    public foodInInventory: Record<FoodType, number> = {
        TOFU: 9,
        CRACKERS: 9,
        WORMS: 9,
    };

    public constructor(position: Position) {
        super(position);
    }

    public tick(barbarianAssault: BarbarianAssault): void {
        this.ticksStandingStill++;

        if (this.repairTicksRemaining > 0) {
            this.repair(barbarianAssault);
        }

        if (this.foodBeingPickedUp !== null) {
            this.pickUpFood(barbarianAssault)
        }

        if (this.isPickingUpLogs) {
            this.pickUpLogs(barbarianAssault);
        }

        this.move();
    }

    public dropFood(barbarianAssault: BarbarianAssault, foodType: FoodType): void {
        if ((this.foodInInventory[foodType] > 0 || barbarianAssault.infiniteFood) && this.repairTicksRemaining === 0) {
            this.foodInInventory[foodType]--;
            barbarianAssault.map.addFood(new Food(new Position(this.position.x, this.position.y), foodType, foodType === barbarianAssault.defenderFoodCall));
        }
    }

    public startRepairing(barbarianAssault: BarbarianAssault): void {
        if (this.repairTicksRemaining === 0 && ((this.isInRepairRange(barbarianAssault.eastTrapPosition) && barbarianAssault.eastTrapCharges < 2) || (this.isInRepairRange(barbarianAssault.westTrapPosition) && barbarianAssault.westTrapCharges < 2))) {
            if (this.logsInInventory > 0 || !barbarianAssault.requireLogs) {
                this.repairTicksRemaining = (this.ticksStandingStill === 0) ? 6 : 5;
            }
        }
    }

    private repair(barbarianAssault: BarbarianAssault): void {
        if (this.repairTicksRemaining === 1) {
            this.repairTrap(barbarianAssault);
        }

        this.repairTicksRemaining--;
        this.pathQueueIndex = 0;
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
    }

    private repairTrap(barbarianAssault: BarbarianAssault): void {
        if (this.isInRepairRange(barbarianAssault.eastTrapPosition)) {
            barbarianAssault.eastTrapCharges = 2;
            this.logsInInventory--;
        } else if (this.isInRepairRange(barbarianAssault.westTrapPosition)) {
            barbarianAssault.westTrapCharges = 2;
            this.logsInInventory--;
        }
    }

    private pickUpFood(barbarianAssault: BarbarianAssault): void {
        if (this.foodBeingPickedUp === null) {
            return;
        }

        const foodZone: FoodZone = barbarianAssault.map.getFoodZone(this.position.x >>> 3, this.position.y >>> 3);

        for (let i: number = 0; i < foodZone.foodList.length; i++) {
            const food: Food = foodZone.foodList[i];

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

    private pickUpLogs(barbarianAssault: BarbarianAssault): void {
        if (!this.isPickingUpLogs) {
            return;
        }

        if (this.position.equals(barbarianAssault.northwestLogsPosition)) {
            if (barbarianAssault.northwestLogsArePresent) {
                this.logsInInventory++;
                barbarianAssault.northwestLogsArePresent = false;
            }
        } else if (this.position.equals(barbarianAssault.southeastLogsPosition)) {
            if (barbarianAssault.southeastLogsArePresent) {
                this.logsInInventory++;
                barbarianAssault.southeastLogsArePresent = false;
            }
        }

        this.pathQueueIndex = 0;
        this.foodBeingPickedUp = null;
        this.isPickingUpLogs = false;
    }

    protected move(): void {
        if(this.takeSteps(2) === 0) {
            this.ticksStandingStill++; // TODO: having this here might lead to bug
        } else {
            this.ticksStandingStill = 0;
        }
    }

    private takeSteps(steps: number): number {
        let stepsTaken: number = 0;

        while (stepsTaken < steps && this.pathQueueIndex > 0) {
            this.pathQueueIndex--;
            this.position = this.pathQueuePositions[this.pathQueueIndex];
            stepsTaken++;
        }

        return stepsTaken;
    }

    private isInRepairRange(position: Position): boolean {
        return Math.abs( this.position.x - position.x) + Math.abs(this.position.y - position.y) <= 1;
    }

    public clone(): DefenderPlayer {
        let defenderPlayer: DefenderPlayer = new DefenderPlayer(this.position);
        defenderPlayer.position = this.position === null ? null : this.position.clone();
        defenderPlayer.foodBeingPickedUp = this.foodBeingPickedUp;
        defenderPlayer.isPickingUpLogs = this.isPickingUpLogs;
        defenderPlayer.repairTicksRemaining = this.repairTicksRemaining;
        defenderPlayer.pathQueueIndex = this.pathQueueIndex;
        defenderPlayer.pathQueuePositions = [];
        for (let i: number = 0; i < this.pathQueuePositions.length; i++) {
            defenderPlayer.pathQueuePositions.push(this.pathQueuePositions[i] === null ? null : this.pathQueuePositions[i].clone());
        }
        defenderPlayer.shortestDistances = [...this.shortestDistances];
        defenderPlayer.waypoints = [...this.waypoints];
        defenderPlayer.ticksStandingStill = this.ticksStandingStill;
        defenderPlayer.logsInInventory = this.logsInInventory;
        defenderPlayer.foodInInventory = {...this.foodInInventory};

        return defenderPlayer;
    }
}