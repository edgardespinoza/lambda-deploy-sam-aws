import { LightMeasurement } from './lightMeasurement';
import { LightMeasurementRepository } from './repository';
import { LightMeasurementService } from './service';

export class LightMeasurementServiceImpl implements LightMeasurementService {
    constructor(private repository: LightMeasurementRepository) {}

    async update(measurement: LightMeasurement): Promise<void> {
        await this.repository.update(measurement);
    }

    async getById(id: string): Promise<LightMeasurement | null> {
        return await this.repository.getById(id);
    }

    async getMeasureByLocalYearMonth(local: string, year: number, month: number): Promise<LightMeasurement[]> {
        return await this.repository.getMeasureByLocalYearMonth(local, year, month);
    }

    async create(data: LightMeasurement): Promise<void> {
        await this.repository.create(data);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
