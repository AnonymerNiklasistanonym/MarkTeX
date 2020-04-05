import * as account from "./account";
import * as database from "../../database";


export enum CreateError {
    ALREADY_EXISTS = "ACCOUNT_FRIEND_ALREADY_EXISTS",
}

export enum GeneralError {
    NO_ACCESS = "ACCOUNT_FRIEND_DOCUMENT_NO_ACCESS",
    NOT_EXISTING = "ACCOUNT_FRIEND_DOCUMENT_NOT_EXISTING"
}


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

export interface ExistsAccountAndFriendAccountInput {
    account: number
    friend: number
}
export interface ExistsAccountAndFriendAccountAllDbOut {
    id: number
    account: number
    friend: number
}

/**
 * Check if account friend entry exists
 *
 * @param databasePath Path to database
 * @param input Account friend entry info
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsDbOut>(
        databasePath,
        database.queries.exists("account_friend", "id"),
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
            database.queries.select("account_friend", [ "id", "account", "friend" ], {
                whereColumn: "account"
            }),
            [input.account]
        );
        for (const friendEntry of runResults) {
            if (friendEntry.account === input.account && friendEntry.friend === input.friend) {
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
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<boolean> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await account.checkIfAccountExists(databasePath, input.friendId);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.accountId);
    await checkIfAccountFriendAlreadyExistsAccountAndAccountFriend(databasePath, input.accountId, input.friendId);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert("account_friend", [ "account", "friend" ]),
        [ input.accountId, input.friendId ]
    );
    return postResult.changes > 0;
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}

export interface GetOutput {
    id: number
    account: number
    friend: number
}

export interface GetDbOut {
    id: number
    account: number
    friend: number
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
    await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(databasePath, accountId, input.id,
        async () => {
            const accountInfo = await account.get(databasePath, accountId, { id: input.id });
            if (accountInfo) { return accountInfo.public; }
            return false;
        });

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select("account_friend", [ "id", "account", "friend" ], {
            whereColumn: "account"
        }),
        [input.id]
    );
    if (runResult) {
        return runResult;
    }
};


// Get all
// -----------------------------------------------------------------------------

export interface GetAllFromAccountInput {
    id: number
}

export interface GetAllFromAccountOutput {
    id: number
    account: number
    friend: number
}

export interface GetAllFromAccountDbOut {
    id: number
    account: number
    friend: number
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
    databasePath: string, accountId: number, input: GetAllFromAccountInput
): Promise<GetAllFromAccountOutput[]> => {
    await checkIfAccountFriendExists(databasePath, input.id);
    await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(databasePath, accountId, input.id,
        async () => {
            const accountInfo = await account.get(databasePath, accountId, { id: input.id });
            if (accountInfo) { return accountInfo.public; }
            return false;
        });

    return await database.requests.getAll<GetAllFromAccountDbOut>(
        databasePath,
        database.queries.select("account_friend", [ "id", "account", "friend" ], {
            whereColumn: "account"
        }),
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
        await account.checkIfAccountHasAccessToAccount(databasePath, accountId, friendInfo.account);
    } else {
        throw Error("This should never happen");
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove("account_friend", "id"),
        [input.id]
    );
    return postResult.changes > 0;
};
