import { Player } from "./Player.js";
export class CollectorPlayer extends Player {
    constructor(position) {
        super(position);
    }
    tick(barbarianAssault) {
    }
    move() {
    }
    clone() {
        let collectorPlayer = new CollectorPlayer(this.position);
        collectorPlayer.position = this.position === null ? null : this.position.clone();
        return collectorPlayer;
    }
}
