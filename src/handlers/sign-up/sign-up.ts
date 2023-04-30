import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { defaultHeaders } from "../../Utils";
import AWS from "aws-sdk";

const cognitoService = new AWS.CognitoIdentityServiceProvider()

export const signUpHandler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        let userPoolId = await getUserPoolId()
        let clientId = await getUserPoolClientId(userPoolId)

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

async function getUserPoolId(): Promise<string> {
    return new Promise(
        (resolve, reject) => {
            let params = {
                MaxResults: 3
            }

            cognitoService.listUserPools(params, function (err, data) {
                if (err) {
                    console.log(err.toString())

                    reject(err)
                } else {
                    let userPoolId = data.UserPools?.find(u => u.Name == "balance-user-pool")?.Id

                    if (userPoolId != null) {
                        resolve(userPoolId)
                    } else {
                        console.log("No user pool ID found")

                        reject(new Error("No user pool ID found"))
                    }
                }
            })
        }
    )
}

async function getUserPoolClientId(userPoolId: string): Promise<string> {
    return new Promise(
        (resolve, reject) => {
            let params = { UserPoolId: userPoolId }

            cognitoService.listUserPoolClients(params, function (err, data) {
                if (err) {
                    console.log(err.toString())
                    reject(err)
                } else {
                    let clientId = data.UserPoolClients?.find(c => c.ClientName == "balance-user-pool-client")?.ClientId
                    if (clientId != null) {
                        resolve(clientId)
                    } else {
                        console.log("No client ID found for UserPool")

                        reject(new Error("No client ID found for UserPool"))
                    }
                }
            })
        }
    )
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