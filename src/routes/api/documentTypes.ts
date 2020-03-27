import * as types from "./apiTypes";

export interface CreateRequest {
    title: string
    authors?: string
    date?: string
    content: string
}

export interface CreateRequestApi extends CreateRequest, types.ApiRequest {}

export interface CreateResponse {
    id: number
    title: string
    authors?: string
    date?: string
}

export interface UpdateRequest {
    id: number
    title?: string
    authors?: string
    date?: string
    content?: string
}

export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}

export interface UpdateResponse {
    id: number
    title: string
    authors?: string
    date?: string
}
