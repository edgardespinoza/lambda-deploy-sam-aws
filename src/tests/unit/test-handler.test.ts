import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import { lambdaHandler as createMeasure } from '../../handlers/createMeasure';
import { lambdaHandler as deleteMeasure } from '../../handlers/deleteMeasure';
import { lambdaHandler as searchMeasure } from '../../handlers/searchMeasure';
import { lambdaHandler as updateMeasure } from '../../handlers/updateMeasure';
import { dynamoClient } from '../../infrastructure/dynamoDBClient';

describe('Unit test for app handler', function () {
    //mock dynamoDB
    const ddbMock = mockClient(dynamoClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    it('should handle GET /measure and return 200', async () => {
        // Return the specified value whenever the spied scan function is called
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Home', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'GET /measure/search',
            rawPath: '/measure/search',
            rawQueryString: '',
            queryStringParameters: { local: 'Home', year: '2023', month: '1' }, // Missing required parameters
            headers: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                domainName: 'example.com',
                domainPrefix: 'example',
                http: {
                    method: 'GET',
                    path: '/measure/search',
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'GET /measure/search',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await searchMeasure(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify([{ id: id, local: 'Home', year: 2023, month: 1, room: 'Home', meter: 100 }]),
        );
    });

    it('should handle DELETE /measure/{id} and return 200', async () => {
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Living Room', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'DELETE /measure/{id}',
            rawPath: `/measure/${id}`,
            rawQueryString: '',
            pathParameters: { id: id },
            headers: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                domainName: 'example.com',
                domainPrefix: 'example',
                http: {
                    method: 'DELETE',
                    path: `/measure/${id}`,
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'DELETE /measure/{id}',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await deleteMeasure(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ message: `Deleted ${id}` }));
    });

    it('should handle create POST /measure and return 201', async () => {
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({});

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'POST /measure',
            rawPath: '/measure',
            rawQueryString: '',
            headers: {},
            body: JSON.stringify({
                id: id,
                local: 'Office',
                year: 2023,
                month: 2,
                room: 'Conference Room',
                meter: 200,
            }),
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                domainName: 'example.com',
                domainPrefix: 'example',
                http: {
                    method: 'POST',
                    path: '/measure',
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'POST /measure',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await createMeasure(event);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(JSON.stringify({ message: 'Created' }));
    });

    it('should handle PUT /measure/{id} and return 200', async () => {
        const id = uuid();
        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Living Room', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'PUT /measure/{id}',
            rawPath: `/measure/${id}`,
            rawQueryString: '',
            pathParameters: { id: id },
            headers: {},
            body: JSON.stringify({ local: 'Home', year: 2023, month: 1, room: 'Living Room', meter: 150 }),
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                domainName: 'example.com',
                domainPrefix: 'example',
                http: {
                    method: 'PUT',
                    path: `/measure/${id}`,
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'PUT /measure/{id}',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await updateMeasure(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ message: 'Updated' }));
    });
});
