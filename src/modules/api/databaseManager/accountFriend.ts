import * as account from "./account";
import * as database from "../../database";


export enum CreateError {
    ALREADY_EXISTS = "ACCOUNT_FRIEND_ALREADY_EXISTS",
}

export enum GeneralError {
    NO_ACCESS = "ACCOUNT_FRIEND_NO_ACCESS",
    NOT_EXISTING = "ACCOUNT_FRIEND_NOT_EXISTING"
}

/** Information about the SQlite table for account friend entries */
export const table = {
    /** SQlite column names for account friend entries table */
    column: {
        /** The unique account id */
        accountId: "account_id",
        /** The unique account id that is a friend of the account */
        friendAccountId: "friend_account_id",
        /** The unique friend account entry id */
        id: "id"
    },
    /** SQlite table name for account friend entries */
    name: "account_friend"
} as const;


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    /** ID of account friend entry */
    id: number
}
export interface ExistsAccountAndFriendAccountAllDbOut {
    friendAccountId: number
}

/**
 * Check if account friend entry exists
 *
 * @param databasePath Path to database
 * @param input Account friend entry info
 */
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

/**
 * Check if account friend entry exists
 *
 * @param databasePath Path to database
 * @param accountId ID of account that is checked for friend entries
 * @param friendAccountId ID of account that is checked to be friend of account
 */
export const existsAccountIds = async (
    databasePath: string, accountId: number, friendAccountId: number|undefined
): Promise<boolean> => {
    if (accountId) {
        try {
            const runResults = await database.requests.getAll<ExistsAccountAndFriendAccountAllDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [{
                        alias: "friendAccountId",
                        columnName: table.column.friendAccountId
                    }],
                    { whereColumn: table.column.accountId }
                ),
                [accountId]
            );
            for (const friendEntry of runResults) {
                if (friendEntry.friendAccountId === friendAccountId) {
                    return true;
                }
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfAccountFriendExists = async (databasePath: string, friendEntryId: number): Promise<void> => {
    if (!await exists(databasePath, { id: friendEntryId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

export const checkIfAccountFriendEntryExistsAccountIds = async (
    databasePath: string, accountId: number, friendAccountId: number
): Promise<void> => {
    if (await existsAccountIds(databasePath, accountId, friendAccountId)) {
        throw Error(CreateError.ALREADY_EXISTS);
    }
};


// Create
// -----------------------------------------------------------------------------

export interface CreateInput {
    accountId: number
    friendAccountId: number
}

/**
 * Create account friend entry.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Account friend entry info
 * @throws When not be able to create account friend entry or database fails
 */
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await account.checkIfAccountExists(databasePath, input.friendAccountId);
    await account.checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, input.accountId);
    await checkIfAccountFriendEntryExistsAccountIds(databasePath, input.accountId, input.friendAccountId);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(table.name,
            [ table.column.accountId, table.column.friendAccountId ]
        ),
        [ input.accountId, input.friendAccountId ]
    );
    return postResult.lastID;
};

export interface CreateNameInput {
    accountId: number
    friendAccountName: string
}

export const createName = async (databasePath: string, accountId: number, input: CreateNameInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await account.checkIfAccountExistsName(databasePath, input.friendAccountName);
    await account.checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, input.accountId);

    const friendAccountInfo = await account.getName(databasePath, accountId, {
        name: input.friendAccountName
    });
    if (friendAccountInfo) {
        await checkIfAccountFriendEntryExistsAccountIds(
            databasePath, input.accountId, friendAccountInfo.id
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(table.name,
            [ table.column.accountId, table.column.friendAccountId ]
        ),
        [ input.accountId, friendAccountInfo.id ]
    );
    return postResult.lastID;
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}

export interface GetOutput {
    id: number
    accountId: number
    friendAccountId: number
}

export interface GetDbOut {
    accountId: number
    friendAccountId: number
}

/**
 * Get account friend entry.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Account get info
 * @throws When not able to get account friend entry or database fails
 */
export const get = async (
    databasePath: string, accountId: number, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfAccountFriendExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(table.name,
            [
                { alias: "accountId", columnName: table.column.accountId },
                { alias: "friendAccountId", columnName: table.column.friendAccountId }
            ],
            { whereColumn: table.column.id }
        ),
        [input.id]
    );
    if (runResult) {
        await account.checkIfAccountHasAccessToGetAccountInfo(databasePath, accountId, runResult.accountId);

        return {
            accountId: runResult.accountId,
            friendAccountId: runResult.friendAccountId,
            id: input.id
        };
    }
};


// Get all
// -----------------------------------------------------------------------------

export interface GetAllFromAccountInput {
    id: number
    getNames?: boolean
}

export interface GetAllFromAccountOutput {
    id: number
    friendAccountId: number
    friendAccountName?: string
}

export interface GetAllFromAccountDbOut {
    id: number
    friendAccountId: number
    friendAccountName?: string
}

/**
 * Get account friend entries from one account.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Account info
 * @throws When not able to get account friend entries or database fails
 */
export const getAllFromAccount = async (
    databasePath: string, accountId: number|undefined, input: GetAllFromAccountInput
): Promise<GetAllFromAccountOutput[]> => {
    await account.checkIfAccountExists(databasePath, input.id);
    await account.checkIfAccountHasAccessToGetAccountInfo(databasePath, accountId, input.id);

    const columns: (database.queries.SelectColumn|string)[] = [
        { columnName: table.column.id, tableName: table.name },
        { alias: "friendAccountId", columnName: table.column.friendAccountId }
    ];
    if (input.getNames) {
        columns.push({
            alias: "friendAccountName", columnName: account.table.column.name,
            tableName: account.table.name
        });
    }

    const innerJoins: database.queries.SelectQueryInnerJoin[] = [];
    if (input.getNames) {
        innerJoins.push({
            otherColumn: account.table.column.id,
            otherTableName: account.table.name,
            thisColumn: table.column.friendAccountId
        });
    }

    return await database.requests.getAll<GetAllFromAccountDbOut>(
        databasePath,
        database.queries.select(table.name,
            columns,
            { innerJoins, whereColumn: table.column.accountId }
        ),
        [input.id]
    );
};


// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
    id: number
}

export interface RemoveFriendInput {
    accountId: number
    friendId: number
}

/**
 * Remove account friend entry.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Remove info.
 * @throws When not able to remove account friend entry or database fails
 */
export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfAccountFriendExists(databasePath, input.id);
    const friendInfo = await get(databasePath, accountId, { id: input.id });
    if (friendInfo) {
        await account.checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, friendInfo.accountId);
    } else {
        throw Error("This should never happen");
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
        [input.id]
    );
    return postResult.changes > 0;
};
