export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(position) {
        return this.x === position.x && this.y === position.y;
    }
    clone() {
        let position = new Position(this.x, this.y);
        position.x = this.x;
        position.y = this.y;
        return position;
    }
}
