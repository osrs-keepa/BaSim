import {Food} from "./Food.js";

export class FoodZone {
    public foodList: Array<Food>;
    
    public constructor(foodList: Array<Food>) {
        this.foodList = foodList;
    }

    public clone(): FoodZone {
        let foodZone: FoodZone = new FoodZone(this.foodList);
        foodZone.foodList = [];
        for (let i: number = 0; i < this.foodList.length; i++) {
            foodZone.foodList.push(this.foodList[i] === null ? null : this.foodList[i].clone());
        }

        return foodZone;
    }
}