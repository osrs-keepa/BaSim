import {describe, expect, test} from "vitest";
import {Position} from "../src/Position.js";

describe("equals", (): void => {
    test("equal if x and y are equal", (): void => {
        const position1: Position = new Position(1, 2);
        const position2: Position = new Position(1, 2);

        expect(position1.equals(position2)).toBe(true);
    });

    test("not equal if x is not equal", (): void => {
        const position1: Position = new Position(1, 2);
        const position2: Position = new Position(0, 2);

        expect(position1.equals(position2)).toBe(false);
    });

    test("not equal if y is not equal", (): void => {
        const position1: Position = new Position(1, 2);
        const position2: Position = new Position(1, 0);

        expect(position1.equals(position2)).toBe(false);
    });
});

describe("distance", (): void => {
    test.each([
        [1, 2, 0],
        [2, 3, 1],
        [0, 3, 1],
        [2, 2, 1],
        [1, 3, 1],
    ])("distance from (1, 2) to (%i, %i) is %i", (x: number, y: number, distance: number): void => {
        const position1: Position = new Position(1, 2);
        const position2: Position = new Position(x, y);

        expect(position1.distance(position2)).toBe(distance);
    });
});

describe("closestAdjacentPosition", (): void => {
    test("north tile when same position", (): void => {
        const position1: Position = new Position(10, 10);
        const position2: Position = new Position(10, 10);

        const closestAdjacentPosition: Position = position1.closestAdjacentPosition(position2);

        expect(closestAdjacentPosition.x).toBe(10);
        expect(closestAdjacentPosition.y).toBe(11);
    });

    test("south tile when equally north and east", (): void => {
        const position1: Position = new Position(10, 10);
        const position2: Position = new Position(13, 13);

        const closestAdjacentPosition: Position = position1.closestAdjacentPosition(position2);

        expect(closestAdjacentPosition.x).toBe(13);
        expect(closestAdjacentPosition.y).toBe(12);
    });

    test("east tile when mostly west", (): void => {
        const position1: Position = new Position(10, 10);
        const position2: Position = new Position(7, 11);

        const closestAdjacentPosition: Position = position1.closestAdjacentPosition(position2);

        expect(closestAdjacentPosition.x).toBe(8);
        expect(closestAdjacentPosition.y).toBe(11);
    });

    test("west tile when mostly east", (): void => {
        const position1: Position = new Position(10, 10);
        const position2: Position = new Position(13, 11);

        const closestAdjacentPosition: Position = position1.closestAdjacentPosition(position2);

        expect(closestAdjacentPosition.x).toBe(12);
        expect(closestAdjacentPosition.y).toBe(11);
    });
});

describe("clone", (): void => {
    test("clone is a deep copy", (): void => {
        const position: Position = new Position(1, 2);
        const positionClone: Position = position.clone();

        expect(positionClone).not.toBe(position);
        expect(JSON.stringify(positionClone)).toBe(JSON.stringify(position));
    });
});