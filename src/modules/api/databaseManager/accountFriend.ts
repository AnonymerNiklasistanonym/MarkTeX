import * as account from "./account";
import * as database from "../../database";


export enum CreateError {
    ALREADY_EXISTS = "ACCOUNT_FRIEND_ALREADY_EXISTS",
}

export enum GeneralError {
    NO_ACCESS = "ACCOUNT_FRIEND_NO_ACCESS",
    NOT_EXISTING = "ACCOUNT_FRIEND_NOT_EXISTING"
}

export const accountFriendTableName = "account_friend";
export const accountFriendColumnId = "id";
export const accountFriendColumnAccountId = "account_id";
export const accountFriendColumnFriendAccountId = "friend_account_id";


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsAccountAndFriendAccountInput {
    account: number
    friend: number
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
        database.queries.exists(accountFriendTableName, accountFriendColumnId),
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
 * @param input Account friend entry info
 */
export const existsAccountAndFriendAccount = async (
    databasePath: string, input: ExistsAccountAndFriendAccountInput
): Promise<boolean> => {
    try {
        const runResults = await database.requests.getAll<ExistsAccountAndFriendAccountAllDbOut>(
            databasePath,
            database.queries.select(accountFriendTableName,
                [{
                    alias: "friendAccountId",
                    columnName: accountFriendColumnFriendAccountId
                }],
                { whereColumn: accountFriendColumnAccountId }
            ),
            [input.account]
        );
        for (const friendEntry of runResults) {
            if (friendEntry.friendAccountId === input.friend) {
                return true;
            }
        }
    } catch (error) {
        return false;
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

export const checkIfAccountFriendAlreadyExistsAccountAndAccountFriend = async (
    databasePath: string, accountId: number, friendAccountId: number
): Promise<void> => {
    if (await existsAccountAndFriendAccount(databasePath, { account: accountId, friend: friendAccountId })) {
        throw Error(CreateError.ALREADY_EXISTS);
    }
};


// Create
// -----------------------------------------------------------------------------

export interface CreateInput {
    accountId: number
    friendId: number
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
    await account.checkIfAccountExists(databasePath, input.friendId);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.accountId);
    await checkIfAccountFriendAlreadyExistsAccountAndAccountFriend(databasePath, input.accountId, input.friendId);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(accountFriendTableName,
            [ accountFriendColumnAccountId, accountFriendColumnFriendAccountId ]
        ),
        [ input.accountId, input.friendId ]
    );
    return postResult.lastID;
};

export interface CreateNameInput {
    accountId: number
    friendName: string
}

export const createName = async (databasePath: string, accountId: number, input: CreateNameInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await account.checkIfAccountExistsName(databasePath, input.friendName);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.accountId);

    const friendAccountInfo = await account.getName(databasePath, accountId, {
        name: input.friendName
    });
    if (friendAccountInfo) {
        await checkIfAccountFriendAlreadyExistsAccountAndAccountFriend(
            databasePath, input.accountId, friendAccountInfo.id
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(accountFriendTableName,
            [ accountFriendColumnAccountId, accountFriendColumnFriendAccountId ]
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
    friendId: number
}

export interface GetDbOut {
    id: number
    accountId: number
    friendId: number
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
        database.queries.select(accountFriendTableName,
            [
                accountFriendColumnId,
                { alias: "accountId", columnName: accountFriendColumnAccountId },
                { alias: "friendId", columnName: accountFriendColumnFriendAccountId }
            ],
            { whereColumn: accountFriendColumnId }
        ),
        [input.id]
    );
    if (runResult) {
        await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(
            databasePath, accountId, runResult.accountId, async () => {
                const accountInfo = await account.get(databasePath, accountId, { id: runResult.accountId });
                if (accountInfo) { return accountInfo.public; }
                return false;
            });
        return {
            accountId: runResult.accountId,
            friendId: runResult.friendId,
            id: runResult.id
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
    await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(databasePath, accountId, input.id,
        async () => {
            const accountInfo = await account.get(databasePath, accountId, { id: input.id });
            if (accountInfo) { return accountInfo.public; }
            return false;
        });

    const columns: (database.queries.SelectColumn|string)[] = [
        { columnName: accountFriendColumnId, tableName: accountFriendTableName },
        { alias: "friendAccountId", columnName: accountFriendColumnFriendAccountId }
    ];
    if (input.getNames) {
        columns.push({
            alias: "friendAccountName", columnName: account.accountColumnName,
            tableName: account.accountTableName
        });
    }

    const innerJoins: database.queries.SelectQueryInnerJoin[] = [];
    if (input.getNames) {
        innerJoins.push({
            otherColumn: account.accountColumnId,
            otherTableName: account.accountTableName,
            thisColumn: accountFriendColumnFriendAccountId
        });
    }

    return await database.requests.getAll<GetAllFromAccountDbOut>(
        databasePath,
        database.queries.select(accountFriendTableName,
            columns,
            { innerJoins, whereColumn: accountFriendColumnAccountId }
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
        await account.checkIfAccountHasAccessToAccount(databasePath, accountId, friendInfo.accountId);
    } else {
        throw Error("This should never happen");
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(accountFriendTableName, accountFriendColumnId),
        [input.id]
    );
    return postResult.changes > 0;
};
