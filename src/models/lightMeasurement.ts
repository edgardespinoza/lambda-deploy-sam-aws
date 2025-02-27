export class LightMeasurement {
    constructor(
        public id: string,
        public month: number,
        public year: number,
        public room: string,
        public meterWaterCurrent: number,
        public meterWaterBefore: number,
        public meterLightCurrent: number,
        public meterLightBefore: number,
        public rent: number,
        public local: string,
    ) {}
}
