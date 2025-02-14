import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import 'dotenv/config';
import { v4 as uuid } from 'uuid';
import { lambdaHandler } from '../../app';
import { dynamoClient } from '../../infrastructure/dynamoDBClient';

describe('Unit test for app handler', function () {
    //mock dynamoDB
    const ddbMock = mockClient(dynamoClient);

    beforeEach(() => {
        ddbMock.reset();
    });

    it('should handle GET /measures and return 200', async () => {
        // Return the specified value whenever the spied scan function is called
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Home', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'GET /measures/search',
            rawPath: '/measures/search',
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
                    path: '/measures/search',
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'GET /measures/search',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify([{ id: id, local: 'Home', year: 2023, month: 1, room: 'Home', meter: 100 }]),
        );
    });

    it('should handle DELETE /measures/{id} and return 200', async () => {
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Living Room', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'DELETE /measures/{id}',
            rawPath: `/measures/${id}`,
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
                    path: `/measures/${id}`,
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'DELETE /measures/{id}',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await lambdaHandler(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ message: `Deleted ${id}` }));
    });

    it('should handle POST /measures and return 201', async () => {
        const id = uuid();

        ddbMock.on(QueryCommand).resolves({});

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'POST /measures',
            rawPath: '/measures',
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
                    path: '/measures',
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'POST /measures',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(JSON.stringify({ message: 'Created' }));
    });

    it('should handle PUT /measures/{id} and return 200', async () => {
        const id = uuid();
        ddbMock.on(QueryCommand).resolves({
            Items: [{ id: id, local: 'Home', year: 2023, month: 1, room: 'Living Room', meter: 100 }],
        });

        const event: APIGatewayProxyEventV2 = {
            version: '2.0',
            routeKey: 'PUT /measures/{id}',
            rawPath: `/measures/${id}`,
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
                    path: `/measures/${id}`,
                    protocol: 'HTTP/1.1',
                    sourceIp: '192.168.1.1',
                    userAgent: 'jest',
                },
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                routeKey: 'PUT /measures/{id}',
                stage: 'dev',
                time: '10/Apr/2023:12:34:56 +0000',
                timeEpoch: 1681137296000,
            },
            isBase64Encoded: false,
        };

        const result = await lambdaHandler(event);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(JSON.stringify({ message: 'Updated' }));
    });
});
