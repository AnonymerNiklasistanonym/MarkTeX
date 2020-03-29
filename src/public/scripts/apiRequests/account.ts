import type * as api from "../../../routes/api";
import * as general from "./general";


export const get = async (input: api.account.types.GetRequest): Promise<api.account.types.GetResponse> => {
    return general.generalApiRequest<api.account.types.GetRequest, api.account.types.GetResponse>(
        "/api/account/get", input
    );
};

export const update = async (input: api.account.types.UpdateRequest): Promise<api.account.types.UpdateResponse> => {
    return general.generalApiRequest<api.account.types.UpdateRequest, api.account.types.UpdateResponse>(
        "/api/account/update", input
    );
};

export const remove = async (input: api.account.types.RemoveRequest): Promise<api.account.types.RemoveResponse> => {
    return general.generalApiRequest<api.account.types.RemoveRequest, api.account.types.RemoveResponse>(
        "/api/account/remove", input
    );
};
