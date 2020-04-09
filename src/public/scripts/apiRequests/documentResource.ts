import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document_resource`;

export const get = async (
    input: api.documentResource.types.GetRequest
): Promise<api.documentResource.types.GetResponse> => {
    return general.apiRequest<api.documentResource.types.GetRequest, api.documentResource.types.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const add = async (
    input: api.documentResource.types.AddRequest
): Promise<api.documentResource.types.AddResponse> => {
    return general.apiRequest<api.documentResource.types.AddRequest, api.documentResource.types.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const remove = async (
    input: api.documentResource.types.RemoveRequest
): Promise<api.documentResource.types.RemoveResponse> => {
    return general.apiRequest<api.documentResource.types.RemoveRequest, api.documentResource.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
