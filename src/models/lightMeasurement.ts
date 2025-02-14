export class LightMeasurement {
    constructor(
        public id: string,
        public month: number,
        public year: number,
        public room: string,
        public meter: number,
        public local: string,
    ) {}
}
