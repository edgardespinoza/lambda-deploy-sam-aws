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
import { controller } from '../di/injection';

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    const response = await controller.getMeasureByLocalYearMonth(
        event.queryStringParameters?.local,
        event.queryStringParameters?.year,
        event.queryStringParameters?.month,
    );

    return {
        ...response,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': `${process.env.DNS_CLIENT}`,
            'Access-Control-Allow-Methods': 'OPTIONS,GET',
            'Access-Control-Allow-Credentials': true,
        },
    };
};
