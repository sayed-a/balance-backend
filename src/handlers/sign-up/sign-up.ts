import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { defaultHeaders, getUserPoolClientId, getUserPoolId } from "../../utils/Utils"
import AWS from "aws-sdk"

const cognitoService = new AWS.CognitoIdentityServiceProvider()

export const signUpHandler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        let userPoolId = await getUserPoolId(cognitoService)
        let clientId = await getUserPoolClientId(cognitoService, userPoolId)

        if (event.body != null) {
            let request: SignUpRequest = JSON.parse(event.body)

            let user = await signUp(clientId, request)

            return {
                statusCode: 201,
                headers: defaultHeaders,
                body: JSON.stringify(user)
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

async function signUp(clientId: string, request: SignUpRequest): Promise<User> {
    return new Promise(
        (resolve, reject) => {
            let params = {
                ClientId: clientId,
                Username: request.username,
                Password: request.password,
                UserAttributes: [
                    {
                        Name: "name",
                        Value: request.name
                    },
                    {
                        Name: "family_name",
                        Value: request.surname
                    }
                ]
            }

            cognitoService.signUp(params, function(err, data) {
                if (err) {
                    console.log(err.toString())

                    reject(err)
                } else {
                    let user: User = {
                        id: data.UserSub,
                        name: request.name,
                        surname: request.surname,
                        username: request.username
                    }

                    resolve(user)
                }
            })
        }
    )
}