import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { defaultHeaders, fetchAllItems, loadSsmParameter } from '../../Utils'

export const getCategoriesHandler = async function(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
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
        let activities: Array<Activity> = (await fetchAllItems("balance-activities")).map(activity => {
            console.log(activity)

            return <Activity> {
                id: activity["id"]["S"],
                name: activity["name"]["S"],
                category: activity["category"]["S"]
            }
        })

        let responseBody: Array<Category> = categories.split(',').sort().map(category => { 
            return <Category> {
                name: category, 
                activities: activities.filter(a => a.category === category).sort()
            }
        })

        return {
            statusCode: 200,
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