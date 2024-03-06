import { FoodType } from "./FoodType.js";
import { Position } from "./Position.js";
import { BarbarianAssaultMap } from "./BarbarianAssaultMap.js";
import { RunnerPenance } from "./RunnerPenance.js";
import { DefenderPlayer } from "./DefenderPlayer.js";
import { RunnerPenanceRng } from "./RunnerPenanceRng.js";
import { CollectorPlayer } from "./CollectorPlayer.js";
/**
 * Represents a game of Barbarian Assault: holds state information and exposes functions for
 * progressing the game state.
 */
export class BarbarianAssault {
    constructor(wave, requireRepairs, requireLogs, infiniteFood, runnerMovements, defenderLevel) {
        this.ticks = 0;
        this.defenderFoodCall = FoodType.TOFU;
        this.eastTrapCharges = 2;
        this.westTrapCharges = 2;
        this.northwestLogsArePresent = true;
        this.southeastLogsArePresent = true;
        this.eastTrapPosition = new Position(45, 26);
        this.westTrapPosition = new Position(15, 25);
        this.runnersToRemove = [];
        this.runnersAlive = 0;
        this.runnersKilled = 0;
        this.collectorPlayer = new CollectorPlayer(new Position(-1, -1));
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
            this.northwestLogsPosition = new Position(29, 39);
            this.southeastLogsPosition = new Position(30, 38);
            this.defenderPlayer = new DefenderPlayer(new Position(28, 8));
        }
        else {
            this.northwestLogsPosition = new Position(28, 39);
            this.southeastLogsPosition = new Position(29, 38);
            this.defenderPlayer = new DefenderPlayer(new Position(33, 8));
        }
        this.map = new BarbarianAssaultMap(wave);
    }
    /**
     * Progresses the game state by a single tick.
     */
    tick() {
        this.ticks++;
        // console.log('tick:', this.ticks);
        // console.log('runners', this.runners.length);
        this.runnersToRemove = [];
        for (let i = 0; i < this.runners.length; i++) {
            this.runners[i].tick(this);
        }
        for (let i = 0; i < this.runnersToRemove.length; i++) {
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
            let movements;
            if (this.runnerMovements.length > this.runnerMovementsIndex) {
                movements = this.runnerMovements[this.runnerMovementsIndex];
                this.runnerMovementsIndex++;
            }
            else {
                movements = "";
            }
            if (this.wave === 10) {
                this.runners.push(new RunnerPenance(new Position(42, 38), new RunnerPenanceRng(movements), this.currentRunnerId, this.defenderLevel < 2 ? 4 : 5));
            }
            else {
                this.runners.push(new RunnerPenance(new Position(36, 39), new RunnerPenanceRng(movements), this.currentRunnerId, this.defenderLevel < 2 ? 4 : 5));
            }
            this.currentRunnerId++;
            this.runnersAlive++;
        }
        this.defenderPlayer.tick(this);
    }
    /**
     * Changes the defender food call to be one of the foods that it is currently not,
     * each with equal probability
     *
     * @private
     */
    changeDefenderFoodCall() {
        switch (this.defenderFoodCall) {
            case FoodType.TOFU:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType.CRACKERS;
                }
                else {
                    this.defenderFoodCall = FoodType.WORMS;
                }
                break;
            case FoodType.CRACKERS:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType.WORMS;
                }
                else {
                    this.defenderFoodCall = FoodType.TOFU;
                }
                break;
            case FoodType.WORMS:
                if (Math.random() < 0.5) {
                    this.defenderFoodCall = FoodType.TOFU;
                }
                else {
                    this.defenderFoodCall = FoodType.CRACKERS;
                }
                break;
        }
    }
    /**
     * Determines if the tile with the given position blocks {@link Penance} movement
     * (i.e. Penance can not move onto the tile).
     *
     * @param position  the position of the tile to determine if Penance are blocked by
     * @return          true if the tile with the given position blocks Penance movement,
     *                  otherwise false
     */
    tileBlocksPenance(position) {
        if (position.equals(this.defenderPlayer.position)) {
            return true;
        }
        if (position.equals(this.collectorPlayer.position)) {
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
        else if (this.wave !== 10 && position.equals(new Position(27, 24))) {
            return true;
        }
        return false;
    }
    /**
     * Creates a deep clone of this object.
     *
     * @return  a deep clone of this object
     */
    clone() {
        let barbarianAssault = new BarbarianAssault(this.wave, this.requireRepairs, this.requireLogs, this.infiniteFood, this.runnerMovements, this.defenderLevel);
        barbarianAssault.map = this.map === null ? null : this.map.clone();
        barbarianAssault.ticks = this.ticks;
        barbarianAssault.wave = this.wave;
        barbarianAssault.maxRunnersAlive = this.maxRunnersAlive;
        barbarianAssault.totalRunners = this.totalRunners;
        barbarianAssault.defenderFoodCall = this.defenderFoodCall;
        barbarianAssault.eastTrapCharges = this.eastTrapCharges;
        barbarianAssault.westTrapCharges = this.westTrapCharges;
        barbarianAssault.northwestLogsArePresent = this.northwestLogsArePresent;
        barbarianAssault.southeastLogsArePresent = this.southeastLogsArePresent;
        barbarianAssault.eastTrapPosition = this.eastTrapPosition === null ? null : this.eastTrapPosition.clone();
        barbarianAssault.westTrapPosition = this.westTrapPosition === null ? null : this.westTrapPosition.clone();
        barbarianAssault.runnersToRemove = [];
        for (let i = 0; i < this.runnersToRemove.length; i++) {
            barbarianAssault.runnersToRemove.push(this.runnersToRemove[i] === null ? null : this.runnersToRemove[i].clone());
        }
        barbarianAssault.runnersAlive = this.runnersAlive;
        barbarianAssault.runnersKilled = this.runnersKilled;
        barbarianAssault.collectorPlayer = this.collectorPlayer === null ? null : this.collectorPlayer.clone();
        barbarianAssault.defenderPlayer = this.defenderPlayer === null ? null : this.defenderPlayer.clone();
        barbarianAssault.requireRepairs = this.requireRepairs;
        barbarianAssault.requireLogs = this.requireLogs;
        barbarianAssault.infiniteFood = this.infiniteFood;
        barbarianAssault.runners = [];
        for (let i = 0; i < this.runners.length; i++) {
            barbarianAssault.runners.push(this.runners[i] === null ? null : this.runners[i].clone());
        }
        barbarianAssault.runnerMovements = [...this.runnerMovements];
        barbarianAssault.runnerMovementsIndex = this.runnerMovementsIndex;
        barbarianAssault.currentRunnerId = this.currentRunnerId;
        barbarianAssault.defenderLevel = this.defenderLevel;
        return barbarianAssault;
    }
}
