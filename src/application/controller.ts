import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { z, ZodError } from 'zod';
import { LightMeasurement } from '../models/lightMeasurement';
import { LightMeasurementService } from '../models/service';

const schema = z.object({
    id: z.string().uuid(),
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
    room: z.string().min(1),
    meter: z.number().min(0),
    local: z.string().min(1),
});

const schemaUpdate = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
    room: z.string().min(1),
    meter: z.number().min(0),
    local: z.string().min(1),
});

const querySchema = z.object({
    local: z.string(),
    year: z
        .string()
        .regex(/^\d{4}$/)
        .transform(Number),
    month: z
        .string()
        .regex(/^\d{1,2}$/)
        .transform(Number)
        .refine((val) => val >= 1 && val <= 12, {
            message: 'Month must be between 1 and 12',
        }),
});

export class LightMeasurementController {
    constructor(private service: LightMeasurementService) {}

    async getMeasureByLocalYearMonth(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const { local, year, month } = querySchema.parse({
                local: event.queryStringParameters?.local,
                year: event.queryStringParameters?.year,
                month: event.queryStringParameters?.month,
            });

            const data = await this.service.getMeasureByLocalYearMonth(local, year, month);
            return { statusCode: 200, body: JSON.stringify(data) };
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                return { statusCode: 400, body: JSON.stringify({ error: error.errors }) };
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            return { statusCode: 500, body: JSON.stringify({ error: message }) };
        }
    }

    async getById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const id = event.pathParameters?.id;
            if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing ID' }) };

            const data = await this.service.getById(id);
            if (!data) return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };

            return { statusCode: 200, body: JSON.stringify(data) };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { statusCode: 500, body: JSON.stringify({ error: message }) };
        }
    }

    async create(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const data = JSON.parse(event.body || '{}');
            schema.parse(data);

            const measurement = new LightMeasurement(data.id, data.month, data.year, data.room, data.meter, data.local);
            await this.service.create(measurement);

            return { statusCode: 201, body: JSON.stringify({ message: 'Created' }) };
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                return { statusCode: 400, body: JSON.stringify({ error: error.errors }) };
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            return { statusCode: 500, body: JSON.stringify({ error: message }) };
        }
    }

    async delete(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const id = event.pathParameters?.id;
            if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing ID' }) };

            await this.service.delete(id);

            return { statusCode: 200, body: JSON.stringify({ message: `Deleted ${id}` }) };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { statusCode: 500, body: JSON.stringify({ error: message }) };
        }
    }

    async update(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const id = event.pathParameters?.id;

            if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing ID' }) };

            const data = JSON.parse(event.body || '{}');
            schemaUpdate.parse(data);

            const measurement = new LightMeasurement(id, data.month, data.year, data.room, data.meter, data.local);
            await this.service.update(measurement);

            return { statusCode: 200, body: JSON.stringify({ message: 'Updated' }) };
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                return { statusCode: 400, body: JSON.stringify({ error: error.errors }) };
            }

            const message = error instanceof Error ? error.message : 'Unknown error';
            return { statusCode: 500, body: JSON.stringify({ error: message }) };
        }
    }
}
