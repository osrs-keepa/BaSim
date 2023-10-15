import { Direction } from "./Direction.js";
export class RunnerPenanceRng {
    constructor(forcedMovements) {
        this.forcedMovements = forcedMovements;
    }
    rollMovement(forcedMovementsIndex) {
        if (this.forcedMovements !== undefined && this.forcedMovements.length > forcedMovementsIndex) {
            const movement = this.forcedMovements.charAt(forcedMovementsIndex++);
            switch (movement) {
                case "s":
                    return Direction.SOUTH;
                case "w":
                    return Direction.WEST;
                case "e":
                    return Direction.EAST;
            }
        }
        const randomNumber = Math.floor(Math.random() * 6);
        if (randomNumber < 4) {
            return Direction.SOUTH;
        }
        if (randomNumber === 4) {
            return Direction.WEST;
        }
        return Direction.EAST;
    }
    clone() {
        let runnerPenanceRng = new RunnerPenanceRng(this.forcedMovements);
        runnerPenanceRng.forcedMovements = this.forcedMovements;
        return runnerPenanceRng;
    }
}
