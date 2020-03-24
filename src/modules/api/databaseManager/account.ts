import * as database from "../../database";
import * as crypto from "../../crypto";

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
