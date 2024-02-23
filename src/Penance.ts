import {Character} from "./Character.js";
import {Position} from "./Position.js";

/**
 * Represents a Barbarian Assault penance character.
 */
export abstract class Penance extends Character {
    public destination: Position;

    public constructor(position: Position) {
        super(position);
        this.destination = position;
    }
}