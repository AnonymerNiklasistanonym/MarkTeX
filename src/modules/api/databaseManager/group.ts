import * as account from "./account";
import * as database from "../../database";
import * as groupAccess from "./groupAccess";
import { documentAccess, group } from "../databaseManager";


/** Errors that can happen during a document resource creation */
export enum CreateError {}

/** Errors that can happen during document resource requests */
export enum GeneralError {
    NO_ACCESS = "GROUP_NO_ACCESS",
    NOT_EXISTING = "GROUP_NOT_EXISTING"
}

/** Information about the SQlite table for groups */
export const table = {
    /** SQlite column names for groups table */
    column: {
        /** The unique group id */
        id: "id",
        /** The name of the group */
        name: "name",
        /** The account id of the owner of the group */
        owner: "owner",
        /** Is the group public */
        public: "public"
    },
    /** SQlite table name for groups */
    name: "document_group"
} as const;


// Is XYZ (silent errors)
// -----------------------------------------------------------------------------

export interface IsPublicGetDbOut {
    public: 1|0
}

/**
 * Get if a given group is a public group.
 *
 * @param databasePath Path to database
 * @param groupId Document id to be checked
 */
export const isPublic = async (databasePath: string, groupId: number|undefined): Promise<boolean> => {
    if (groupId) {
        try {
            const runResult = await database.requests.getEach<IsPublicGetDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.public],
                    { whereColumn: table.column.id }
                ),
                [groupId]
            );
            if (runResult) {
                return runResult.public === 1;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};


export interface GetGroupOwnerDbOut {
    owner: number
}

/**
 * Get the owner account id of a group.
 *
 * @param databasePath Path to database
 * @param groupId Group id
 */
export const getGroupOwner = async (
    databasePath: string, groupId: number|undefined
): Promise<number|undefined> => {
    if (groupId) {
        try {
            const runResult = await database.requests.getEach<GetGroupOwnerDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.owner],
                    { whereColumn: table.column.id }
                ),
                [groupId]
            );
            if (runResult) {
                return runResult.owner;
            }
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};

/**
 * Check a given account has the rights to get basic information about a given group.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests to get basic information
 * @param groupId Id of group that is requested to be get
 */
export const checkIfAccountHasAccessToGetGroupInfo = async (
    databasePath: string, requesterAccountId: number|undefined, groupId: number
): Promise<void> => {
    const groupOwnerAccountId = await getGroupOwner(databasePath, groupId);
    // No problem if:
    // 1) The account ids match (account is also owner of group)
    // 2) The requested group is public
    // 3) The requester account has access to the group to be get
    // 4) The account that requests basic information is admin
    if (requesterAccountId !== groupOwnerAccountId && !(
        await isPublic(databasePath, groupId) ||
        await groupAccess.existsAccountGroupIds(databasePath, requesterAccountId, groupId) ||
        await account.isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

/**
 * Check a given account has the rights to update a given group.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests change
 * @param groupId Id of group that is requested to be changed
 */
export const checkIfAccountHasAccessToUpdateGroup = async (
    databasePath: string, requesterAccountId: number, groupId: number
): Promise<void> => {
    const groupOwnerAccountId = await getGroupOwner(databasePath, groupId);
    // No problem if:
    // 1) The account ids match (account is also owner of group)
    // 2) The requester account has access to change the group
    // 3) The account that requests change is admin
    if (requesterAccountId !== groupOwnerAccountId && !(
        await groupAccess.existsAccountGroupIds(databasePath, groupId, requesterAccountId, true) ||
        await account.isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};


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
    // TODO: await account.checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, input.owner);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(table.name, [ table.column.name, table.column.owner, table.column.public ]),
        [ input.name, input.owner, input.public === true ? 1 : 0 ]
    );
    return postResult.lastID;
};

// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}

export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
        databasePath,
        database.queries.exists(table.name, table.column.id),
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
    await checkIfAccountHasAccessToGetGroupInfo(databasePath, accountId, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(table.name, [ table.column.name, table.column.owner, table.column.public ], {
            whereColumn: table.column.id
        }),
        [input.id]
    );
    if (runResult) {
        return {
            id: input.id,
            name: runResult.name,
            owner: runResult.owner,
            public: runResult.public === 1
        };
    }
};

export interface GetAllFromOwnerInput {
    id: number
}
export interface GetAllFromAccountOutput {
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

export const getAllFromAccount = async (
    databasePath: string, accountId: number|undefined, input: GetAllFromOwnerInput
): Promise<GetAllFromAccountOutput[]> => {
    await account.checkIfAccountExists(databasePath, input.id);

    const runResults = await database.requests.getAll<GetAllFromOwnerDbOut>(
        databasePath,
        database.queries.select(table.name, [ table.column.id, table.column.name, table.column.public ], {
            whereColumn: table.column.owner
        }),
        [input.id]
    );
    const allGroups: GetAllFromAccountOutput[] = [];
    const accountIsGroupOwner = input.id === accountId;
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const runResult of runResults) {
        // Only return the groups that the account that requested them has access to
        // This is the case if:
        // 1) The group owner account id is the same as the account id of the requester
        // 2) The group is public
        // 3) There exists a group access for the requester account
        // 4) The requester account is admin
        if (
            accountIsGroupOwner || runResult.public || accountIsAdmin ||
            await groupAccess.existsAccountGroupIds(databasePath, accountId, runResult.id)
        ) {
            allGroups.push({
                id: runResult.id,
                name: runResult.name,
                owner: input.id,
                public: runResult.public === 1
            });
        }
    }
    return allGroups;
};

export interface GetMembersInput {
    /** Group id */
    id: number
}
export interface GetMembersDbOut {
    accountId: number
    accountName: string
    writeAccess: 1|0
}

export interface GetMembersOutput {
    /** Account id */
    accountId: number
    /** Account name */
    accountName: string
    /** Write access */
    writeAccess: boolean
}

export const getMembers = async (
    databasePath: string, accountId: number|undefined, input: GetMembersInput
): Promise<GetMembersOutput[]> => {
    await checkIfGroupExists(databasePath, input.id);

    const runResults = await database.requests.getAll<GetMembersDbOut>(
        databasePath,
        database.queries.select(groupAccess.table.name,
            [
                { alias: "accountId", columnName: account.table.column.id, tableName: account.table.name },
                { alias: "accountName", columnName: account.table.column.name, tableName: account.table.name },
                {
                    alias: "writeAccess",
                    columnName: groupAccess.table.column.writeAccess,
                    tableName: groupAccess.table.name
                }
            ], {
                innerJoins: [{
                    otherColumn: account.table.column.id,
                    otherTableName: account.table.name,
                    thisColumn: groupAccess.table.column.accountId
                }],
                whereColumn: { columnName: table.column.id, tableName: groupAccess.table.name }
            }
        ),
        [input.id]
    );
    const allGroups: GetMembersOutput[] = [];
    const accountIsGroupOwner = input.id === accountId;
    const groupIsPublic = isPublic(databasePath, input.id);
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    const accountHasGroupAccess = await groupAccess.existsAccountGroupIds(databasePath, accountId, input.id);
    for (const runResult of runResults) {
        // Only return the groups that the account that requested them has access to
        // This is the case if:
        // 1) The group owner account id is the same as the account id of the requester
        // 2) The group is public
        // 3) There exists a group access for the requester account
        // 4) The requester account is admin
        if (accountIsGroupOwner || groupIsPublic || accountIsAdmin || accountHasGroupAccess) {
            allGroups.push({
                accountId: runResult.accountId,
                accountName: runResult.accountName,
                writeAccess: runResult.writeAccess === 1
            });
        }
    }
    return allGroups;
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
    await checkIfAccountHasAccessToUpdateGroup(databasePath, accountId, input.id);

    const columns = [];
    const values = [];
    if (input.name) {
        columns.push(table.column.name);
        values.push(input.name);
    }
    if (input.public !== undefined) {
        columns.push(table.column.public);
        values.push(input.public ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.update(table.name, columns, table.column.id),
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
    await checkIfAccountHasAccessToUpdateGroup(databasePath, accountId, input.id);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
        [input.id]
    );
    return postResult.changes > 0;
};
