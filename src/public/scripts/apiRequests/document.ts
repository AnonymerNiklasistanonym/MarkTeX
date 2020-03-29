import type * as api from "../../../routes/api";
import * as general from "./general";


export const getPdf = async (
    input: api.document.types.ExportPdfRequest
): Promise<api.document.types.ExportPdfResponse> => {
    return general.generalApiRequest<api.document.types.ExportPdfRequest, api.document.types.ExportPdfResponse>(
        "/api/document/export/pdf", input
    );
};

export const getZip = async (
    input: api.document.types.ExportZipRequest
): Promise<api.document.types.ExportZipResponse> => {
    return general.generalApiRequest<api.document.types.ExportZipRequest, api.document.types.ExportZipResponse>(
        "/api/document/export/zip", input
    );
};

export const getJson = async (
    input: api.document.types.ExportJsonRequest
): Promise<api.document.types.ExportJsonResponse> => {
    return general.generalApiRequest<api.document.types.ExportJsonRequest, api.document.types.ExportJsonResponse>(
        "/api/document/export/json", input
    );
};

export const update = async (input: api.document.types.UpdateRequest): Promise<api.document.types.UpdateResponse> => {
    return general.generalApiRequest<api.document.types.UpdateRequest, api.document.types.UpdateResponse>(
        "/api/document/update", input
    );
};

export const create = async (input: api.document.types.CreateRequest): Promise<api.document.types.CreateResponse> => {
    return general.generalApiRequest<api.document.types.CreateRequest, api.document.types.CreateResponse>(
        "/api/document/create", input
    );
};

export const remove = async (input: api.document.types.RemoveRequest): Promise<api.document.types.RemoveResponse> => {
    return general.generalApiRequest<api.document.types.RemoveRequest, api.document.types.RemoveResponse>(
        "/api/document/remove", input
    );
};
