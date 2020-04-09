import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document_access`;

export const add = async (
    input: api.documentAccess.types.AddRequest
): Promise<api.documentAccess.types.AddResponse> => {
    return general.apiRequest<api.documentAccess.types.AddRequest, api.documentAccess.types.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (
    input: api.documentAccess.types.AddNameRequest
): Promise<api.documentAccess.types.AddNameResponse> => {
    return general.apiRequest<api.documentAccess.types.AddNameRequest, api.documentAccess.types.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (
    input: api.documentAccess.types.RemoveRequest
): Promise<api.documentAccess.types.RemoveResponse> => {
    return general.apiRequest<api.documentAccess.types.RemoveRequest, api.documentAccess.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
