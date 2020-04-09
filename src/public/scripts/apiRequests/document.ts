import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document`;

export const getPdf = async (input: api.document.ExportPdfRequest): Promise<api.document.ExportPdfResponse> => {
    return general.apiRequest<api.document.ExportPdfRequest, api.document.ExportPdfResponse>(
        `${baseUrl}/export/pdf`, input
    );
};

export const getZip = async (input: api.document.ExportZipRequest): Promise<api.document.ExportZipResponse> => {
    return general.apiRequest<api.document.ExportZipRequest, api.document.ExportZipResponse>(
        `${baseUrl}/export/zip`, input
    );
};

export const getJson = async (input: api.document.ExportJsonRequest): Promise<api.document.ExportJsonResponse> => {
    return general.apiRequest<api.document.ExportJsonRequest, api.document.ExportJsonResponse>(
        `${baseUrl}/export/json`, input
    );
};

export const update = async (input: api.document.UpdateRequest): Promise<api.document.UpdateResponse> => {
    return general.apiRequest<api.document.UpdateRequest, api.document.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const create = async (input: api.document.CreateRequest): Promise<api.document.CreateResponse> => {
    return general.apiRequest<api.document.CreateRequest, api.document.CreateResponse>(
        `${baseUrl}/create`, input
    );
};

export const remove = async (input: api.document.RemoveRequest): Promise<api.document.RemoveResponse> => {
    return general.apiRequest<api.document.RemoveRequest, api.document.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
