import * as express from "express";
import * as expressValidator from "express-validator";
import createHttpError from "http-errors";
import { debuglog } from "util";

const debug = debuglog("app-express-middleware-express-validator");


export interface ValidateWithTerminationOnErrorOptions {
    /** Overwrites `customOnError` option */
    sendJsonError?: boolean
    customOnError?: (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
        errors: expressValidator.Result<expressValidator.ValidationError>
    ) => void
}

interface InternalValidationErrorFix extends Error {
    msg: string
}

/**
 * Terminate early on validation error.
 * https://express-validator.github.io/docs/running-imperatively.html
 *
 * @param validations Validations that should be checked for the request body.
 * @param options Options for validation
 * @returns Either it calls the next function to continue or stops and responds with an validation error.
 */
export const validateWithError = (
    validations: expressValidator.ValidationChain[],
    options: ValidateWithTerminationOnErrorOptions = {}
) =>
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        debug(`Validate: ${JSON.stringify(req.body)}/${JSON.stringify(req.params)}`);
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = expressValidator.validationResult(req);
        // If there are no errors continue with next function, otherwise respond with an error message
        if (errors.isEmpty()) {
            return next();
        } else {
            debug(`Validation was unsuccessful: ${errors.array().map(a => JSON.stringify(a)).join(",")}`);
            if (options.sendJsonError) {
                res.status(422).json({ errors: errors.array() });
            } else if (options.customOnError) {
                options.customOnError(req, res, next, errors);
            } else {
                next(createHttpError(422, errors.array().map(
                    a => (a as unknown as InternalValidationErrorFix).msg
                ).join(", ")));
            }
        }
    };
