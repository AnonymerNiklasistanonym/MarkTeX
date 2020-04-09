import * as types from "./apiTypes";

export interface AddRequest {
    accountId: number
    friendAccountId: number
}
export interface AddRequestApi extends AddRequest, types.ApiRequest {}
export interface AddResponse {
    id: number
    accountId: number
    accountName: string
    friendAccountId: number
    friendAccountName: string
}

export interface AddNameRequest {
    accountId: number
    friendAccountName: string
}
export interface AddNameRequestApi extends AddNameRequest, types.ApiRequest {}
export interface AddNameResponse {
    id: number
    accountId: number
    accountName: string
    friendAccountId: number
    friendAccountName: string
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
