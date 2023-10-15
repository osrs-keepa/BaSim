export class Position {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(position: Position): boolean {
        return this.x === position.x && this.y === position.y;
    }

    public clone(): Position {
        let position: Position = new Position(this.x, this.y);
        position.x = this.x;
        position.y = this.y;

        return position;
    }
}