import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { defaultHeaders, loadSsmParameter } from '../Utils'

export const getCategoriesHandler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let categories = await loadSsmParameter("/balance/categories")

    if (categories == null) {
        let responseBody: ErrorResponse = {
            httpStatus: 500,
            message: "Could not retrieve categories from SSM"
        }

        return {
            statusCode: 500,
            headers: defaultHeaders,
            body: JSON.stringify(responseBody)
        }
    } else {
        let responseBody: Array<Category> = categories.split(',').sort().map(category => { 
            return <Category> {
                name: category, 
                activities: [] 
            }
        })

        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify(responseBody)
        }
    }
}