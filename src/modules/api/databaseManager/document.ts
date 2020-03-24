import * as database from "../../database";

export interface CreateInputResource {
    relativePath: string
    content: string | Buffer
}

export interface CreateInput {
    title: string
    content: string
    authors?: string
    date?: string
    resources?: CreateInputResource[]
}

/**
 * Create document.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document info.
 * @returns Unique id of document.
 */
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    const columns = [ "title", "content", "owner" ];
    const values = [ input.title, input.content, accountId ];
    if (input.authors) {
        columns.push("authors");
        values.push(input.authors);
    }
    if (input.date) {
        columns.push("date");
        values.push(input.date);
    }
    if (input.resources) {
        // TODO
    }
    const postResult = await database.requests.postRequest(
        databasePath,
        database.queries.insert("document", columns),
        values
    );
    return postResult.lastID;
};
