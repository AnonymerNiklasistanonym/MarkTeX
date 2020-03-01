import dotenv from "dotenv";
import { debuglog } from "util";

const debug = debuglog("app-env");

export const loadEnvFile = (): void => {
    // Load .env file if existing
    const result = dotenv.config();
    // When there is an error stop
    const error = result.error as NodeJS.ErrnoException;
    if (error && error.code === "ENOENT") {
        debug("no .env file was found");
    } else if (error) {
        debug("error='%s' when reading .env file", result.error);
        throw result.error;
    } else {
        debug(".env file was found and consumed [%s]", result.parsed);
    }
};
