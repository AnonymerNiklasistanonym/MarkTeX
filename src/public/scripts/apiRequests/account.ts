import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/account`;

export const get = async (input: api.account.types.GetRequest): Promise<api.account.types.GetResponse> => {
    return general.apiRequest<api.account.types.GetRequest, api.account.types.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const update = async (input: api.account.types.UpdateRequest): Promise<api.account.types.UpdateResponse> => {
    return general.apiRequest<api.account.types.UpdateRequest, api.account.types.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const remove = async (input: api.account.types.RemoveRequest): Promise<api.account.types.RemoveResponse> => {
    return general.apiRequest<api.account.types.RemoveRequest, api.account.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
