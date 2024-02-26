/**
 * Represents a section of a {@link BarbarianAssaultMap} that contains zero or more {@link Food}.
 */
export class FoodZone {
    constructor(foodList) {
        this.foodList = foodList;
    }
    /**
     * Creates a deep clone of this object.
     *
     * @return  a deep clone of this object
     */
    clone() {
        let foodZone = new FoodZone(this.foodList);
        foodZone.foodList = [];
        for (let i = 0; i < this.foodList.length; i++) {
            foodZone.foodList.push(this.foodList[i] === null ? null : this.foodList[i].clone());
        }
        return foodZone;
    }
}
