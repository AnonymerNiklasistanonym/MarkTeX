import * as account from "./account";
import * as database from "../../database";
import * as groupAccess from "./groupAccess";


export enum GeneralError {
    NO_ACCESS = "GROUP_NO_ACCESS",
    NOT_EXISTING = "GROUP_NOT_EXISTING"
}

const groupTableName = "document_group";
const groupColumnId = "id";
const groupColumnPublic = "public";
const groupColumnName = "name";
const groupColumnOwner = "owner";


export interface CreateInput {
    owner: number
    name: string
    public?: boolean
}

/**
 * Create group.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the group.
 * @param input Group info.
 * @returns Unique id of group.
 */
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.owner);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.owner);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(groupTableName, [ groupColumnName, groupColumnOwner, groupColumnPublic ]),
        [ input.name, input.owner, input.public === true ? 1 : 0 ]
    );
    return postResult.lastID;
};

// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsDbOut>(
        databasePath,
        database.queries.exists(groupTableName, groupColumnId),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfGroupExists = async (databasePath: string, groupId: number): Promise<void> => {
    if (!await exists(databasePath, { id: groupId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}
export interface GetOutput {
    id: number
    name: string
    owner: number
    public: boolean
}
export interface GetDbOut {
    name: string
    owner: number
    public: number
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfGroupExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(groupTableName, [ groupColumnName, groupColumnOwner, groupColumnPublic ], {
            whereColumn: groupColumnId
        }),
        [input.id]
    );
    if (runResult) {
        const isPublic = runResult.public === 1;

        await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublicOrOther(
            databasePath, accountId, runResult.owner, () => isPublic,
            async () => {
                if (accountId) {
                    return await groupAccess.existsAccountAndGroup(databasePath, {
                        accountId, groupId: input.id
                    });
                }
                return false;
            }
        );

        return {
            id: input.id,
            name: runResult.name,
            owner: runResult.owner,
            public: isPublic
        };
    }
};

export interface GetAllFromOwnerInput {
    id: number
}
export interface GetAllFromOwnerOutput {
    id: number
    name: string
    owner: number
    public: boolean
}
export interface GetAllFromOwnerDbOut {
    id: number
    name: string
    public: number
}

export const getAllFromOwner = async (
    databasePath: string, accountId: number|undefined, input: GetAllFromOwnerInput
): Promise<GetAllFromOwnerOutput[]> => {
    await account.checkIfAccountExists(databasePath, input.id);

    const runResults = await database.requests.getAll<GetAllFromOwnerDbOut>(
        databasePath,
        database.queries.select(groupTableName, [ groupColumnId, groupColumnName, groupColumnPublic ], {
            whereColumn: groupColumnOwner
        }),
        [input.id]
    );
    const allGroups = runResults.map(runResult => ({
        id: runResult.id,
        name: runResult.name,
        owner: input.id,
        public: runResult.public === 1
    }));
    const finalGroups: GetAllFromOwnerOutput[] = [];
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const group of allGroups) {
        if (group.owner === accountId || group.public) {
            finalGroups.push(group);
            continue;
        }

        if (accountId) {
            const accountHasAccess = await groupAccess.existsAccountAndGroup(databasePath, {
                accountId, groupId: group.id
            });
            if (accountHasAccess || accountIsAdmin) {
                finalGroups.push(group);
            }
        }
    }
    return finalGroups;
};



// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
    id: number
    name?: string
    public?: boolean
}

export const update = async (databasePath: string, accountId: number, input: UpdateInput): Promise<boolean> => {
    await checkIfGroupExists(databasePath, input.id);
    const groupInfo = await get(databasePath, accountId, { id: input.id });
    if (groupInfo) {
        await account.checkIfAccountHasAccessToAccountOrOther(
            databasePath, accountId, groupInfo.owner,
            () => groupAccess.existsAccountAndGroup(databasePath, {
                accountId, groupId: groupInfo.id, writeAccess: true
            })
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const columns = [];
    const values = [];
    if (input.name) {
        columns.push(groupColumnName);
        values.push(input.name);
    }
    if (input.public !== undefined) {
        columns.push(groupColumnPublic);
        values.push(input.public ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.update(groupTableName, columns, groupColumnId),
        values
    );
    return postResult.changes > 0;
};

export interface RemoveInput {
    id: number
}

/**
 * Remove group.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that wants to remove the group.
 * @param input Group info.
 * @returns True if at least one element was removed otherwise False.
 */
export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfGroupExists(databasePath, input.id);
    const documentInfo = await get(databasePath, accountId, { id: input.id });
    if (documentInfo) {
        await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(
            databasePath, accountId, documentInfo.owner, () => documentInfo.public
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(groupTableName, groupColumnId),
        [input.id]
    );
    return postResult.changes > 0;
};
