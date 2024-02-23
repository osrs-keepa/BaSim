import { Character } from "./Character.js";
/**
 * Represents a Barbarian Assault penance character.
 */
export class Penance extends Character {
    constructor(position) {
        super(position);
        this.destination = position;
    }
}
