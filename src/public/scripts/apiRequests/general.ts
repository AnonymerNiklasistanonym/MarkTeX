export const apiRequest = async <
    INPUT_TYPE extends { [key: string]: any },
    OUTPUT_TYPE extends { [key: string]: any }
>(
    requestUrl: string, input: INPUT_TYPE
): Promise<OUTPUT_TYPE> => {
    try {
        // Make request
        const response = await fetch(requestUrl, {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as OUTPUT_TYPE;
            // eslint-disable-next-line no-console
            return responseJson;
        } else {
            // Must be an error
            const responseText = await response.text();
            throw Error(`Bad response (${response.status}): ${responseText}`);
        }
    } catch (e) {
        throw e;
    }
};

export const baseUrlApi = "/api";
