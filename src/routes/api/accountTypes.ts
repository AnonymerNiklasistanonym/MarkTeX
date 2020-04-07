import * as types from "./apiTypes";

export interface LoginRequest {
    name: string
    password: string
}
export interface LoginRequestApi extends LoginRequest, types.ApiRequest {}
export interface LoginResponse {
    id: number
}

export interface CreateRequest {
    name: string
    password: string
}
export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}
export interface CreateResponse {
    id: number
}

export interface GetRequest {
    id: number
}
export interface GetRequestApi extends GetRequest, types.ApiRequest {}
export interface GetResponse {
    id: number
    name: string
    admin: boolean
    public: boolean
}

export interface RemoveRequest {
    id: number
}
export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}
export interface RemoveResponse {
    id: number
}

export interface UpdateRequest {
    id: number
    name?: string
    password?: string
    currentPassword: string
    public?: boolean
    admin?: boolean
}
export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}
export interface UpdateResponse {
    id: number
    name: string
    admin: boolean
    public: boolean
}
