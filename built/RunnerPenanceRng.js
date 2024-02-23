import { Direction } from "./Direction.js";
/**
 * Represents the random components of a {@link RunnerPenance}'s behavior.
 */
export class RunnerPenanceRng {
    constructor(forcedMovements) {
        this.forcedMovements = forcedMovements;
    }
    /**
     * Generates a movement direction, using the forced movement direction with the given
     * index if it is defined and less that the length of the list of forced movement directions;
     * otherwise randomly choosing south with probability 2/3, east with probability 1/6, or west
     * with probability 1/6.
     *
     * @param forcedMovementsIndex  the index to check in the list of forced movement directions
     * @return                      the generated movement direction
     */
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
    /**
     * Creates a deep clone of this object.
     *
     * @return  a deep clone of this object
     */
    clone() {
        let runnerPenanceRng = new RunnerPenanceRng(this.forcedMovements);
        runnerPenanceRng.forcedMovements = this.forcedMovements;
        return runnerPenanceRng;
    }
}
