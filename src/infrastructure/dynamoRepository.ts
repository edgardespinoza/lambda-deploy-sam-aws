import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { AppError } from '../errors/appError';
import { LightMeasurement } from '../models/lightMeasurement';
import { LightMeasurementRepository } from '../models/repository';

const tableName = process.env.TABLE_NAME;
const yearMonthIndex = process.env.INDEX_NAME;

export class DynamoRepository implements LightMeasurementRepository {
    constructor(private db: DynamoDBDocumentClient) {
        if (!tableName) {
            throw new Error('TableName environment variable is not defined');
        }
    }
    async update(data: LightMeasurement): Promise<void> {
        const result = await this.db.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: yearMonthIndex,
                KeyConditionExpression: '#year = :year AND #month = :month',
                FilterExpression: '#local = :local AND #room = :room AND #id <> :id',
                ExpressionAttributeNames: {
                    '#year': 'year',
                    '#month': 'month',
                    '#local': 'local',
                    '#room': 'room',
                    '#id': 'id',
                },
                ExpressionAttributeValues: {
                    ':year': data.year,
                    ':month': data.month,
                    ':local': data.local,
                    ':room': data.room,
                    ':id': data.id,
                },
            }),
        );

        if (result.Items && result.Items.length > 0) {
            throw new AppError(400, 'A measurement with the same year, month, local, and room already exists.');
        }

        const command = new UpdateCommand({
            TableName: tableName,
            Key: { id: data.id },
            UpdateExpression: `
                SET #month = :month,
                    #year = :year,
                    #room = :room,
                    #meterWaterCurrent = :meterWaterCurrent,
                    #meterWaterBefore = :meterWaterBefore,
                    #meterLightCurrent = :meterLightCurrent,
                    #meterLightBefore = :meterLightBefore,
                    #rent = :rent,
                    #local = :local 
            `,
            ExpressionAttributeNames: {
                '#month': 'month',
                '#year': 'year',
                '#room': 'room',
                '#meterWaterCurrent': 'meterWaterCurrent',
                '#meterWaterBefore': 'meterWaterBefore',
                '#meterLightCurrent': 'meterLightCurrent',
                '#meterLightBefore': 'meterLightBefore',
                '#rent': 'rent',
                '#local': 'local',
            },
            ExpressionAttributeValues: {
                ':month': data.month,
                ':year': data.year,
                ':room': data.room,
                ':meterWaterCurrent': data.meterWaterCurrent,
                ':meterWaterBefore': data.meterWaterBefore,
                ':meterLightCurrent': data.meterLightCurrent,
                ':meterLightBefore': data.meterLightBefore,
                ':rent': data.rent,
                ':local': data.local,
            },
            ReturnValues: 'UPDATED_NEW',
        });

        await this.db.send(command);
    }

    async getById(id: string): Promise<LightMeasurement | null> {
        const result = await this.db.send(new GetCommand({ TableName: tableName, Key: { id } }));
        return result.Item ? (result.Item as LightMeasurement) : null;
    }

    async getMeasureByLocalYearMonth(local: string, year: number, month: number): Promise<LightMeasurement[]> {
        const result = await this.db.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: yearMonthIndex,
                KeyConditionExpression: '#year = :year AND #month = :month',
                FilterExpression: '#local = :local',
                ExpressionAttributeNames: {
                    '#year': 'year',
                    '#month': 'month',
                    '#local': 'local',
                },
                ExpressionAttributeValues: {
                    ':year': year,
                    ':month': month,
                    ':local': local,
                },
            }),
        );
        return result.Items ? (result.Items as LightMeasurement[]) : [];
    }

    async create(data: LightMeasurement): Promise<void> {
        const result = await this.db.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: yearMonthIndex,
                KeyConditionExpression: '#year = :year AND #month = :month',
                FilterExpression: '#local = :local AND #room = :room',
                ExpressionAttributeNames: {
                    '#year': 'year',
                    '#month': 'month',
                    '#local': 'local',
                    '#room': 'room',
                },
                ExpressionAttributeValues: {
                    ':year': data.year,
                    ':month': data.month,
                    ':local': data.local,
                    ':room': data.room,
                },
            }),
        );

        if (result.Items && result.Items.length > 0) {
            throw new AppError(400, 'A measurement with the same year, month, local, and room already exists.');
        }

        await this.db.send(new PutCommand({ TableName: tableName, Item: data }));
    }

    async delete(id: string): Promise<void> {
        await this.db.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
    }
}
