// @ts-ignore
import { describe, expect, test, vi } from "vitest";
import { RunnerPenanceRng } from "../src/RunnerPenanceRng.js";
import { Direction } from "../src/Direction.js";
describe("rollMovement", () => {
    test.each([
        ["s", Direction.SOUTH],
        ["w", Direction.WEST],
        ["e", Direction.EAST],
    ])("forceMovements \"%s\" rolls direction %s", (movement, direction) => {
        const forcedMovements = movement;
        const runnerPenanceRng = new RunnerPenanceRng(forcedMovements);
        expect(runnerPenanceRng.rollMovement(0)).toBe(direction);
    });
    test.each([
        [0, Direction.SOUTH],
        [0.7, Direction.WEST],
        [0.9, Direction.EAST],
    ])("empty forceMovements and random number %d rolls direction %s", (randomNumber, direction) => {
        const forcedMovements = "";
        const runnerPenanceRng = new RunnerPenanceRng(forcedMovements);
        const mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(randomNumber);
        expect.soft(runnerPenanceRng.rollMovement(0)).toBe(direction);
        expect.soft(mathRandomSpy).toHaveBeenCalledOnce();
        vi.spyOn(Math, "random").mockRestore;
    });
    test.each([
        [0, Direction.SOUTH],
        [0.7, Direction.WEST],
        [0.9, Direction.EAST],
    ])("forceMovementsIndex not less than forceMovements length and random number %d rolls direction %s", (randomNumber, direction) => {
        const forcedMovements = "wsee";
        const runnerPenanceRng = new RunnerPenanceRng(forcedMovements);
        const mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(randomNumber);
        expect.soft(runnerPenanceRng.rollMovement(4)).toBe(direction);
        expect.soft(mathRandomSpy).toHaveBeenCalledOnce();
        vi.spyOn(Math, "random").mockRestore;
    });
});
describe("clone", () => {
    test("clone is a deep copy", () => {
        const forcedMovements = "wsee";
        const runnerPenanceRng = new RunnerPenanceRng(forcedMovements);
        const runnerPenanceRngClone = runnerPenanceRng.clone();
        expect(runnerPenanceRngClone).not.toBe(runnerPenanceRng);
        expect(runnerPenanceRngClone.forcedMovements).toBe(runnerPenanceRng.forcedMovements);
    });
});
