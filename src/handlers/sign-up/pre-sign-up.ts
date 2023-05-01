import { PreSignUpTriggerHandler } from "aws-lambda";

export const preSignUpHandler: PreSignUpTriggerHandler = async (event, context, callback) => {
    event.response.autoConfirmUser = true

    callback(null, event)
 }