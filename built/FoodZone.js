export class FoodZone {
    constructor(foodList) {
        this.foodList = foodList;
    }
    clone() {
        let foodZone = new FoodZone(this.foodList);
        foodZone.foodList = [];
        for (let i = 0; i < this.foodList.length; i++) {
            foodZone.foodList.push(this.foodList[i] === null ? null : this.foodList[i].clone());
        }
        return foodZone;
    }
}
