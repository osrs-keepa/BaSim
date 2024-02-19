import {Position} from "./Position.js";
import {Player} from "./Player.js";
import {BarbarianAssault} from "./BarbarianAssault.js";

export class CollectorPlayer extends Player {
    public constructor(position: Position) {
        super(position);
    }

    public tick(barbarianAssault: BarbarianAssault): void {
    }

    protected move(): void {
    }

    public clone(): CollectorPlayer {
        let collectorPlayer: CollectorPlayer = new CollectorPlayer(this.position);
        collectorPlayer.position = this.position === null ? null : this.position.clone();

        return collectorPlayer;
    }
}