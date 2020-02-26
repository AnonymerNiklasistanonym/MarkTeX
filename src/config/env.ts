import dotenv from "dotenv";

export const loadEnvFile = (): void => {
    // Load .env file if existing
    const result = dotenv.config();
    // When there is an error stop
    const castBecauseThisIsDumb: any = result.error;
    const error: NodeJS.ErrnoException = castBecauseThisIsDumb;
    // eslint-disable-next-line
    if (error && error.code !== "ENOENT") {
        throw result.error;
    } else if (error && error.code === "ENOENT") {
        // eslint-disable-next-line no-console
        console.log("No .env file was found");
    }
};
