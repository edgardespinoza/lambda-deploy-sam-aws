import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
import { controller } from './di/injection';

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    switch (event.routeKey) {
        case 'GET /measure/search':
            return await controller.getMeasureByLocalYearMonth(event);
        case 'GET /measure':
            return await controller.getById(event);
        case 'POST /measure':
            return await controller.create(event);
        case 'DELETE /measure/{id}':
            return await controller.delete(event);
        case 'PUT /measure/{id}':
            return await controller.update(event);
        default:
            return { statusCode: 400, body: JSON.stringify({ error: `Invalid request ${event.routeKey}` }) };
    }
};
