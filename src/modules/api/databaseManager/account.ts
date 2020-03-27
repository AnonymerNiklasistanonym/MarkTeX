import * as database from "../../database";
import crypto from "../../crypto";

export interface CreateInput {
    name: string
    password: string
    admin?: boolean
}

/**
 * Create account.
 *
 * @param databasePath Path to database.
 * @param input Account info.
 * @returns Unique id of account.
 */
export const create = async (databasePath: string, input: CreateInput): Promise<number> => {
    const columns = [ "name", "password_hash", "password_salt", "admin" ];
    const hashAndSalt = crypto.generateHashAndSalt(input.password);
    const values: (string|number)[] = [ input.name, hashAndSalt.hash, hashAndSalt.salt, input.admin ? 1 : 0 ];
    const postResult = await database.requests.postRequest(
        databasePath,
        database.queries.insert("account", columns),
        values
    );
    return postResult.lastID;
};


export interface RemoveInput {
    name: string
}

/**
 * Remove account.
 *
 * @param databasePath Path to database.
 * @param input Remove info.
 */
export const remove = async (databasePath: string, input: RemoveInput): Promise<void> => {
    await database.requests.postRequest(
        databasePath,
        database.queries.remove("account", "name"),
        [input.name]
    );
};

export interface ExistsInput {
    name: string
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Check if account exists.
 *
 * @param databasePath Path to database.
 * @param input Account exists info.
 * @returns True if account exists.
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.exists("account", "name"),
        [input.name]
    ) as ExistsDbOut;
    return runResult.exists_value === 1;
};

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
 * @param databasePath Path to database.
 * @param input Account login info.
 * @returns If password is correct the account id is returned.
 */
export const checkLogin = async (databasePath: string, input: CheckLoginInput): Promise<(number|void)> => {
    const runResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.select("account", [ "id", "password_hash", "password_salt" ], {
            whereColumn: "name"
        }),
        [input.name]
    ) as CheckLoginDbOut;
    if (runResult) {
        const passwordCorrect = crypto.checkPassword(input.password, {
            hash: runResult.password_hash,
            salt: runResult.password_salt
        });
        return passwordCorrect ? runResult.id : undefined;
    } else {
        return undefined;
    }
};

export interface GetInput {
    id: number
}
export interface GetOutput {
    id: number
    name: string
    isAdmin: boolean
}
export interface GetDbOut {
    name: string
    admin: number
}

/**
 * Get account.
 *
 * @param databasePath Path to database.
 * @param input Account get info.
 */
export const get = async (databasePath: string, input: GetInput): Promise<(GetOutput|void)> => {
    const runResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.select("account", [ "name", "admin" ], {
            whereColumn: "id"
        }),
        [input.id]
    ) as GetDbOut;
    if (runResult) {
        return {
            id: input.id,
            isAdmin: runResult.admin === 1,
            name: runResult.name
        };
    }
};
