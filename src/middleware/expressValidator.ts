import * as expressValidator from "express-validator";
import * as express from "express";
import { debuglog } from "util";

const debug = debuglog("app-express-middleware-express-validator");

/**
 * Terminate early on validation error.
 * https://express-validator.github.io/docs/running-imperatively.html
 *
 * @param validations Validations that should be checked for the request body.
 * @returns Either it calls the next function to continue or stops and responds with an validation error.
 */
export const validateWithTerminationOnError = (validations: expressValidator.ValidationChain[]) =>
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = expressValidator.validationResult(req);
        // If there are no errors continue with next function, otherwise respond with an error message
        if (errors.isEmpty()) {
            return next();
        } else {
            debug(`Validation was unsuccessful: ${errors.array().map(a => JSON.stringify(a)).join(",")}`);
            res.status(422).json({ errors: errors.array() });
        }
    };
