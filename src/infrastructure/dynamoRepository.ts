import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { LightMeasurement } from '../models/lightMeasurement';
import { LightMeasurementRepository } from '../models/repository';

const tableName = process.env.TABLE_NAME;
const yearMonthIndex = process.env.INDEX_NAME;

export class DynamoRepository implements LightMeasurementRepository {
    constructor(private db: DynamoDBDocumentClient) {
        console.log(`table name and index: ${tableName} : ${yearMonthIndex}`);

        if (!tableName) {
            throw new Error('TableName environment variable is not defined');
        }
    }
    async update(measurement: LightMeasurement): Promise<void> {
        const command = new UpdateCommand({
            TableName: tableName,
            Key: { id: measurement.id },
            UpdateExpression: 'SET #month = :month, #year = :year, #room = :room, #meter = :meter, #local = :local',

            ExpressionAttributeValues: {
                ':month': measurement.month,
                ':year': measurement.year,
                ':room': measurement.room,
                ':meter': measurement.meter,
                ':local': measurement.local,
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
        await this.db.send(new PutCommand({ TableName: tableName, Item: data }));
    }

    async delete(id: string): Promise<void> {
        await this.db.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
    }
}
