import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/document_resource`;

export const get = async (input: api.documentResource.GetRequest): Promise<api.documentResource.GetResponse> => {
    return general.apiRequest<api.documentResource.GetRequest, api.documentResource.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const add = async (input: api.documentResource.AddRequest): Promise<api.documentResource.AddResponse> => {
    return general.apiRequest<api.documentResource.AddRequest, api.documentResource.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const remove = async (
    input: api.documentResource.RemoveRequest
): Promise<api.documentResource.RemoveResponse> => {
    return general.apiRequest<api.documentResource.RemoveRequest, api.documentResource.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
