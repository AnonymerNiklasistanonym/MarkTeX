import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document_access`;

export const add = async (input: api.documentAccess.AddRequest): Promise<api.documentAccess.AddResponse> => {
    return general.apiRequest<api.documentAccess.AddRequest, api.documentAccess.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (
    input: api.documentAccess.AddNameRequest
): Promise<api.documentAccess.AddNameResponse> => {
    return general.apiRequest<api.documentAccess.AddNameRequest, api.documentAccess.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (input: api.documentAccess.RemoveRequest): Promise<api.documentAccess.RemoveResponse> => {
    return general.apiRequest<api.documentAccess.RemoveRequest, api.documentAccess.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};

export const update = async (input: api.documentAccess.UpdateRequest): Promise<api.documentAccess.UpdateResponse> => {
    return general.apiRequest<api.documentAccess.UpdateRequest, api.documentAccess.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};
