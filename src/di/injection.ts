import { LightMeasurementController } from '../application/controller';
import { dynamoClient } from '../infrastructure/dynamoDBClient';
import { DynamoRepository } from '../infrastructure/dynamoRepository';
import { LightMeasurementServiceImpl } from '../models/serviceImp';

const repository = new DynamoRepository(dynamoClient);
const service = new LightMeasurementServiceImpl(repository);
export const controller = new LightMeasurementController(service);
