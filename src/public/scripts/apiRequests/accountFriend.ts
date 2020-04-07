import type * as api from "../../../routes/api";
import * as general from "./general";


export const get = async (input: api.accountFriend.types.GetRequest): Promise<api.accountFriend.types.GetResponse> => {
    return general.generalApiRequest<api.accountFriend.types.GetRequest, api.accountFriend.types.GetResponse>(
        "/api/account_friend/get", input
    );
};

export const add = async (input: api.accountFriend.types.AddRequest): Promise<api.accountFriend.types.AddResponse> => {
    return general.generalApiRequest<api.accountFriend.types.AddRequest, api.accountFriend.types.AddResponse>(
        "/api/account_friend/add", input
    );
};

export const addName = async (
    input: api.accountFriend.types.AddNameRequest
): Promise<api.accountFriend.types.AddNameResponse> => {
    return general.generalApiRequest<api.accountFriend.types.AddNameRequest, api.accountFriend.types.AddNameResponse>(
        "/api/account_friend/addName", input
    );
};

export const remove = async (
    input: api.accountFriend.types.RemoveRequest
): Promise<api.accountFriend.types.RemoveResponse> => {
    return general.generalApiRequest<api.accountFriend.types.RemoveRequest, api.accountFriend.types.RemoveResponse>(
        "/api/account_friend/remove", input
    );
};
