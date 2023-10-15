import {Direction} from "./Direction.js";

export class RunnerPenanceRng {
    public forcedMovements: string;

    public constructor(forcedMovements: string) {
        this.forcedMovements = forcedMovements;
    }

    public rollMovement(forcedMovementsIndex: number): Direction {
        if (this.forcedMovements !== undefined && this.forcedMovements.length > forcedMovementsIndex) {
            const movement: string = this.forcedMovements.charAt(forcedMovementsIndex++);

            switch (movement) {
                case "s":
                    return Direction.SOUTH;
                case "w":
                    return Direction.WEST;
                case "e":
                    return Direction.EAST;
            }
        }

        const randomNumber: number = Math.floor(Math.random() * 6);

        if (randomNumber < 4) {
            return Direction.SOUTH;
        }

        if (randomNumber === 4) {
            return Direction.WEST;
        }

        return Direction.EAST;
    }

    public clone(): RunnerPenanceRng {
        let runnerPenanceRng: RunnerPenanceRng = new RunnerPenanceRng(this.forcedMovements);
        runnerPenanceRng.forcedMovements = this.forcedMovements;

        return runnerPenanceRng;
    }
}