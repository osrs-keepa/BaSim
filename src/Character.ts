import {Position} from "./Position.js";
import {BarbarianAssault} from "./BarbarianAssault.js";

export abstract class Character {
    public position: Position;

    protected constructor(position: Position) {
        this.position = position;
    }

    public abstract tick(barbarianAssault: BarbarianAssault): void;
}