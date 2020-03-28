import type * as api from "../../../routes/api";

export const getPdf = async (
    input: api.document.types.ExportPdfRequest
): Promise<api.document.types.ExportPdfResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/export/pdf", {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.document.types.ExportPdfResponse;
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

export const getZip = async (
    input: api.document.types.ExportZipRequest
): Promise<api.document.types.ExportZipResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/export/zip", {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.document.types.ExportZipResponse;
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
            authors: "TODO",
            content: "TODO",
            date: "TODO",
            title: "TODO",
            type: "DOCUMENT"
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

export const update = async (input: api.document.types.UpdateRequest): Promise<api.document.types.UpdateResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/update", {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.document.types.UpdateResponse;
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

export const create = async (input: api.document.types.CreateRequest): Promise<api.document.types.CreateResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/create", {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
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

export const remove = async (input: api.document.types.RemoveRequest): Promise<api.document.types.RemoveResponse> => {
    try {
        // Make request
        const response = await fetch("/api/document/remove", {
            body: JSON.stringify({ apiVersion: 1, ... input }),
            headers: { "Content-Type": "application/json" },
            method: "POST"
        });
        if (response.status === 200) {
            // Request was successful
            const responseJson = await response.json() as api.document.types.RemoveResponse;
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