import * as types from "./apiTypes";


export interface AddRequest {
    accountId: number
    groupId: number
    writeAccess?: boolean
}
export interface AddRequestApi extends AddRequest, types.ApiRequest {}
export interface AddResponse {
    /** Access entry id */
    id: number
}

export interface AddNameRequest {
    accountName: string
    groupId: number
    writeAccess?: boolean
}
export interface AddNameRequestApi extends AddNameRequest, types.ApiRequest {}
export interface AddNameResponse {
    /** Access entry id */
    id: number
}

export interface UpdateRequest {
    id: number
    writeAccess?: boolean
}
export interface UpdateRequestApi extends UpdateRequest, types.ApiRequest {}
export interface UpdateResponse {
    id: number
    writeAccess: boolean
}

export interface RemoveRequest {
    /** Access entry id */
    id: number
}
export interface RemoveRequestApi extends RemoveRequest, types.ApiRequest {}
export interface RemoveResponse {
    /** Removed access entry id */
    id: number
}
