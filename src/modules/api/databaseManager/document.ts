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
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<(number|void)> => {
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

export interface UpdateInput {
    id: number
    title?: string
    content?: string
    authors?: string
    date?: string
    resources?: CreateInputResource[]
}

/**
 * Update document.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document info.
 * @returns True if at least one element was updated otherwise False.
 */
// eslint-disable-next-line complexity
export const update = async (databasePath: string, accountId: number, input: UpdateInput): Promise<(boolean|void)> => {
    const columns = [];
    const values = [];
    if (input.title) {
        columns.push("title");
        values.push(input.title);
    }
    if (input.content) {
        columns.push("content");
        values.push(input.content);
    }
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
    values.push(input.id);
    const postResult = await database.requests.postRequest(
        databasePath,
        database.queries.update("document", columns, "id"),
        values
    );
    return postResult.changes > 0;
};

export interface RemoveInput {
    id: number
}

/**
 * Remove document.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document info.
 * @returns True if at least one element was removed otherwise False.
 */
export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<(boolean|void)> => {
    const postResult = await database.requests.postRequest(
        databasePath,
        database.queries.remove("document", "id"),
        [input.id]
    );
    return postResult.changes > 0;
};

export interface ExistsInput {
    id: number
}

export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Does a document exist.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document info.
 * @returns True if exists otherwise False.
 */
export const exists = async (databasePath: string, accountId: number, input: ExistsInput): Promise<(boolean|void)> => {
    const postResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.exists("document", "id"),
        [input.id]
    ) as ExistsDbOut;
    return postResult.exists_value === 1;
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
