import * as account from "./account";
import * as database from "../../database";
import * as documentAccess from "./documentAccess";
import * as pdfOptions from "./documentPdfOptions";


export enum GeneralError {
    NO_ACCESS = "DOCUMENT_NO_ACCESS",
    NOT_EXISTING = "DOCUMENT_NOT_EXISTING"
}


export interface CreateInputResource {
    relativePath: string
    content: string | Buffer
}
export interface CreateInput {
    owner: number
    title: string
    content: string
    authors?: string
    date?: string
    pdfOptions?: pdfOptions.PdfOptions
    resources?: CreateInputResource[]
    public?: boolean
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
    await account.checkIfAccountExists(databasePath, input.owner);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.owner);

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
        // TODO Implement input.resources
        throw Error("input.resources is not yet implemented");
    }
    if (input.pdfOptions) {
        columns.push("pdf_options");
        values.push(JSON.stringify(input.pdfOptions));
    }
    columns.push("public");
    values.push(input.public === true ? 1 : 0);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert("document", columns),
        values
    );
    return postResult.lastID;
};


// Exists
// -----------------------------------------------------------------------------

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
 * @param input Document info.
 * @returns True if exists otherwise False.
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsDbOut>(
        databasePath,
        database.queries.exists("document", "id"),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfDocumentExists = async (databasePath: string, documentId: number): Promise<void> => {
    if (!await exists(databasePath, { id: documentId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
    getContent?: boolean
    getPdfOptions?: boolean
}
export interface GetOutput {
    id: number
    title: string
    public: boolean
    authors?: string
    date?: string
    owner: number
    group?: number
    content: string
    pdfOptions?: pdfOptions.PdfOptions
}
export interface GetDbOut {
    title: string
    authors: string
    public: number
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
// eslint-disable-next-line complexity
export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfDocumentExists(databasePath, input.id);

    const columns = [ "title", "authors", "date", "owner", "public" ];
    if (input.getContent) {
        columns.push("content");
    }
    if (input.getPdfOptions) {
        columns.push("pdf_options");
    }
    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "id"
        }),
        [input.id]
    );
    if (runResult) {
        const isPublic = runResult.public === 1;

        await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublicOrOther(
            databasePath, accountId, runResult.owner, () => isPublic,
            async () => {
                if (accountId) {
                    return await documentAccess.existsAccountAndDocument(databasePath, {
                        accountId, documentId: input.id
                    });
                }
                return false;
            }
        );

        let pdfOptionsObj;
        if (runResult.pdf_options && runResult.pdf_options !== null) {
            pdfOptionsObj = JSON.parse(runResult.pdf_options);
        }
        return {
            authors: runResult.authors !== null ? runResult.authors : undefined,
            content: runResult.content,
            date: runResult.date !== null ? runResult.date : undefined,
            group: runResult.document_group !== null ? runResult.document_group : undefined,
            id: input.id,
            owner: runResult.owner,
            pdfOptions: pdfOptionsObj,
            public: isPublic,
            title: runResult.title
        };
    }
};

export interface UpdateInput {
    id: number
    title?: string
    content?: string
    authors?: string
    date?: string
    pdfOptions?: pdfOptions.PdfOptions
    resources?: CreateInputResource[]
    public?: boolean
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
export const update = async (databasePath: string, accountId: number, input: UpdateInput): Promise<boolean> => {
    await checkIfDocumentExists(databasePath, input.id);
    const documentInfo = await get(databasePath, accountId, { id: input.id });
    if (documentInfo) {
        await account.checkIfAccountHasAccessToAccountOrOther(
            databasePath, accountId, documentInfo.owner,
            () => documentAccess.existsAccountAndDocument(databasePath, {
                accountId, documentId: documentInfo.id, writeAccess: true
            })
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

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
        // TODO Implement input.resources
        throw Error("input.resources is not yet implemented");
    }
    if (input.pdfOptions) {
        columns.push("pdf_options");
        values.push(JSON.stringify(input.pdfOptions));
    }
    if (input.public !== undefined) {
        columns.push("public");
        values.push(input.public === true ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
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
export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfDocumentExists(databasePath, input.id);
    const documentInfo = await get(databasePath, accountId, { id: input.id });
    if (documentInfo) {
        await account.checkIfAccountHasAccessToAccountOrIsFriendOrAccessIsPublic(
            databasePath, accountId, documentInfo.owner, () => documentInfo.public
        );
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove("document", "id"),
        [input.id]
    );
    return postResult.changes > 0;
};

export interface GetAllInput {
    id: number
    getContents?: boolean
}
export interface GetAllOutput {
    id: number
    title: string
    public: boolean
    authors?: string
    date?: string
    owner: number
    group?: number
    content?: string
}
export interface GetAllFromOwnerDbOut {
    id: number
    title: string
    public: number
    authors?: string
    date?: string
    // eslint-disable-next-line camelcase
    document_group: number
    content?: string
}
export interface GetAllFromGroupDbOut {
    id: number
    public: number
    title: string
    authors?: string
    date?: string
    owner: number
    content?: string
}

/**
 * Get all documents from one author.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const getAllFromOwner = async (
    databasePath: string, accountId: number|undefined, input: GetAllInput
): Promise<GetAllOutput[]> => {
    await account.checkIfAccountExists(databasePath, input.id);

    const columns = [ "id", "title", "authors", "date", "document_group", "public" ];
    if (input.getContents) {
        columns.push("content");
    }
    const runResults = await database.requests.getAll<GetAllFromOwnerDbOut>(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "owner"
        }),
        [input.id]
    );
    const allDocuments = runResults.map(runResult => ({
        authors: runResult.authors !== null ? runResult.authors : undefined,
        content: runResult.content,
        date: runResult.date !== null ? runResult.date : undefined,
        group: runResult.document_group !== null ? runResult.document_group : undefined,
        id: runResult.id,
        owner: input.id,
        public: runResult.public === 1,
        title: runResult.title
    }));
    const finalDocuments: GetAllOutput[] = [];
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const document of allDocuments) {
        if (document.owner === accountId || document.public) {
            finalDocuments.push(document);
            continue;
        }

        if (accountId) {
            const accountHasAccess = await documentAccess.existsAccountAndDocument(databasePath, {
                accountId, documentId: document.id
            });
            if (accountHasAccess || accountIsAdmin) {
                finalDocuments.push(document);
            }
        }
    }
    return finalDocuments;
};

/**
 * Get all documents from one author.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const getAllFromGroup = async (
    databasePath: string, accountId: number|undefined, input: GetAllInput
): Promise<GetAllOutput[]> => {
    const columns = [ "id", "title", "authors", "date", "owner", "public" ];
    if (input.getContents) {
        columns.push("content");
    }
    const runResults = await database.requests.getAll<GetAllFromGroupDbOut>(
        databasePath,
        database.queries.select("document", columns, {
            whereColumn: "document_group"
        }),
        [input.id]
    );
    const allDocuments = runResults.map(runResult => ({
        authors: runResult.authors !== null ? runResult.authors : undefined,
        content: runResult.content,
        date: runResult.date !== null ? runResult.date : undefined,
        group: input.id,
        id: runResult.id,
        owner: runResult.id,
        public: runResult.public === 1,
        title: runResult.title
    }));
    const finalDocuments: GetAllOutput[] = [];
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const document of allDocuments) {
        if (document.owner === accountId || document.public) {
            finalDocuments.push(document);
            continue;
        }

        if (accountId) {
            const accountHasAccess = await documentAccess.existsAccountAndDocument(databasePath, {
                accountId, documentId: document.id
            });
            if (accountHasAccess || accountIsAdmin) {
                finalDocuments.push(document);
            }
        }
    }
    return finalDocuments;
};
