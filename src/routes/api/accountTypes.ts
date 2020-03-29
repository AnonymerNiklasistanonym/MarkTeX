import * as types from "./apiTypes";

export interface LoginRequest {
    name: string
    password: string
}
export interface LoginRequestApi extends LoginRequest, types.ApiRequest {}

export interface RegisterRequest {
    name: string
    password: string
}
export interface RegisterRequestApi extends RegisterRequest, types.ApiRequest {}

export interface GetRequest {
    id: number
}
export interface GetRequestApi extends GetRequest, types.ApiRequest {}
export interface GetResponse {
    id: number
    name: string
    admin: boolean
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
}
export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}
export interface UpdateResponse {
    id: number
    name: string
    admin: boolean
}
