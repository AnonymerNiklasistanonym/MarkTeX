import * as accountFriends from "./accountFriend";
import * as database from "../../database";
import crypto from "../../crypto";


export enum CreateError {
    PASSWORD_INVALID_FORMAT = "ACCOUNT_USER_NAME_INVALID_FORMAT",
    USER_NAME_ALREADY_EXISTS = "ACCOUNT_USER_NAME_ALREADY_EXISTS",
    USER_NAME_INVALID_FORMAT = "ACCOUNT_USER_NAME_INVALID_FORMAT"
}

export enum GeneralError {
    NO_ACCESS = "ACCOUNT_NO_ACCESS",
    NOT_EXISTING = "ACCOUNT_NOT_EXISTING"
}


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsNameInput {
    name: string
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}
export interface ExistsNameDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Check if account exists given an account name.
 *
 * @param databasePath Path to database
 * @param input Info necessary to check it
 */
export const existsName = async (databasePath: string, input: ExistsNameInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsDbOut>(
        databasePath,
        database.queries.exists("account", "name"),
        [input.name]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};

/**
 * Check if account exists.
 *
 * @param databasePath Path to database
 * @param input Info necessary to check it
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsNameDbOut>(
        databasePath,
        database.queries.exists("account", "id"),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};


// Is admin
// -----------------------------------------------------------------------------

export interface IsAdminGetDbOut {
    admin: number
}

/**
 * Get if a given account is an admin account.
 * (Does not check if an account exists)
 *
 * @param databasePath Path to database
 * @param accountId Account id to be checked
 */
export const isAdmin = async (databasePath: string, accountId: number|undefined): Promise<boolean> => {
    if (accountId) {
        try {
            const runResult = await database.requests.getEach<IsAdminGetDbOut>(
                databasePath,
                database.queries.select("account", ["admin"], { whereColumn: "id" }),
                [accountId]
            );
            if (runResult) {
                return runResult.admin === 1;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfAccountExists = async (databasePath: string, accountId: number): Promise<void> => {
    if (!await exists(databasePath, { id: accountId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

export const checkIfAccountExistsName = async (databasePath: string, accountName: string): Promise<void> => {
    if (!await existsName(databasePath, { name: accountName })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

export const checkIfAccountHasAccessToAccount = async (
    databasePath: string, requesterAccountId: number, accessAccountId: number
): Promise<void> => {
    if (requesterAccountId !== accessAccountId && !await isAdmin(databasePath, requesterAccountId)) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

export const checkIfAccountHasAccessToAccountOrIsFriend = async (
    databasePath: string, requesterAccountId: number|undefined, accessAccountId: number, accessAccountIsPublic = false
): Promise<void> => {
    if (requesterAccountId !== accessAccountId && !(
        accessAccountIsPublic
        || (requesterAccountId && await accountFriends.existsAccountAndFriendAccount(databasePath, {
            account: accessAccountId, friend: requesterAccountId
        }))
        || await isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

export const checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic = async (
    databasePath: string, requesterAccountId: number|undefined, accessAccountId: number,
    accessIsPublic: () => (Promise<boolean>|boolean)
): Promise<void> => {
    await checkIfAccountHasAccessToAccountOrIsFriend(databasePath, requesterAccountId, accessAccountId,
        await accessIsPublic());
};


// Create
// -----------------------------------------------------------------------------

/**
 * Info about user name format.
 */
export const createInfoUsername = {
    info: "The account name must be between 4 and 16 characters",
    maxLength: 16,
    regex: /^\w{4,16}$/
};

/**
 * Info about password format.
 */
export const createInfoPassword = {
    info: "The password must be at least 6 characters long",
    minLength: 6,
    regex: /^.{6,}/
};

export interface CreateInput {
    admin?: boolean
    name: string
    password: string
    public?: boolean
}

/**
 * Create account.
 *
 * @param databasePath Path to database
 * @param input Account info
 * @throws When not able to create account or database fails
 * @returns ID of created account
 */
export const create = async (databasePath: string, input: CreateInput): Promise<number> => {
    // Validate that password and user name have correct format and that user name does not already exist
    if (await existsName(databasePath, { name: input.name })) {
        throw Error(CreateError.USER_NAME_ALREADY_EXISTS);
    }
    if (!createInfoUsername.regex.test(input.name)) {
        throw Error(CreateError.USER_NAME_INVALID_FORMAT);
    }
    if (!createInfoPassword.regex.test(input.password)) {
        throw Error(CreateError.PASSWORD_INVALID_FORMAT);
    }

    const columns = [ "name", "password_hash", "password_salt" ];
    const hashAndSalt = crypto.generateHashAndSalt(input.password);
    const values: (string|number)[] = [ input.name, hashAndSalt.hash, hashAndSalt.salt ];
    columns.push("admin");
    values.push(input.admin === true ? 1 : 0);
    columns.push("public");
    values.push(input.public === true ? 1 : 0);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert("account", columns),
        values
    );
    return postResult.lastID;
};


// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
    id: number
}

/**
 * Remove account.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Remove info.
 * @throws When not able to remove account or database fails
 */
export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfAccountExists(databasePath, input.id);
    await checkIfAccountHasAccessToAccount(databasePath, accountId, input.id);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove("account", "id"),
        [input.id]
    );
    return postResult.changes > 0;
};


// Check login
// -----------------------------------------------------------------------------

export interface CheckLoginInput {
    name: string
    password: string
}
export interface CheckLoginDbOut {
    id: number
    // eslint-disable-next-line camelcase
    password_hash: string
    // eslint-disable-next-line camelcase
    password_salt: string
}

/**
 * Check if account login is correct.
 *
 * @param databasePath Path to database
 * @param input Account login info
 * @throws When not able to check login of account or database fails
 * @returns If password is correct the account id is returned
 */
export const checkLogin = async (databasePath: string, input: CheckLoginInput): Promise<void|number> => {
    await checkIfAccountExistsName(databasePath, input.name);

    const runResult = await database.requests.getEach<CheckLoginDbOut>(
        databasePath,
        database.queries.select("account", [ "id", "password_hash", "password_salt" ], {
            whereColumn: "name"
        }),
        [input.name]
    );
    if (runResult) {
        const passwordCorrect = crypto.checkPassword(input.password, {
            hash: runResult.password_hash,
            salt: runResult.password_salt
        });
        if (passwordCorrect) {
            return runResult.id;
        }
    }
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}
export interface GetOutput {
    admin: boolean
    id: number
    name: string
    public: boolean
}
export interface GetDbOut {
    admin: number
    name: string
    public: number
}

/**
 * Get account.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Account get info
 * @throws When not able to get account or database fails
 */
export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfAccountExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select("account", [ "name", "admin", "public" ], {
            whereColumn: "id"
        }),
        [input.id]
    );
    if (runResult) {
        const isPublic = runResult.public === 1;

        await checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(databasePath, accountId, input.id,
            () => isPublic);

        return {
            admin: runResult.admin === 1,
            id: input.id,
            name: runResult.name,
            public: isPublic
        };
    }
};


// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
    admin?: boolean
    id: number
    name?: string
    password?: string
    public?: boolean
}

/**
 * Update account.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input New account info
 * @throws When not able to update account or database fails
 */
export const update = async (databasePath: string, accountId: number, input: UpdateInput): Promise<boolean> => {
    await checkIfAccountExists(databasePath, input.id);
    await checkIfAccountHasAccessToAccount(databasePath, accountId, input.id);

    const columns = [];
    const values = [];
    if (input.admin !== undefined) {
        columns.push("admin");
        values.push(input.admin ? 1 : 0);
    }
    if (input.public !== undefined) {
        columns.push("public");
        values.push(input.public ? 1 : 0);
    }
    if (input.password) {
        const hashAndSalt = crypto.generateHashAndSalt(input.password);
        columns.push("password_hash", "password_salt");
        values.push(hashAndSalt.hash, hashAndSalt.salt);
    }
    if (input.name) {
        columns.push("name");
        values.push(input.name);
    }
    if (input.admin !== undefined) {
        console.warn("Account admin status was updated", input.admin);
        columns.push("admin");
        values.push(input.admin ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.update("account", columns, "id"),
        values
    );
    return postResult.changes > 0;
};
