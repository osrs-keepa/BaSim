import {Character} from "./Character.js";
import {Position} from "./Position.js";

export abstract class Penance extends Character {
    public destination: Position;

    public constructor(position: Position) {
        super(position);
        this.destination = position;
    }
}