import * as database from "../../database";

export interface CreateInput {
    name: string
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
    const columns = ["name", "owner"];
    const values = [ input.name, accountId ];
    const postResult = await database.requests.postRequest(
        databasePath,
        database.queries.insert("document_group", columns),
        values
    );
    return postResult.lastID;
};
