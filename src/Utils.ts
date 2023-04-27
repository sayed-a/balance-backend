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