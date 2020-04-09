import type * as api from "../../../routes/api";
import * as general from "./general";


const baseUrl = `${general.baseUrlApi}/account_friend`;

export const get = async (input: api.accountFriend.GetRequest): Promise<api.accountFriend.GetResponse> => {
    return general.apiRequest<api.accountFriend.GetRequest, api.accountFriend.GetResponse>(
        `${baseUrl}/get`, input
    );
};

export const add = async (input: api.accountFriend.AddRequest): Promise<api.accountFriend.AddResponse> => {
    return general.apiRequest<api.accountFriend.AddRequest, api.accountFriend.AddResponse>(
        `${baseUrl}/add`, input
    );
};

export const addName = async (input: api.accountFriend.AddNameRequest): Promise<api.accountFriend.AddNameResponse> => {
    return general.apiRequest<api.accountFriend.AddNameRequest, api.accountFriend.AddNameResponse>(
        `${baseUrl}/addName`, input
    );
};

export const remove = async (input: api.accountFriend.RemoveRequest): Promise<api.accountFriend.RemoveResponse> => {
    return general.apiRequest<api.accountFriend.RemoveRequest, api.accountFriend.RemoveResponse>(
        `${baseUrl}/remove`, input
    );
};
