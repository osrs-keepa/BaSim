export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(position) {
        return this.x === position.x && this.y === position.y;
    }
    distance(position) {
        return Math.max(Math.abs(this.x - position.x), Math.abs(this.y - position.y));
    }
    closestAdjacentPosition(position) {
        const northTileDistance = this.distance(new Position(position.x, position.y + 1));
        const southTileDistance = this.distance(new Position(position.x, position.y - 1));
        const eastTileDistance = this.distance(new Position(position.x + 1, position.y));
        const westTileDistance = this.distance(new Position(position.x - 1, position.y));
        const minimumDistance = Math.min(northTileDistance, southTileDistance, eastTileDistance, westTileDistance);
        if (minimumDistance === northTileDistance) {
            return new Position(position.x, position.y + 1);
        }
        if (minimumDistance === southTileDistance) {
            return new Position(position.x, position.y - 1);
        }
        if (minimumDistance === eastTileDistance) {
            return new Position(position.x + 1, position.y);
        }
        return new Position(position.x - 1, position.y);
    }
    clone() {
        let position = new Position(this.x, this.y);
        position.x = this.x;
        position.y = this.y;
        return position;
    }
}
