import * as types from "./apiTypes";

export interface AddRequest {
    accountId: number
    friendId: number
}
export interface AddRequestApi extends AddRequest, types.ApiRequest {}
export interface AddResponse {
    id: number
}

export interface GetRequest {
    id: number
}
export interface GetRequestApi extends GetRequest, types.ApiRequest {}
export interface GetResponse {
    id: number
    accountId: number
    friendId: number
}

export interface RemoveRequest {
    id: number
}
export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}
export interface RemoveResponse {
    id: number
}
