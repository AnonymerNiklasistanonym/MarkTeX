import type * as api from "../../../routes/api";

export interface GetPdfInput {
    id: number
}

export interface GetPdfOutput {
    id: number
    pdfData: Buffer
}

export const getPdf = (input: GetPdfInput): GetPdfOutput => {
    return {
        id: 0,
        pdfData: Buffer.from("TODO")
    };
};

export interface GetZipInput {
    id: number
}

export interface GetZipOutput {
    id: number
    zipData: Buffer
}

export const getZip = (input: GetZipInput): GetZipOutput => {
    return {
        id: 0,
        zipData: Buffer.from("TODO")
    };
};

export interface GetJsonInput {
    id: number
}

export interface GetJsonOutput {
    id: number
    jsonData: any // TODO
}

export const getJson = (input: GetJsonInput): GetJsonOutput => {
    return {
        id: 0,
        jsonData: {
            type: "DOCUMENT",
            title: "TODO",
            authors: "TODO",
            date: "TODO",
            content: "TODO"
        }
    };
};

export interface UpdateInput {
    id: number
    title: string
    authors: string
    date: string
    content: string
}

export const update = (input: UpdateInput): void => {
    // TODO
};

export const create = async (input: api.document.types.CreateRequest): Promise<api.document.types.CreateResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiVersion: 1, ...input })
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.document.types.CreateResponse;
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
