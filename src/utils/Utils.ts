import AWS from 'aws-sdk'

export const defaultHeaders ={
    "Content-Type": "application/json"
}

export const loadSsmParameter = async function(parameterName: string, withDecryption: boolean = false): Promise<string | null> {
    const ssm = new AWS.SSM()
    let options = {
        Name: parameterName,
        WithDecryption: withDecryption
    }

    let parameter = await ssm.getParameter(options).promise()

    return parameter?.Parameter?.Value ?? null
}

export const fetchAllItems = async function (tableName: string): Promise<Array<any>> {
    const db = new AWS.DynamoDB()
    let options = {
        TableName: tableName
    }

    let items = await db.scan(options).promise()
    const results = []
    let lastEvaluatedKey

    do {
        results.push(...items.Items ?? [])
        lastEvaluatedKey = items.LastEvaluatedKey
    } while (lastEvaluatedKey)

    return results
}

export const getUserPoolClientId = async function(cognitoService: AWS.CognitoIdentityServiceProvider, userPoolId: string): Promise<string> {
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

export const getUserPoolId = async function getUserPoolId(cognitoService: AWS.CognitoIdentityServiceProvider): Promise<string> {
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