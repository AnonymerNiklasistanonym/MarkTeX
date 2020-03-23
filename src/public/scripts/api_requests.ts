export interface Latex2SvgRequestInput {
    texData: string
    texHeaderIncludes: string[]
    id: string
    timeOfRequest: string
}

export interface Latex2SvgRequestResponse {
    svgData: string
    id: string
}

export const latex2Svg = async (input: Latex2SvgRequestInput): Promise<Latex2SvgRequestResponse> => {
    try {
        // Make request to server
        const response = await fetch("/api/latex2svg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apiVersion: 1,
                latexStringHash: input.id,
                latexString: input.texData,
                latexHeaderIncludes: input.texHeaderIncludes,
                timeOfRequest: input.timeOfRequest
            })
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as Latex2SvgRequestResponse;
            return responseJson;
        } else {
            // Must be an error
            const responseText = await response.text();
            throw Error(`Bad response (${response.status}): ${responseText}`);
        }
    } catch(e) {
        throw e;
    }
};
