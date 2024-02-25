// @ts-ignore
import { describe, expect, test } from "vitest";
import { Position } from "../src/Position.js";
import { FoodType } from "../src/FoodType.js";
import { Food } from "../src/Food.js";
describe("constructor", () => {
    test("green if good", () => {
        const position = new Position(1, 2);
        const foodType = FoodType.TOFU;
        const isGood = true;
        const food = new Food(position, foodType, isGood);
        expect(food.colorRed).toBe(0);
        expect(food.colorGreen).toBe(255);
        expect(food.colorBlue).toBe(0);
    });
    test("red if bad", () => {
        const position = new Position(1, 2);
        const foodType = FoodType.TOFU;
        const isGood = false;
        const food = new Food(position, foodType, isGood);
        expect(food.colorRed).toBe(255);
        expect(food.colorGreen).toBe(0);
        expect(food.colorBlue).toBe(0);
    });
});
describe("clone", () => {
    test("clone is a deep copy", () => {
        const position = new Position(1, 2);
        const foodType = FoodType.TOFU;
        const isGood = true;
        const food = new Food(position, foodType, isGood);
        const foodClone = food.clone();
        expect(foodClone).not.toBe(food);
        expect(foodClone.position).not.toBe(food.position);
        expect(foodClone.position.x).toBe(food.position.x);
        expect(foodClone.position.y).toBe(food.position.y);
        expect(foodClone.type).toBe(food.type);
        expect(foodClone.isGood).toBe(food.isGood);
    });
    test("clone is a deep copy with null position", () => {
        const position = null;
        const foodType = FoodType.TOFU;
        const isGood = true;
        const food = new Food(position, foodType, isGood);
        const foodClone = food.clone();
        expect(foodClone).not.toBe(food);
        expect(foodClone.position).toBe(null);
        expect(foodClone.type).toBe(food.type);
        expect(foodClone.isGood).toBe(food.isGood);
    });
});
