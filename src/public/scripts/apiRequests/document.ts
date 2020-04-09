import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document`;

export const getPdf = async (
    input: api.document.types.ExportPdfRequest
): Promise<api.document.types.ExportPdfResponse> => {
    return general.apiRequest<api.document.types.ExportPdfRequest, api.document.types.ExportPdfResponse>(
        `${baseUrl}/export/pdf`, input
    );
};

export const getZip = async (
    input: api.document.types.ExportZipRequest
): Promise<api.document.types.ExportZipResponse> => {
    return general.apiRequest<api.document.types.ExportZipRequest, api.document.types.ExportZipResponse>(
        `${baseUrl}/export/zip`, input
    );
};

export const getJson = async (
    input: api.document.types.ExportJsonRequest
): Promise<api.document.types.ExportJsonResponse> => {
    return general.apiRequest<api.document.types.ExportJsonRequest, api.document.types.ExportJsonResponse>(
        `${baseUrl}/export/json`, input
    );
};

export const update = async (input: api.document.types.UpdateRequest): Promise<api.document.types.UpdateResponse> => {
    return general.apiRequest<api.document.types.UpdateRequest, api.document.types.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const create = async (input: api.document.types.CreateRequest): Promise<api.document.types.CreateResponse> => {
    return general.apiRequest<api.document.types.CreateRequest, api.document.types.CreateResponse>(
        `${baseUrl}/create`, input
    );
};

export const remove = async (input: api.document.types.RemoveRequest): Promise<api.document.types.RemoveResponse> => {
    return general.apiRequest<api.document.types.RemoveRequest, api.document.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
