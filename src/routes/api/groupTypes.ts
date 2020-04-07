import * as types from "./apiTypes";

export interface CreateRequest {
    owner: number
    name: string
    public?: boolean
}

export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}

export interface CreateResponse {
    id: number
    name: string
    owner: number
    public: boolean
}

export interface GetRequest {
    id: number
}

export interface GetRequestApi extends GetRequest, types.ApiRequest {}

export interface GetResponse {
    id: number
    name: string
    owner: number
    public: boolean
}

export interface UpdateRequest {
    id: number
    name?: string
    public?: boolean
}

export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}

export interface UpdateResponse {
    id: number
    name: string
    owner: number
    public: boolean
}

export interface RemoveRequest {
    id: number
}

export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}

export interface RemoveResponse {
    id: number
}
