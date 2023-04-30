import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { defaultHeaders, getUserPoolClientId, getUserPoolId } from "../../utils/Utils"
import AWS from "aws-sdk"

const cognitoService = new AWS.CognitoIdentityServiceProvider()

export const logInHandler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        let userPoolId = await getUserPoolId(cognitoService)
        let clientId = await getUserPoolClientId(cognitoService, userPoolId)

        if (event.body != null) {
            let request: LogInRequest = JSON.parse(event.body)

            let logInResponse = await logIn(clientId, request)

            return {
                statusCode: 200,
                headers: defaultHeaders,
                body: JSON.stringify(logInResponse)
            }
        } else {
            let responseBody: ErrorResponse = {
                httpStatus: 400,
                message: "No body in request"
            }
    
            return {
                statusCode: 400,
                headers: defaultHeaders,
                body: JSON.stringify(responseBody)
            }
        }
    } catch (e) {
        let message = "ERROR!"

        if (e instanceof Error) {
            console.log(e)
            message = e.message
        }

        let responseBody: ErrorResponse = {
            httpStatus: 500,
            message: message
        }

        return {
            statusCode: 500,
            headers: defaultHeaders,
            body: JSON.stringify(responseBody)
        }
    }
}

async function logIn(clientId: string, request: LogInRequest): Promise<LogInResponse> {
    return new Promise(
        (resolve, reject) => {
            let params = {
                AuthFlow: "USER_PASSWORD_AUTH",
                ClientId: clientId,
                AuthParameters: {
                    "USERNAME": request.username,
                    "PASSWORD": request.password
                }
            }

            cognitoService.initiateAuth(params, function(err, data) {
                if (err) {
                    console.log(err.toString())

                    reject(err)
                } else {
                    let result = data.AuthenticationResult

                    if (result) {
                        let response: LogInResponse = {
                            token: result.AccessToken ?? "",
                            tokenType: result.TokenType ?? "",
                            expiresIn: result.ExpiresIn ?? -1
                        }

                        resolve(response)
                    } else {
                        reject(new Error("No authentication result from Cognito"))
                    }
                }
            })
        }
    )
}