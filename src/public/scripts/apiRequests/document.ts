import type * as api from "../../../routes/api";


const generalApiRequest = async <INPUT_TYPE extends {}, OUTPUT_TYPE extends {}>(
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

export const getPdf = async (
    input: api.document.types.ExportPdfRequest
): Promise<api.document.types.ExportPdfResponse> => {
    return generalApiRequest<api.document.types.ExportPdfRequest, api.document.types.ExportPdfResponse>(
        "/api/document/export/pdf", input
    );
};

export const getZip = async (
    input: api.document.types.ExportZipRequest
): Promise<api.document.types.ExportZipResponse> => {
    return generalApiRequest<api.document.types.ExportZipRequest, api.document.types.ExportZipResponse>(
        "/api/document/export/zip", input
    );
};

export const getJson = async (
    input: api.document.types.ExportJsonRequest
): Promise<api.document.types.ExportJsonResponse> => {
    return generalApiRequest<api.document.types.ExportJsonRequest, api.document.types.ExportJsonResponse>(
        "/api/document/export/json", input
    );
};

export const update = async (input: api.document.types.UpdateRequest): Promise<api.document.types.UpdateResponse> => {
    return generalApiRequest<api.document.types.UpdateRequest, api.document.types.UpdateResponse>(
        "/api/document/update", input
    );
};

export const create = async (input: api.document.types.CreateRequest): Promise<api.document.types.CreateResponse> => {
    return generalApiRequest<api.document.types.CreateRequest, api.document.types.CreateResponse>(
        "/api/document/create", input
    );
};

export const remove = async (input: api.document.types.RemoveRequest): Promise<api.document.types.RemoveResponse> => {
    return generalApiRequest<api.document.types.RemoveRequest, api.document.types.RemoveResponse>(
        "/api/document/remove", input
    );
};
