import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/group_access`;

export const add = async (input: api.groupAccess.AddRequest): Promise<api.groupAccess.AddResponse> => {
    return general.apiRequest<api.groupAccess.AddRequest, api.groupAccess.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (input: api.groupAccess.AddNameRequest): Promise<api.groupAccess.AddNameResponse> => {
    return general.apiRequest<api.groupAccess.AddNameRequest, api.groupAccess.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (input: api.groupAccess.RemoveRequest): Promise<api.groupAccess.RemoveResponse> => {
    return general.apiRequest<api.groupAccess.RemoveRequest, api.groupAccess.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};

export const update = async (input: api.documentAccess.UpdateRequest): Promise<api.documentAccess.UpdateResponse> => {
    return general.apiRequest<api.documentAccess.UpdateRequest, api.documentAccess.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};
