import * as types from "./apiTypes";

export interface CreateRequest {
    name: string
}

export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}

export interface CreateRequest {
    id: number
    name: string
}

export interface UpdateRequest {
    id: number
    name: string
}

export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}

export interface UpdateResponse {
    id: number
    name: string
}

export interface RemoveRequest {
    id: number
}

export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}

export interface RemoveResponse {
    id: number
}
