"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const get_categories_1 = require("../../../src/handlers/get-categories");
const utils = __importStar(require("../../../src/Utils"));
const event = {
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
};
(0, globals_1.test)("GetCategories: Success", async function () {
    globals_1.jest.spyOn(utils, 'loadSsmParameter').mockResolvedValue("Work,Religion,Family,Health,Social,Sleep,Recreation");
    globals_1.jest.spyOn(utils, 'fetchAllItems').mockResolvedValue([]);
    const result = await (0, get_categories_1.getCategoriesHandler)(event);
    const body = JSON.parse(result.body);
    (0, globals_1.expect)(result.statusCode).toEqual(200);
    (0, globals_1.expect)(body.length).toEqual(7);
});
(0, globals_1.test)("GetCategories: Failure - SSM Error", async function () {
    globals_1.jest.spyOn(utils, 'loadSsmParameter').mockImplementation(() => { throw new Error("Error from SSM!"); });
    globals_1.jest.spyOn(utils, 'fetchAllItems').mockResolvedValue([]);
    const result = await (0, get_categories_1.getCategoriesHandler)(event);
    const body = JSON.parse(result.body);
    (0, globals_1.expect)(result.statusCode).toEqual(500);
    (0, globals_1.expect)(body.message).toEqual("Error from SSM!");
});
(0, globals_1.test)("GetCategories: Failure - DynamoDB Error", async function () {
    globals_1.jest.spyOn(utils, 'loadSsmParameter').mockResolvedValue("Work,Religion,Family,Health,Social,Sleep,Recreation");
    globals_1.jest.spyOn(utils, 'fetchAllItems').mockImplementation(() => { throw new Error("Error from DynamoDB!"); });
    const result = await (0, get_categories_1.getCategoriesHandler)(event);
    const body = JSON.parse(result.body);
    (0, globals_1.expect)(result.statusCode).toEqual(500);
    (0, globals_1.expect)(body.message).toEqual("Error from DynamoDB!");
});
