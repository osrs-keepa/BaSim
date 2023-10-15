export class Food {
    constructor(position, type, isGood) {
        this.colorBlue = 0;
        this.position = position;
        this.type = type;
        this.isGood = isGood;
        this.colorRed = isGood ? 0 : 255;
        this.colorGreen = isGood ? 255 : 0;
    }
    clone() {
        let food = new Food(this.position, this.type, this.isGood);
        food.position = this.position === null ? null : this.position.clone();
        food.type = this.type;
        food.isGood = this.isGood;
        food.colorRed = this.colorRed;
        food.colorGreen = this.colorGreen;
        food.colorBlue = this.colorBlue;
        return food;
    }
}
