import { LightMeasurement } from './lightMeasurement';

export interface LightMeasurementRepository {
    update(measurement: LightMeasurement): Promise<void>;
    getById(id: string): Promise<LightMeasurement | null>;
    getMeasureByLocalYearMonth(local: string, year: number, month: number): Promise<LightMeasurement[]>;
    create(data: LightMeasurement): Promise<void>;
    delete(id: string): Promise<void>;
}
