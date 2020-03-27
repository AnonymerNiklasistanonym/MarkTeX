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

/**
 * Update document.
 *
 * @param databasePath Path to database.
 */
export const update = (databasePath: string): void => {
    // TODO
};

/**
 * Remove document.
 *
 * @param databasePath Path to database.
 */
export const remove = (databasePath: string): void => {
    // TODO
};


export interface GetInput {
    id: number
    getContent?: boolean
}
export interface GetOutput {
    id: number
    title: string
    authors: string
    date: string
    owner: number
    group: number
    content?: string
}
export interface GetDbOut {
    title: string
    authors: string
    date: string
    owner: number
    // eslint-disable-next-line camelcase
    document_group: number
    content?: string
}

/**
 * Get document.
 *
 * @param databasePath Path to database.
 * @param input Document get info.
 */
export const get = async (databasePath: string, input: GetInput): Promise<(GetOutput|void)> => {
    const columns = [ "title", "authors", "date", "owner" ];
    if (input.getContent) {
        columns.push("content");
    }
    const runResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "id"
        }),
        [input.id]
    ) as GetDbOut;
    if (runResult) {
        return {
            authors: runResult.authors,
            content: runResult.content,
            date: runResult.date,
            group: runResult.document_group,
            id: input.id,
            owner: runResult.owner,
            title: runResult.title
        };
    }
};

export interface GetAllInput {
    id: number
    getContents?: boolean
}
export interface GetAllOutput {
    id: number
    title: string
    authors: string
    date: string
    owner: number
    group: number
    content?: string
}
export interface GetAllDbOut {
    title: string
    authors: string
    date: string
    owner: number
    // eslint-disable-next-line camelcase
    document_group: number
    content?: string
}

/**
 * Get all documents from one author.
 *
 * @param databasePath Path to database.
 * @param input Document get info.
 */
export const getAllFromAuthor = async (databasePath: string, input: GetInput): Promise<(GetOutput[]|void)> => {
    const columns = [ "title", "authors", "date", "owner", "document_group" ];
    if (input.getContent) {
        columns.push("content");
    }
    const runResults = await database.requests.getAllRequest(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "owner"
        }),
        [input.id]
    ) as GetAllDbOut[];
    if (runResults) {
        return runResults.map(runResult => ({
            authors: runResult.authors,
            content: runResult.content,
            date: runResult.date,
            group: runResult.document_group,
            id: input.id,
            owner: runResult.owner,
            title: runResult.title
        }));
    }
};

/**
 * Get all documents from one author.
 *
 * @param databasePath Path to database.
 * @param input Document get info.
 */
export const getAllFromGroup = async (databasePath: string, input: GetInput): Promise<(GetOutput[]|void)> => {
    const columns = [ "title", "authors", "date", "owner", "document_group" ];
    if (input.getContent) {
        columns.push("content");
    }
    const runResults = await database.requests.getAllRequest(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "document_group"
        }),
        [input.id]
    ) as GetDbOut[];
    if (runResults) {
        return runResults.map(runResult => ({
            authors: runResult.authors,
            content: runResult.content,
            date: runResult.date,
            group: runResult.document_group,
            id: input.id,
            owner: runResult.owner,
            title: runResult.title
        }));
    }
};
