import { expect, test, jest } from '@jest/globals'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCategoriesHandler } from '../../../src/handlers/get-categories';
import * as utils from '../../../src/Utils';

const event: APIGatewayProxyEvent = {
    httpMethod: 'get',
    body: '',
    headers: {},
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '/api/categories',
    pathParameters: {},
    queryStringParameters: {},
    requestContext: {
        accountId: '123456789012',
        apiId: '1234',
        authorizer: {},
        httpMethod: 'get',
        identity: {
            accessKey: '',
            accountId: '',
            apiKey: '',
            apiKeyId: '',
            caller: '',
            clientCert: {
                clientCertPem: '',
                issuerDN: '',
                serialNumber: '',
                subjectDN: '',
                validity: { notAfter: '', notBefore: '' },
            },
            cognitoAuthenticationProvider: '',
            cognitoAuthenticationType: '',
            cognitoIdentityId: '',
            cognitoIdentityPoolId: '',
            principalOrgId: '',
            sourceIp: '',
            user: '',
            userAgent: '',
            userArn: '',
        },
        path: '/api/categories',
        protocol: 'HTTP/1.1',
        requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
        requestTimeEpoch: 1428582896000,
        resourceId: '123456',
        resourcePath: '/api/categories',
        stage: 'test',
    },
    resource: '',
    stageVariables: {},
}

test("GetCategories: Success", async function () {
    jest.spyOn(utils, 'loadSsmParameter').mockResolvedValue("Work,Religion,Family,Health,Social,Sleep,Recreation")
    jest.spyOn(utils, 'fetchAllItems').mockResolvedValue([])

    const result: APIGatewayProxyResult = await getCategoriesHandler(event)
    const body: Array<Category> = JSON.parse(result.body)

    expect(result.statusCode).toEqual(200)
    expect(body.length).toEqual(7)
})

test("GetCategories: Failure - SSM Error", async function () {
    jest.spyOn(utils, 'loadSsmParameter').mockImplementation(() => { throw new Error("Error from SSM!")})
    jest.spyOn(utils, 'fetchAllItems').mockResolvedValue([])

    const result: APIGatewayProxyResult = await getCategoriesHandler(event)
    const body: ErrorResponse = JSON.parse(result.body)

    expect(result.statusCode).toEqual(500)
    expect(body.message).toEqual("Error from SSM!")
})

test("GetCategories: Failure - DynamoDB Error", async function () {
    jest.spyOn(utils, 'loadSsmParameter').mockResolvedValue("Work,Religion,Family,Health,Social,Sleep,Recreation")
    jest.spyOn(utils, 'fetchAllItems').mockImplementation(() => { throw new Error("Error from DynamoDB!")})

    const result: APIGatewayProxyResult = await getCategoriesHandler(event)
    const body: ErrorResponse = JSON.parse(result.body)

    expect(result.statusCode).toEqual(500)
    expect(body.message).toEqual("Error from DynamoDB!")
})