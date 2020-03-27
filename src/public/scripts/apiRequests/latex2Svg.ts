import type * as api from "../../../routes/api";

export const latex2Svg = async (
    input: api.latex2svg.types.Latex2SvgRequest
): Promise<api.latex2svg.types.Latex2SvgResponse> => {
    try {
        // Make request to server
        const response = await fetch("/api/latex2svg", {
            body: JSON.stringify({
                apiVersion: 1,
                latexHeaderIncludes: input.latexHeaderIncludes,
                latexString: input.latexString,
                latexStringHash: input.latexStringHash,
                timeOfRequest: input.timeOfRequest
            }),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.latex2svg.types.Latex2SvgResponse;
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
