import * as database from "../../database";


export interface CreateInputResource {
    relativePath: string
    content: string | Buffer
}

export interface PdfOptionsFooter {
    enabled?: string
    text?: string
}
export interface PdfOptionsHeader {
    enabled?: string
    text?: string
}
export enum PdfOptionsPaperSize {
    A4 = "A4"
}
export interface PdfOptionsTableOfContents {
    depth?: number
    enabled?: boolean
}

export interface PdfOptions {
    footer?: PdfOptionsFooter
    header?: PdfOptionsHeader
    pageNumbers?: boolean
    paperSize?: PdfOptionsPaperSize
    tableOfContents?: PdfOptionsTableOfContents
    useAuthors?: boolean
    useDate?: boolean
    useTitle?: boolean
}

export interface CreateInput {
    title: string
    content: string
    authors?: string
    date?: string
    pdfOptions?: PdfOptions
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
        // TODO Implement
    }
    if (input.pdfOptions) {
        // TODO Do better (SQL style with custom columns/tables, sanitize input)
        columns.push("pdf_options");
        values.push(JSON.stringify(input.pdfOptions));
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
    pdfOptions?: PdfOptions
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
    if (input.pdfOptions) {
        // TODO Do better (SQL style with custom columns/tables, sanitize input)
        columns.push("pdf_options");
        values.push(JSON.stringify(input.pdfOptions));
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
    getPdfOptions?: boolean
}
export interface GetOutput {
    id: number
    title: string
    authors?: string
    date?: string
    owner: number
    group?: number
    content: string
    pdfOptions?: PdfOptions
}
export interface GetDbOut {
    title: string
    authors: string
    date: string
    owner: number
    // eslint-disable-next-line camelcase
    document_group: number
    content: string
    // eslint-disable-next-line camelcase
    pdf_options: string
}

/**
 * Get document.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const get = async (databasePath: string, accountId: number, input: GetInput): Promise<(GetOutput|void)> => {
    const columns = [ "title", "authors", "date", "owner" ];
    if (input.getContent) {
        columns.push("content");
    }
    if (input.getPdfOptions) {
        columns.push("pdf_options");
    }
    const runResult = await database.requests.getEachRequest(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "id"
        }),
        [input.id]
    ) as GetDbOut;
    if (runResult) {
        let pdfOptions;
        if (runResult.pdf_options && runResult.pdf_options !== null) {
            pdfOptions = JSON.parse(runResult.pdf_options);
        }
        return {
            authors: runResult.authors !== null ? runResult.authors : undefined,
            content: runResult.content,
            date: runResult.date !== null ? runResult.date : undefined,
            group: runResult.document_group !== null ? runResult.document_group : undefined,
            id: input.id,
            owner: runResult.owner,
            pdfOptions,
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
    authors?: string
    date?: string
    owner: number
    group?: number
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
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const getAllFromAuthor = async (
    databasePath: string, accountId: number, input: GetAllInput
): Promise<(GetAllOutput[]|void)> => {
    const columns = [ "title", "authors", "date", "owner", "document_group" ];
    if (input.getContents) {
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
            authors: runResult.authors !== null ? runResult.authors : undefined,
            content: runResult.content,
            date: runResult.date !== null ? runResult.date : undefined,
            group: runResult.document_group !== null ? runResult.document_group : undefined,
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
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const getAllFromGroup = async (
    databasePath: string, accountId: number, input: GetAllInput
): Promise<(GetAllOutput[]|void)> => {
    const columns = [ "title", "authors", "date", "owner", "document_group" ];
    if (input.getContents) {
        columns.push("content");
    }
    const runResults = await database.requests.getAllRequest(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "document_group"
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
