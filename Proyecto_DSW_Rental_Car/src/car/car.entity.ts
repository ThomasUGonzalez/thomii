export class Car {

    constructor(
        public id: string | undefined,
        public brand: string,
        public model: string,
        public year: number,
        public color: string,
        public price: number,
        public available: boolean
    ) {}

}