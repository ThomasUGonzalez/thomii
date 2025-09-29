import { Car } from "./car.entity.js";

export interface CarRepository {
    findAll(): Promise<Car[] | undefined>;
    findOne(id: string): Promise<Car | undefined>;
    add(car: Car): Promise<Car | undefined>;
    update(id: string, car: Car): Promise<Car | undefined>;
    partialUpdate(id: string, updates: Partial<Car>): Promise<Car | undefined>;
    delete(id: string): Promise<Car | undefined>;
}
