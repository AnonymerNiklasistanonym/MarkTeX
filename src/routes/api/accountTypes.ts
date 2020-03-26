import * as types from "./apiTypes";

export interface LoginRequest {
    name: string
    password: string
}

export interface LoginRequestApi extends LoginRequest, types.ApiRequest {}

export interface LoginResponse {
    id: number
    name: string
}

export interface RegisterRequest {
    name: string
    password: string
}

export interface RegisterRequestApi extends RegisterRequest, types.ApiRequest {}

export interface RegisterResponse {
    id: number
    name: string
}
