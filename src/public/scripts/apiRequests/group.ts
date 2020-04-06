import type * as api from "../../../routes/api";
import * as general from "./general";


export const update = async (input: api.group.types.UpdateRequest): Promise<api.group.types.UpdateResponse> => {
    return general.generalApiRequest<api.group.types.UpdateRequest, api.group.types.UpdateResponse>(
        "/api/group/update", input
    );
};

export const create = async (input: api.group.types.CreateRequest): Promise<api.group.types.CreateResponse> => {
    return general.generalApiRequest<api.group.types.CreateRequest, api.group.types.CreateResponse>(
        "/api/group/create", input
    );
};

export const remove = async (input: api.group.types.RemoveRequest): Promise<api.group.types.RemoveResponse> => {
    return general.generalApiRequest<api.group.types.RemoveRequest, api.group.types.RemoveResponse>(
        "/api/group/remove", input
    );
};
