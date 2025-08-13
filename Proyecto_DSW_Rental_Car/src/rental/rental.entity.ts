export class Rental {
    constructor(
        public userId: string,
        public carId: number,
        public startDate: Date,
        public endDate: Date,
        public price: number,
        public status: string,
    ) {}
}