import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/account_friend`;

export const get = async (input: api.accountFriend.types.GetRequest): Promise<api.accountFriend.types.GetResponse> => {
    return general.apiRequest<api.accountFriend.types.GetRequest, api.accountFriend.types.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const add = async (input: api.accountFriend.types.AddRequest): Promise<api.accountFriend.types.AddResponse> => {
    return general.apiRequest<api.accountFriend.types.AddRequest, api.accountFriend.types.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (
    input: api.accountFriend.types.AddNameRequest
): Promise<api.accountFriend.types.AddNameResponse> => {
    return general.apiRequest<api.accountFriend.types.AddNameRequest, api.accountFriend.types.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (
    input: api.accountFriend.types.RemoveRequest
): Promise<api.accountFriend.types.RemoveResponse> => {
    return general.apiRequest<api.accountFriend.types.RemoveRequest, api.accountFriend.types.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
