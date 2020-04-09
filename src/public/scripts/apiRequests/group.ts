import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/group`;

export const update = async (input: api.group.types.UpdateRequest): Promise<api.group.types.UpdateResponse> => {
    return general.apiRequest<api.group.types.UpdateRequest, api.group.types.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const create = async (input: api.group.types.CreateRequest): Promise<api.group.types.CreateResponse> => {
    return general.apiRequest<api.group.types.CreateRequest, api.group.types.CreateResponse>(
        `${baseUrl}/create`, input
    );
};

export const get = async (input: api.group.types.GetRequest): Promise<api.group.types.GetResponse> => {
    return general.apiRequest<api.group.types.GetRequest, api.group.types.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const remove = async (input: api.group.types.RemoveRequest): Promise<api.group.types.RemoveResponse> => {
    return general.apiRequest<api.group.types.RemoveRequest, api.group.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
