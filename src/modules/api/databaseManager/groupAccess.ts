import * as account from "./account";
import * as database from "../../database";
import * as document from "./document";
import * as group from "./group";


/** Errors that can happen during a group access entry creation */
export enum CreateError {
    ALREADY_EXISTS = "GROUP_ACCESS_ALREADY_EXISTS"
}

/** Errors that can happen during group access entry requests */
export enum GeneralError {
    NO_ACCESS = "GROUP_ACCESS_NO_ACCESS",
    NOT_EXISTING = "GROUP_ACCESS_NOT_EXISTING"
}

/** Information about the SQlite table for group access entries */
export const table = {
    /** SQlite column names for group access entries table */
    column: {
        /** The account id */
        accountId: "account_id",
        /** The group id */
        groupId: "document_group_id",
        /** The unique group access entry id */
        id: "id",
        /** Is the access read only or read-write */
        writeAccess: "write_access"
    },
    /** SQlite table name for group access entries */
    name: "document_group_access"
} as const;


// Exists
// -----------------------------------------------------------------------------

export interface ExistsAccountGroupIdsDbOutput {
    accountId: number
    writeAccess: 1|0
}

export const exists = async (databasePath: string, groupAccessId: number): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
        databasePath,
        database.queries.exists(table.name, table.column.id),
        [groupAccessId]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};

export const existsAccountGroupIds = async (
    databasePath: string, accountId: number|undefined, groupId: number, writeAccess = false
): Promise<boolean> => {
    if (accountId) {
        try {
            const runResults = await database.requests.getAll<ExistsAccountGroupIdsDbOutput>(
                databasePath,
                database.queries.select(
                    table.name,
                    [{ alias: "accountId", columnName: table.column.accountId }],
                    { whereColumn: table.column.groupId }
                ),
                [groupId]
            );
            for (const groupAccessEntry of runResults) {
                if (groupAccessEntry.accountId === accountId) {
                    if (writeAccess && groupAccessEntry.writeAccess !== 1) {
                        return false;
                    }
                    return true;
                }
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};

// Is XYZ (silent errors)
// -----------------------------------------------------------------------------

export interface IsWriteAccessDbOut {
    writeAccess: 1|0
}

/**
 * Get if a given group is a public group.
 *
 * @param databasePath Path to database
 * @param groupId Group id to be checked
 */
export const isWriteAccess = async (databasePath: string, groupId: number|undefined): Promise<boolean> => {
    if (groupId) {
        try {
            const runResult = await database.requests.getEach<IsWriteAccessDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.writeAccess],
                    { whereColumn: table.column.id }
                ),
                [groupId]
            );
            if (runResult) {
                return runResult.writeAccess === 1;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfGroupAccessExists = async (databasePath: string, documentAccessId: number): Promise<void> => {
    if (!await exists(databasePath, documentAccessId)) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

export const checkIfGroupAccessExistsAccountGroupIds = async (
    databasePath: string, accountId: number, documentId: number
): Promise<void> => {
    if (!await existsAccountGroupIds(databasePath, accountId, documentId)) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};


// Add
// -----------------------------------------------------------------------------

export interface AddInput {
    accountId: number
    groupId: number
    writeAccess?: boolean
}

export const add = async (databasePath: string, accountId: number, input: AddInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await group.checkIfGroupExists(databasePath, input.groupId);
    await group.checkIfAccountHasAccessToUpdateGroup(databasePath, accountId, input.groupId);

    if (await existsAccountGroupIds(databasePath, input.accountId, input.groupId)) {
        throw Error(CreateError.ALREADY_EXISTS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(
            table.name,
            [ table.column.accountId, table.column.groupId, table.column.writeAccess ]
        ),
        [ input.accountId, input.groupId, input.writeAccess ? 1 : 0 ]
    );
    return postResult.lastID;
};

export interface AddNameInput {
    accountName: string
    groupId: number
    writeAccess?: boolean
}

export const addName = async (databasePath: string, accountId: number, input: AddNameInput): Promise<number> => {
    await account.checkIfAccountExistsName(databasePath, input.accountName);
    await group.checkIfGroupExists(databasePath, input.groupId);

    const accountInfo = await account.getName(databasePath, accountId, { name: input.accountName });
    if (!(accountInfo)) {
        throw Error(account.GeneralError.NOT_EXISTING);
    }
    await group.checkIfAccountHasAccessToUpdateGroup(databasePath, accountId, input.groupId);

    if (await existsAccountGroupIds(databasePath, accountInfo.id, input.groupId)) {
        throw Error(CreateError.ALREADY_EXISTS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(
            table.name,
            [ table.column.accountId, table.column.groupId, table.column.writeAccess ]
        ),
        [ accountInfo.id, input.groupId, input.writeAccess ? 1 : 0 ]
    );
    return postResult.lastID;
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}
export interface GetOutput {
    accountId: number
    groupId: number
    writeAccess: boolean
    id: number
}
export interface GetDbOut {
    accountId: number
    groupId: number
    writeAccess: 1|0
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfGroupAccessExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(
            table.name,
            [
                { alias: "accountId", columnName: table.column.accountId },
                { alias: "groupId", columnName: table.column.groupId },
                { alias: "writeAccess", columnName: table.column.writeAccess }
            ],
            { whereColumn: table.column.id }
        ),
        [input.id]
    );
    if (runResult) {
        await group.checkIfAccountHasAccessToGetGroupInfo(databasePath, accountId, runResult.groupId);

        return {
            accountId: runResult.accountId,
            groupId: runResult.groupId,
            id: input.id,
            writeAccess: runResult.writeAccess === 1
        };
    }
};


// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
    id: number
}

export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfGroupAccessExists(databasePath, input.id);
    const groupAccessInfo = await get(databasePath, accountId, { id: input.id });
    if (groupAccessInfo) {
        await group.checkIfAccountHasAccessToUpdateGroup(databasePath, accountId, groupAccessInfo.groupId);
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
        [input.id]
    );
    return postResult.changes > 0;
};
