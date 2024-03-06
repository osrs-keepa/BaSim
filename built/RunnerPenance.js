import { Position } from "./Position.js";
import { Direction } from "./Direction.js";
import { Penance } from "./Penance.js";
export class RunnerPenance extends Penance {
    constructor(position, rng, id, sniffDistance) {
        super(position);
        this.cycleTick = 1;
        this.targetState = 0;
        this.foodTarget = null;
        this.blughhhhCountdown = 0;
        this.ticksStandingStill = 0;
        this.despawnCountdown = null;
        this.isDying = false;
        this.forcedMovementsIndex = 0;
        this.rng = rng;
        this.id = id;
        this.sniffDistance = sniffDistance;
    }
    /**
     * @inheritDoc
     */
    tick(barbarianAssault) {
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
    }
    /**
     * This runner penance takes up to one step (if possible) in its path to its destination.
     *
     * @private
     */
    move(barbarianAssault) {
        const startX = this.position.x;
        if (this.destination.x > startX) {
            if (!barbarianAssault.tileBlocksPenance(new Position(startX + 1, this.position.y)) && barbarianAssault.map.canMoveEast(new Position(startX, this.position.y))) {
                this.position.x++;
                this.ticksStandingStill = 0;
            }
        }
        else if (this.destination.x < startX) {
            if (!barbarianAssault.tileBlocksPenance(new Position(startX - 1, this.position.y)) && barbarianAssault.map.canMoveWest(new Position(startX, this.position.y))) {
                this.position.x--;
                this.ticksStandingStill = 0;
            }
        }
        if (this.destination.y > this.position.y) {
            if (!barbarianAssault.tileBlocksPenance(new Position(startX, this.position.y + 1)) && !barbarianAssault.tileBlocksPenance(new Position(this.position.x, this.position.y + 1)) && barbarianAssault.map.canMoveNorth(new Position(startX, this.position.y)) && barbarianAssault.map.canMoveNorth(new Position(this.position.x, this.position.y))) {
                this.position.y++;
                this.ticksStandingStill = 0;
            }
        }
        else if (this.destination.y < this.position.y) {
            if (!barbarianAssault.tileBlocksPenance(new Position(startX, this.position.y - 1)) && !barbarianAssault.tileBlocksPenance(new Position(this.position.x, this.position.y - 1)) && barbarianAssault.map.canMoveSouth(new Position(startX, this.position.y)) && barbarianAssault.map.canMoveSouth(new Position(this.position.x, this.position.y))) {
                this.position.y--;
                this.ticksStandingStill = 0;
            }
        }
    }
    /**
     * This runner penance targets a {@link Food} if any valid targets exist.
     *
     * @param barbarianAssault  the BarbarianAssault game for this runner penance to attempt
     *                          to target a Food in
     * @private
     */
    tryTargetFood(barbarianAssault) {
        const xZone = this.position.x >> 3;
        const yZone = this.position.y >> 3;
        const endXZone = Math.max(xZone - 1, 0);
        const endYZone = Math.max(yZone - 1, 0);
        let firstFoodFound = null;
        for (let x = Math.min(xZone + 1, barbarianAssault.map.foodZonesWidth - 1); x >= endXZone; x--) {
            for (let y = Math.min(yZone + 1, barbarianAssault.map.foodZonesHeight - 1); y >= endYZone; y--) {
                const foodZone = barbarianAssault.map.getFoodZone(x, y);
                for (let foodIndex = foodZone.foodList.length - 1; foodIndex >= 0; foodIndex--) {
                    const food = foodZone.foodList[foodIndex];
                    if (!barbarianAssault.map.hasLineOfSight(new Position(this.position.x, this.position.y), new Position(food.position.x, food.position.y), 999)) {
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
    }
    /**
     * This runner penance eats its target {@link Food} if it has the same position as that Food.
     * If the Food is good and this runner penance is in death range of a trap with at least one
     * charge, then this runner penance starts dying. If the Food is bad, then this runner penance
     * blughhhhs.
     *
     * @param barbarianAssault  the BarbarianAssault game for this runner penance to attempt to
     *                          eat its target Food in
     * @private
     */
    tryEatAndCheckTarget(barbarianAssault) {
        if (this.foodTarget !== null) {
            const foodZone = barbarianAssault.map.getFoodZone(this.foodTarget.position.x >>> 3, this.foodTarget.position.y >>> 3);
            const foodIndex = foodZone.foodList.indexOf(this.foodTarget);
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
    }
    /**
     * Cancels this runner penance's destination (its destination becomes its current position).
     *
     * @private
     */
    cancelDestination() {
        this.destination.x = this.position.x;
        this.destination.y = this.position.y;
    }
    /**
     * Sets this runner penance's destination as if it just blughhhhd.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's blughhhh destination
     * @private
     */
    setDestinationBlughhhh(barbarianAssault) {
        this.destination.x = this.position.x;
        if (barbarianAssault.wave === 10) {
            this.destination.y = barbarianAssault.eastTrapPosition.y - 4;
        }
        else {
            this.destination.y = barbarianAssault.eastTrapPosition.y + 4;
        }
    }
    /**
     * Sets this runner penance's destination as if it is starting a random walk.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's random walk destination
     * @private
     */
    setDestinationRandomWalk(barbarianAssault) {
        if (this.position.x <= 27) {
            if (this.position.y === 8 || this.position.y === 9) {
                this.destination = new Position(30, 8);
                return;
            }
            if (this.position.equals(new Position(25, 7))) {
                this.destination = new Position(26, 8);
                return;
            }
        }
        else if (this.position.x <= 32) {
            if (this.position.y <= 8) {
                this.destination = new Position(30, 6);
                return;
            }
        }
        else if (this.position.y === 7 || this.position.y === 8) {
            this.destination = new Position(31, 8);
            return;
        }
        const direction = this.rng.rollMovement(this.forcedMovementsIndex);
        this.forcedMovementsIndex++;
        switch (direction) {
            case Direction.SOUTH:
                this.destination = new Position(this.position.x, this.position.y - 5);
                break;
            case Direction.WEST:
                this.destination = new Position(Math.max(this.position.x - 5, barbarianAssault.westTrapPosition.x - 1), this.position.y);
                break;
            case Direction.EAST:
                if (barbarianAssault.wave === 10) {
                    this.destination = new Position(Math.min(this.position.x + 5, barbarianAssault.eastTrapPosition.x - 1), this.position.y);
                }
                else {
                    this.destination = new Position(Math.min(this.position.x + 5, barbarianAssault.eastTrapPosition.x), this.position.y);
                }
                break;
        }
    }
    /**
     * Determines if this runner penance is in death range of a trap at the given position.
     *
     * @param position  the position to check if this runner penance is in death range of a trap at
     * @return          true if this runner penance is in death range of a trap at the given
     *                  position, otherwise false
     * @private
     */
    isInDeathRange(position) {
        return Math.abs(this.position.x - position.x) <= 1 && Math.abs(this.position.y - position.y) <= 1;
    }
    /**
     * This runner penance performs the actions for tick 1 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick1(barbarianAssault) {
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
        const ateOrTargetGone = this.tryEatAndCheckTarget(barbarianAssault);
        if (this.blughhhhCountdown === 0 && this.foodTarget === null) {
            this.cancelDestination();
        }
        if (!ateOrTargetGone) {
            this.move(barbarianAssault);
        }
    }
    /**
     * This runner penance performs the actions for ticks 2 and 5 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick2Or5(barbarianAssault) {
        if (this.targetState === 2) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    }
    /**
     * This runner penance performs the actions for tick 3 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick3(barbarianAssault) {
        if (this.targetState === 3) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    }
    /**
     * This runner penance performs the actions for tick 4 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick4(barbarianAssault) {
        if (this.targetState === 1) {
            this.tryTargetFood(barbarianAssault);
        }
        this.doTick7Through10(barbarianAssault);
    }
    /**
     * This runner penance performs the actions for tick 6 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick6(barbarianAssault) {
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
        const ateOrTargetGone = this.tryEatAndCheckTarget(barbarianAssault);
        if (this.blughhhhCountdown === 0 && (this.foodTarget === null || ateOrTargetGone)) {
            this.setDestinationRandomWalk(barbarianAssault);
        }
        if (!ateOrTargetGone) {
            this.move(barbarianAssault);
        }
    }
    /**
     * This runner penance performs the actions for ticks 7 through 10 of its 10-tick cycle.
     *
     * @param barbarianAssault  the BarbarianAssault game to use as reference in determining
     *                          this runner penance's actions
     * @private
     */
    doTick7Through10(barbarianAssault) {
        if (!this.tryEatAndCheckTarget(barbarianAssault)) {
            this.move(barbarianAssault);
        }
    }
    /**
     * Prints the given message along with the current tick count of the given BarbarianAssault
     * game and the ID of this runner penance.
     *
     * @param message           the message to print
     * @param barbarianAssault  the BarbarianAssault game to print the tick count of
     * @private
     */
    print(message, barbarianAssault) {
        // console.log(barbarianAssault.ticks + ": Runner " + this.id + ": " + message);
    }
    /**
     * Creates a deep clone of this object.
     *
     * @return  a deep clone of this object
     */
    clone() {
        let runnerPenance = new RunnerPenance(this.position, this.rng, this.id, this.sniffDistance);
        runnerPenance.position = this.position === null ? null : this.position.clone();
        runnerPenance.destination = this.destination === null ? null : this.destination.clone();
        runnerPenance.cycleTick = this.cycleTick;
        runnerPenance.targetState = this.targetState;
        runnerPenance.foodTarget = this.foodTarget === null ? null : this.foodTarget.clone();
        runnerPenance.blughhhhCountdown = this.blughhhhCountdown;
        runnerPenance.ticksStandingStill = this.ticksStandingStill;
        runnerPenance.despawnCountdown = this.despawnCountdown;
        runnerPenance.isDying = this.isDying;
        runnerPenance.rng = this.rng === null ? null : this.rng.clone();
        runnerPenance.id = this.id;
        runnerPenance.forcedMovementsIndex = this.forcedMovementsIndex;
        runnerPenance.sniffDistance = this.sniffDistance;
        return runnerPenance;
    }
}
