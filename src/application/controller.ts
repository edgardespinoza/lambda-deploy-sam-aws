import { AppError } from '../errors/appError';
import { errorHandler } from '../errors/handlerErrors';
import { LightMeasurement } from '../models/lightMeasurement';
import { LightMeasurementService } from '../models/service';
import { Result } from './result';
import { querySchema, registerSchema, schemaUpdate } from './schema';

export class LightMeasurementController {
    constructor(private service: LightMeasurementService) {}

    async getMeasureByLocalYearMonth(locals?: string, years?: string, months?: string): Promise<Result> {
        try {
            const { local, year, month } = querySchema.parse({
                local: locals,
                year: years,
                month: months,
            });

            const data = await this.service.getMeasureByLocalYearMonth(local, year, month);
            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        } catch (error: unknown) {
            return errorHandler(error);
        }
    }

    async getById(id?: string): Promise<Result> {
        try {
            if (!id) throw new AppError(400, 'Missing ID');

            const data = await this.service.getById(id);
            if (!data) throw new AppError(404, 'Not Found');

            return { statusCode: 200, body: JSON.stringify(data) };
        } catch (error: unknown) {
            return errorHandler(error);
        }
    }

    async create(body?: string): Promise<Result> {
        try {
            const data = JSON.parse(body ?? '{}');
            registerSchema.parse(data);

            const measurement = new LightMeasurement(
                data.id,
                data.month,
                data.year,
                data.room,
                data.meterWaterCurrent,
                data.meterWaterBefore,
                data.meterLightCurrent,
                data.meterLightBefore,
                data.rent,
                data.local,
            );

            await this.service.create(measurement);

            return { statusCode: 201, body: JSON.stringify({ message: 'Created' }) };
        } catch (error: unknown) {
            return errorHandler(error);
        }
    }

    async delete(id?: string): Promise<Result> {
        try {
            if (!id) throw new AppError(400, 'Missing ID');

            await this.service.delete(id);

            return { statusCode: 200, body: JSON.stringify({ message: `Deleted ${id}` }) };
        } catch (error: unknown) {
            return errorHandler(error);
        }
    }

    async update(id?: string, body?: string): Promise<Result> {
        try {
            if (!id) throw new AppError(400, 'Missing ID');

            const data = JSON.parse(body ?? '{}');
            schemaUpdate.parse(data);

            const measurement = new LightMeasurement(
                id,
                data.month,
                data.year,
                data.room,
                data.meterWaterCurrent,
                data.meterWaterBefore,
                data.meterLightCurrent,
                data.meterLightBefore,
                data.rent,
                data.local,
            );
            await this.service.update(measurement);

            return { statusCode: 200, body: JSON.stringify({ message: 'Updated' }) };
        } catch (error: unknown) {
            return errorHandler(error);
        }
    }
}
