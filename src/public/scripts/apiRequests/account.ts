import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/account`;

export const get = async (input: api.account.GetRequest): Promise<api.account.GetResponse> => {
    return general.apiRequest<api.account.GetRequest, api.account.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const update = async (input: api.account.UpdateRequest): Promise<api.account.UpdateResponse> => {
    return general.apiRequest<api.account.UpdateRequest, api.account.UpdateResponse>(
        `${baseUrl}/update`, input
    );
};

export const remove = async (input: api.account.RemoveRequest): Promise<api.account.RemoveResponse> => {
    return general.apiRequest<api.account.RemoveRequest, api.account.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
