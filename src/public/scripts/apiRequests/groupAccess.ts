import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/group_access`;

export const add = async (input: api.groupAccess.types.AddRequest): Promise<api.groupAccess.types.AddResponse> => {
    return general.apiRequest<api.groupAccess.types.AddRequest, api.groupAccess.types.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (
    input: api.groupAccess.types.AddNameRequest
): Promise<api.groupAccess.types.AddNameResponse> => {
    return general.apiRequest<api.groupAccess.types.AddNameRequest, api.groupAccess.types.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (
    input: api.groupAccess.types.RemoveRequest
): Promise<api.groupAccess.types.RemoveResponse> => {
    return general.apiRequest<api.groupAccess.types.RemoveRequest, api.groupAccess.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
