import { Car } from "../car/car.entity";
import { IUser } from "../user/user.entity";

export class Rental {
    public id?: number;
    public user: IUser;
    public car: Car;
    public startDate: Date;
    public endDate: Date;
    public price: number;
    private _status: string;

    constructor(
        user: IUser,
        car: Car,
        startDate: Date,
        endDate: Date,
        price: number,
        status: string,
        id?: number
    ) {
        this.id = id;
        this.user = user;
        this.car = car;
        this.startDate = startDate;
        this.endDate = endDate;
        this.price = price;
        this._status = status;
        if (status === "reserved") {
            this.car.available = false;
        }
    }

    get status(): string {
        return this._status;
    }

    set status(newStatus: string) {
        this._status = newStatus;
        if (newStatus === "reserved") {
            this.car.available = false;
        }
    }
}