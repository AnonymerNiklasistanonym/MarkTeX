import * as accountFriends from "./accountFriend";
import * as database from "../../database";
import crypto from "../../crypto";


/** Errors that can happen during an account creation */
export enum CreateError {
    PASSWORD_INVALID_FORMAT = "ACCOUNT_USER_NAME_INVALID_FORMAT",
    USER_NAME_ALREADY_EXISTS = "ACCOUNT_USER_NAME_ALREADY_EXISTS",
    USER_NAME_INVALID_FORMAT = "ACCOUNT_USER_NAME_INVALID_FORMAT"
}

/** Errors that can happen during account requests */
export enum GeneralError {
    NO_ACCESS = "ACCOUNT_NO_ACCESS",
    NOT_EXISTING = "ACCOUNT_NOT_EXISTING"
}

/** Information about the SQlite table for accounts */
export const table = {
    /** SQlite column names for accounts table */
    column: {
        /** Is the account an admin */
        admin: "admin",
        /** The unique account id */
        id: "id",
        /** The unique account name */
        name: "name",
        /** The password hash */
        passwordHash: "password_hash",
        /** The salt that is used next to the password for the password hash */
        passwordSalt: "password_salt",
        /** Is the account public */
        public: "public"
    },
    /** SQlite table name for accounts */
    name: "account"
} as const;


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    /** ID of account that should be checked for existence */
    id: number
}
export interface ExistsNameInput {
    /** Name of account that should be checked for existence */
    name: string
}

/**
 * Check if account exists given an account name.
 *
 * @param databasePath Path to database
 * @param input Info necessary to check it
 */
export const existsName = async (databasePath: string, input: ExistsNameInput): Promise<boolean> => {
    try {
        const runResultExists = await database.requests.getEach<database.queries.ExistsDbOut>(
            databasePath,
            database.queries.exists(table.name, table.column.name),
            [input.name]
        );
        if (runResultExists) {
            return runResultExists.exists_value === 1;
        }
    } catch (error) {
        return false;
    }
    return false;
};

/**
 * Check if account exists given its id.
 *
 * @param databasePath Path to database
 * @param input Info necessary to check it
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    try {
        const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
            databasePath,
            database.queries.exists(table.name, table.column.id),
            [input.id]
        );
        if (runResult) {
            return runResult.exists_value === 1;
        }
    } catch (error) {
        return false;
    }
    return false;
};


// Is XYZ (silent errors)
// -----------------------------------------------------------------------------

export interface IsAdminGetDbOut {
    admin: 1|0
}

/**
 * Get if a given account is an admin account.
 *
 * @param databasePath Path to database
 * @param accountId Account id to be checked
 */
export const isAdmin = async (databasePath: string, accountId: number|undefined): Promise<boolean> => {
    if (accountId) {
        try {
            const runResult = await database.requests.getEach<IsAdminGetDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.admin],
                    { whereColumn: table.column.id }
                ),
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

export interface IsPublicGetDbOut {
    public: 1|0
}

/**
 * Get if a given account is a public account.
 *
 * @param databasePath Path to database
 * @param accountId Account id to be checked
 */
export const isPublic = async (databasePath: string, accountId: number|undefined): Promise<boolean> => {
    if (accountId) {
        try {
            const runResult = await database.requests.getEach<IsPublicGetDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.public],
                    { whereColumn: table.column.id }
                ),
                [accountId]
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


// Checker (throw errors and have no return value)
// -----------------------------------------------------------------------------

/**
 * @throws When account does not exist
 * @param databasePath Path to database
 * @param accountId Account id to check if existing
 */
export const checkIfAccountExists = async (databasePath: string, accountId: number|undefined): Promise<void> => {
    if (accountId) {
        if (!await exists(databasePath, { id: accountId })) {
            throw Error(GeneralError.NOT_EXISTING);
        }
    } else {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

/**
 * @throws When account does not exist
 * @param databasePath Path to database
 * @param accountName Account name to check if existing
 */
export const checkIfAccountExistsName = async (databasePath: string, accountName: string|undefined): Promise<void> => {
    if (accountName) {
        if (!await existsName(databasePath, { name: accountName })) {
            throw Error(GeneralError.NOT_EXISTING);
        }
    } else {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

/**
 * Check a given account has the rights to get basic information about a given account.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests to get basic information
 * @param accessAccountId Id of account that is requested to be get
 */
export const checkIfAccountHasAccessToGetAccountInfo = async (
    databasePath: string, requesterAccountId: number|undefined, accessAccountId: number
): Promise<void> => {
    // No problem if:
    // 1) The account ids match (same account)
    // 2) The requested account is public
    // 3) The requester account is a friend of the account to be get
    // 4) The account that requests basic information is admin
    if (requesterAccountId !== accessAccountId && !(
        await isPublic(databasePath, requesterAccountId) ||
        await accountFriends.existsAccountIds(databasePath, accessAccountId, requesterAccountId) ||
        await isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

/**
 * Check a given account has the rights to update a given account.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests an update
 * @param accessAccountId Id of account that is requested to be updated
 */
export const checkIfAccountHasAccessToUpdateAccount = async (
    databasePath: string, requesterAccountId: number, accessAccountId: number
): Promise<void> => {
    // No problem if:
    // 1) The account ids match (same account)
    // 2) The account that requests change is admin
    if (requesterAccountId !== accessAccountId && !(await isAdmin(databasePath, requesterAccountId))) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

/**
 * Check a given account has the rights to remove a given account.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests an removal
 * @param accessAccountId Id of account that is requested to be removed
 */
export const checkIfAccountHasAccessToRemoveAccount = async (
    databasePath: string, requesterAccountId: number, accessAccountId: number
): Promise<void> => {
    // No problem if:
    // 1) The account ids match (same account)
    // 2) The account that requests change is admin
    if (requesterAccountId !== accessAccountId && !(await isAdmin(databasePath, requesterAccountId))) {
        throw Error(GeneralError.NO_ACCESS);
    }
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
    // Special validations for account creation
    if (await existsName(databasePath, { name: input.name })) {
        throw Error(CreateError.USER_NAME_ALREADY_EXISTS);
    }
    if (!createInfoUsername.regex.test(input.name)) {
        throw Error(CreateError.USER_NAME_INVALID_FORMAT);
    }
    if (!createInfoPassword.regex.test(input.password)) {
        throw Error(CreateError.PASSWORD_INVALID_FORMAT);
    }

    const hashAndSalt = crypto.generateHashAndSalt(input.password);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(table.name, [
            table.column.name, table.column.passwordHash, table.column.passwordSalt,
            table.column.admin, table.column.public
        ]),
        [
            input.name, hashAndSalt.hash, hashAndSalt.salt,
            input.admin === true ? 1 : 0, input.public === true ? 1 : 0
        ]
    );
    return postResult.lastID;
};


// Remove
// -----------------------------------------------------------------------------

export interface RemoveInput {
    /** ID of account that should be removed */
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
    await checkIfAccountHasAccessToRemoveAccount(databasePath, accountId, input.id);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
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
    passwordHash: string
    passwordSalt: string
}

/**
 * Check if account login is correct.
 *
 * @param databasePath Path to database
 * @param input Account login info
 * @throws When not able to check login of account or database fails
 * @returns If password is correct the account id is returned
 */
export const checkLogin = async (databasePath: string, input: CheckLoginInput): Promise<number|void> => {
    await checkIfAccountExistsName(databasePath, input.name);

    const runResult = await database.requests.getEach<CheckLoginDbOut>(
        databasePath,
        database.queries.select(table.name,
            [
                table.column.id,
                { alias: "passwordHash", columnName: table.column.passwordHash },
                { alias: "passwordSalt", columnName: table.column.passwordSalt }
            ],
            { whereColumn: table.column.name }
        ),
        [input.name]
    );
    if (runResult) {
        const passwordCorrect = crypto.checkPassword(input.password, {
            hash: runResult.passwordHash,
            salt: runResult.passwordSalt
        });
        if (passwordCorrect) {
            return runResult.id;
        }
    }
};

export interface CheckLoginIdInput {
    id: number
    password: string
}
export interface CheckLoginIdDbOut {
    passwordHash: string
    passwordSalt: string
}

export const checkLoginId = async (databasePath: string, input: CheckLoginIdInput): Promise<boolean> => {
    try {
        await checkIfAccountExists(databasePath, input.id);

        const runResult = await database.requests.getEach<CheckLoginIdDbOut>(
            databasePath,
            database.queries.select(table.name,
                [
                    { alias: "passwordHash", columnName: table.column.passwordHash },
                    { alias: "passwordSalt", columnName: table.column.passwordSalt }
                ],
                { whereColumn: table.column.id }
            ),
            [input.id]
        );
        if (runResult) {
            const passwordCorrect = crypto.checkPassword(input.password, {
                hash: runResult.passwordHash,
                salt: runResult.passwordSalt
            });
            return passwordCorrect;
        }
    } catch (error) {
        return false;
    }
    return false;
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
    admin: 1|0
    name: string
    public: 1|0
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
    await checkIfAccountHasAccessToGetAccountInfo(databasePath, accountId, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(table.name, [
            table.column.name, table.column.admin, table.column.public
        ], {
            whereColumn: table.column.id
        }),
        [input.id]
    );
    if (runResult) {
        return {
            admin: runResult.admin === 1,
            id: input.id,
            name: runResult.name,
            public: runResult.public === 1
        };
    }
};

export interface GetNameInput {
    name: string
}
export interface GetNameOutput {
    admin: boolean
    id: number
    name: string
    public: boolean
}
export interface GetNameDbOut {
    admin: 1|0
    id: number
    public: 1|0
}


/**
 * Get account given its name.
 *
 * @param databasePath Path to database
 * @param accountId ID of account that wants to do this action
 * @param input Account get info
 * @throws When not able to get account or database fails
 */
export const getName = async (
    databasePath: string, accountId: number|undefined, input: GetNameInput
): Promise<void|GetNameOutput> => {
    await checkIfAccountExistsName(databasePath, input.name);

    const runResult = await database.requests.getEach<GetNameDbOut>(
        databasePath,
        database.queries.select(table.name, [
            table.column.id, table.column.admin, table.column.public
        ], {
            whereColumn: table.column.name
        }),
        [input.name]
    );
    if (runResult) {
        await checkIfAccountHasAccessToGetAccountInfo(databasePath, accountId, runResult.id);

        return {
            admin: runResult.admin === 1,
            id: runResult.id,
            name: input.name,
            public: runResult.public === 1
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
    await checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, input.id);

    const columns = [];
    const values = [];
    if (input.public !== undefined) {
        columns.push(table.column.public);
        values.push(input.public ? 1 : 0);
    }
    if (input.password) {
        const hashAndSalt = crypto.generateHashAndSalt(input.password);
        columns.push(table.column.passwordHash, table.column.passwordSalt);
        values.push(hashAndSalt.hash, hashAndSalt.salt);
    }
    if (input.name) {
        columns.push(table.column.name);
        values.push(input.name);
    }
    if (input.admin !== undefined) {
        console.warn("Account admin status was updated", input.admin);
        columns.push(table.column.admin);
        values.push(input.admin ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.update(table.name, columns, table.column.id),
        values
    );
    return postResult.changes > 0;
};
