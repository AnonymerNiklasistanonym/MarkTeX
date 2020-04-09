import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/group`;

export const update = async (input: api.group.UpdateRequest): Promise<api.group.UpdateResponse> => {
    return general.apiRequest<api.group.UpdateRequest, api.group.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const create = async (input: api.group.CreateRequest): Promise<api.group.CreateResponse> => {
    return general.apiRequest<api.group.CreateRequest, api.group.CreateResponse>(
        `${baseUrl}/create`, input
    );
};

export const get = async (input: api.group.GetRequest): Promise<api.group.GetResponse> => {
    return general.apiRequest<api.group.GetRequest, api.group.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const remove = async (input: api.group.RemoveRequest): Promise<api.group.RemoveResponse> => {
    return general.apiRequest<api.group.RemoveRequest, api.group.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
