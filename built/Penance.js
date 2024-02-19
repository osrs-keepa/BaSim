import { Character } from "./Character.js";
export class Penance extends Character {
    constructor(position) {
        super(position);
        this.destination = position;
    }
}
