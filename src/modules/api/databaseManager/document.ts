import * as account from "./account";
import * as database from "../../database";
import * as documentAccess from "./documentAccess";
import * as pdfOptions from "./documentPdfOptions";


/** Errors that can happen during a document creation */
export enum CreateError {}

/** Errors that can happen during document requests */
export enum GeneralError {
    NO_ACCESS = "DOCUMENT_NO_ACCESS",
    NOT_EXISTING = "DOCUMENT_NOT_EXISTING"
}

/** Information about the SQlite table for documents */
export const table = {
    /** SQlite column names for documents table */
    column: {
        /** String that contains the document authors */
        authors: "authors",
        /** String that contains the document content */
        content: "content",
        /** String that contains the document date */
        date: "date",
        /** The optional id of the group that this document belongs to */
        groupId: "document_group_id",
        /** The unique document id */
        id: "id",
        /** The account id of the document owner */
        owner: "owner",
        /** A string that contains the pdf options */
        pdfOptions: "pdf_options",
        /** Is the document public */
        public: "public",
        /** String that contains the document title */
        title: "title"
    },
    /** SQlite table name for documents */
    name: "document"
} as const;


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}

/**
 * Does a document exist.
 *
 * @param databasePath Path to database.
 * @param input Document info.
 * @returns True if exists otherwise False.
 */
export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
        databasePath,
        database.queries.exists(table.name, table.column.id),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};


// Is XYZ (silent errors)
// -----------------------------------------------------------------------------

export interface IsPublicGetDbOut {
    public: 1|0
}

/**
 * Get if a given document is a public document.
 *
 * @param databasePath Path to database
 * @param documentId Document id to be checked
 */
export const isPublic = async (databasePath: string, documentId: number|undefined): Promise<boolean> => {
    if (documentId) {
        try {
            const runResult = await database.requests.getEach<IsPublicGetDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.public],
                    { whereColumn: table.column.id }
                ),
                [documentId]
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

export interface GetDocumentOwnerDbOut {
    owner: number
}

/**
 * Get the owner account id of a document.
 *
 * @param databasePath Path to database
 * @param documentId Document id
 */
export const getDocumentOwner = async (
    databasePath: string, documentId: number|undefined
): Promise<number|undefined> => {
    if (documentId) {
        try {
            const runResult = await database.requests.getEach<GetDocumentOwnerDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.owner],
                    { whereColumn: table.column.id }
                ),
                [documentId]
            );
            if (runResult) {
                return runResult.owner;
            }
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
};


// Checker (throw errors and have no return value)
// -----------------------------------------------------------------------------

export const checkIfDocumentExists = async (databasePath: string, documentId: number): Promise<void> => {
    if (!await exists(databasePath, { id: documentId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

/**
 * Check a given account has the rights to get basic information about a given document.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests to get basic information
 * @param documentId Id of document that is requested to be get
 */
export const checkIfAccountHasAccessToGetDocumentInfo = async (
    databasePath: string, requesterAccountId: number|undefined, documentId: number
): Promise<void> => {
    const documentOwnerAccountId = await getDocumentOwner(databasePath, documentId);
    // No problem if:
    // 1) The account ids match (account is also owner of document)
    // 2) The requested document is public
    // 3) The requester account has access to the document to be get
    // 4) The account that requests basic information is admin
    if (requesterAccountId !== documentOwnerAccountId && !(
        await isPublic(databasePath, documentId) ||
        await documentAccess.existsAccountDocumentIds(databasePath, requesterAccountId, documentId) ||
        await account.isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

/**
 * Check a given account has the rights to update a given document.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests change
 * @param documentId Id of document that is requested to be changed
 */
export const checkIfAccountHasAccessToUpdateDocument = async (
    databasePath: string, requesterAccountId: number, documentId: number
): Promise<void> => {
    const documentOwnerAccountId = await getDocumentOwner(databasePath, documentId);
    // No problem if:
    // 1) The account ids match (account is also owner of document)
    // 2) The requester account has access to change the document
    // 3) The account that requests change is admin
    if (requesterAccountId !== documentOwnerAccountId && !(
        await documentAccess.existsAccountDocumentIds(databasePath, documentId, requesterAccountId, true) ||
        await account.isAdmin(databasePath, requesterAccountId)
    )) {
        throw Error(GeneralError.NO_ACCESS);
    }
};

/**
 * Check a given account has the rights to remove a given document.
 *
 * @throws When there is no access
 * @param databasePath Path to database
 * @param requesterAccountId Id of account that requests removal
 * @param documentId Id of document that is requested to be removed
 */
export const checkIfAccountHasAccessToRemoveDocument = async (
    databasePath: string, requesterAccountId: number, documentId: number
): Promise<void> => {
    const documentOwnerAccountId = await getDocumentOwner(databasePath, documentId);
    // No problem if:
    // 1) The account ids match (account is also owner of document)
    // 2) The account that requests change is admin
    if (requesterAccountId !== documentOwnerAccountId && !await account.isAdmin(databasePath, requesterAccountId)) {
        throw Error(GeneralError.NO_ACCESS);
    }
};


// Create
// -----------------------------------------------------------------------------

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
    await account.checkIfAccountHasAccessToUpdateAccount(databasePath, accountId, input.owner);

    const columns: string[] = [ table.column.title, table.column.content, table.column.owner ];
    const values = [ input.title, input.content, accountId ];
    if (input.authors) {
        columns.push(table.column.authors);
        values.push(input.authors);
    }
    if (input.date) {
        columns.push(table.column.date);
        values.push(input.date);
    }
    if (input.resources) {
        // TODO Implement input.resources
        throw Error("input.resources is not yet implemented");
    }
    if (input.pdfOptions) {
        columns.push(table.column.pdfOptions);
        values.push(JSON.stringify(input.pdfOptions));
    }
    columns.push(table.column.public);
    values.push(input.public === true ? 1 : 0);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(table.name, columns),
        values
    );
    return postResult.lastID;
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
    content?: string
    pdfOptions?: pdfOptions.PdfOptions
}
export interface GetDbOut {
    title: string
    authors: string|null
    public: 1|0
    date: string|null
    owner: number
    documentGroup: number|null
    content?: string
    pdfOptions?: string|null
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

    const columns: (string|database.queries.SelectColumn)[] = [
        table.column.title, table.column.authors, table.column.date, table.column.owner, table.column.public,
        { alias: "documentGroup", columnName: table.column.groupId }
    ];
    if (input.getContent) {
        columns.push(table.column.content);
    }
    if (input.getPdfOptions) {
        columns.push({ alias: "pdfOptions", columnName: table.column.pdfOptions });
    }
    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(table.name, columns, {
            whereColumn: table.column.id
        }),
        [input.id]
    );
    if (runResult) {
        await checkIfAccountHasAccessToGetDocumentInfo(databasePath, accountId, runResult.owner);

        let pdfOptionsObj;
        if (runResult.pdfOptions && runResult.pdfOptions !== null) {
            pdfOptionsObj = JSON.parse(runResult.pdfOptions);
        }
        return {
            authors: runResult.authors !== null ? runResult.authors : undefined,
            content: runResult.content,
            date: runResult.date !== null ? runResult.date : undefined,
            group: runResult.documentGroup !== null ? runResult.documentGroup : undefined,
            id: input.id,
            owner: runResult.owner,
            pdfOptions: pdfOptionsObj,
            public: runResult.public === 1,
            title: runResult.title
        };
    }
};

export interface GetAllInputGeneral {
    /** Get the contents of the document */
    getContents?: boolean
}
export interface GetAllFromGroupInput extends GetAllInputGeneral {
    /** Group id */
    id: number
}
export interface GetAllFromAccountInput extends GetAllInputGeneral  {
    /** Account id */
    id: number
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
export interface GetAllFromAccountDbOut {
    id: number
    title: string
    public: number
    authors?: string
    date?: string
    groupId: number
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
export const getAllFromAccount = async (
    databasePath: string, accountId: number|undefined, input: GetAllFromAccountInput
): Promise<GetAllOutput[]> => {
    await account.checkIfAccountExists(databasePath, input.id);

    const columns: (database.queries.SelectColumn|string)[] = [
        table.column.id, table.column.title, table.column.authors, table.column.date,
        { alias: "groupId", columnName: table.column.groupId }, table.column.public
    ];
    if (input.getContents) {
        columns.push(table.column.content);
    }
    const runResults = await database.requests.getAll<GetAllFromAccountDbOut>(
        databasePath,
        database.queries.select(table.name, columns, {
            whereColumn: table.column.owner
        }),
        [input.id]
    );
    const allDocuments: GetAllOutput[] = [];
    const accountIsDocumentOwner = input.id === accountId;
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const runResult of runResults) {
        // Only return the documents that the account that requested them has access to
        // This is the case if:
        // 1) The document owner account id is the same as the account id of the requester
        // 2) The document is public
        // 3) There exists a document access for the requester account
        // 4) The requester account is admin
        if (
            accountIsDocumentOwner || runResult.public || accountIsAdmin ||
            await documentAccess.existsAccountDocumentIds(databasePath, accountId, runResult.id)
        ) {
            allDocuments.push({
                authors: runResult.authors !== null ? runResult.authors : undefined,
                content: runResult.content,
                date: runResult.date !== null ? runResult.date : undefined,
                group: runResult.groupId !== null ? runResult.groupId : undefined,
                id: runResult.id,
                owner: input.id,
                public: runResult.public === 1,
                title: runResult.title
            });
        }
    }
    return allDocuments;
};

/**
 * Get all documents from one group.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the document.
 * @param input Document get info.
 */
export const getAllFromGroup = async (
    databasePath: string, accountId: number|undefined, input: GetAllFromGroupInput
): Promise<GetAllOutput[]> => {
    // await group.checkIfGroupExists(databasePath, input.id);

    const columns: (database.queries.SelectColumn|string)[] = [
        table.column.id, table.column.title, table.column.authors, table.column.date, table.column.owner,
        table.column.public
    ];
    if (input.getContents) {
        columns.push(table.column.content);
    }
    const runResults = await database.requests.getAll<GetAllFromGroupDbOut>(
        databasePath,
        database.queries.select(table.name, columns, {
            whereColumn: table.column.groupId
        }),
        [input.id]
    );
    const allDocuments: GetAllOutput[] = [];
    const accountIsDocumentOwner = input.id === accountId;
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    for (const runResult of runResults) {
        // Only return the documents that the account that requested them has access to
        // This is the case if:
        // 1) The document owner account id is the same as the account id of the requester
        // 2) The document is public
        // 3) There exists a document access for the requester account
        // 4) The requester account is admin
        if (
            accountIsDocumentOwner || runResult.public || accountIsAdmin ||
            await documentAccess.existsAccountDocumentIds(databasePath, accountId, runResult.id)
        ) {
            allDocuments.push({
                authors: runResult.authors !== null ? runResult.authors : undefined,
                content: runResult.content,
                date: runResult.date !== null ? runResult.date : undefined,
                group: input.id,
                id: runResult.id,
                owner: runResult.id,
                public: runResult.public === 1,
                title: runResult.title
            });
        }
    }
    return allDocuments;
};

export interface GetMembersInput {
    /** Document id */
    id: number
}
export interface GetMembersDbOut {
    accountId: number
    accountName: string
    writeAccess: 1|0
}
export interface GetMembersOutput {
    /** Account id */
    accountId: number
    /** Account name */
    accountName: string
    /** Write access */
    writeAccess: boolean
}

export const getMembers = async (
    databasePath: string, accountId: number|undefined, input: GetMembersInput
): Promise<GetMembersOutput[]> => {
    await checkIfDocumentExists(databasePath, input.id);

    const runResults = await database.requests.getAll<GetMembersDbOut>(
        databasePath,
        database.queries.select(documentAccess.table.name,
            [
                { alias: "accountId", columnName: account.table.column.id, tableName: account.table.name },
                { alias: "accountName", columnName: account.table.column.name, tableName: account.table.name },
                {
                    alias: "writeAccess",
                    columnName: documentAccess.table.column.writeAccess,
                    tableName: documentAccess.table.name
                }
            ], {
                innerJoins: [{
                    otherColumn: account.table.column.id,
                    otherTableName: account.table.name,
                    thisColumn: documentAccess.table.column.accountId
                }],
                whereColumn: { columnName: table.column.id, tableName: documentAccess.table.name }
            }
        ),
        [input.id]
    );
    const allMembers: GetMembersOutput[] = [];
    const accountIsDocumentOwner = input.id === accountId;
    const documentIsPublic = isPublic(databasePath, input.id);
    const accountIsAdmin = await account.isAdmin(databasePath, accountId);
    const accountHasDocumentAccess = await documentAccess.existsAccountDocumentIds(databasePath, accountId, input.id);
    for (const runResult of runResults) {
        // Only return the groups that the account that requested them has access to
        // This is the case if:
        // 1) The document owner account id is the same as the account id of the requester
        // 2) The document is public
        // 3) There exists a document access for the requester account
        // 4) The requester account is admin
        if (accountIsDocumentOwner || documentIsPublic || accountIsAdmin || accountHasDocumentAccess) {
            allMembers.push({
                accountId: runResult.accountId,
                accountName: runResult.accountName,
                writeAccess: runResult.writeAccess === 1
            });
        }
    }
    return allMembers;
};


// Update
// -----------------------------------------------------------------------------

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
    await checkIfAccountHasAccessToUpdateDocument(databasePath, accountId, input.id);

    const columns = [];
    const values = [];
    if (input.title) {
        columns.push(table.column.title);
        values.push(input.title);
    }
    if (input.content) {
        columns.push(table.column.content);
        values.push(input.content);
    }
    if (input.authors) {
        columns.push(table.column.authors);
        values.push(input.authors);
    }
    if (input.date) {
        columns.push(table.column.date);
        values.push(input.date);
    }
    if (input.resources) {
        // TODO Implement input.resources
        throw Error("input.resources is not yet implemented");
    }
    if (input.pdfOptions) {
        columns.push(table.column.pdfOptions);
        values.push(JSON.stringify(input.pdfOptions));
    }
    if (input.public !== undefined) {
        columns.push(table.column.public);
        values.push(input.public === true ? 1 : 0);
    }
    values.push(input.id);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.update(table.name, columns, table.column.id),
        values
    );
    return postResult.changes > 0;
};


// Remove
// -----------------------------------------------------------------------------

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
    await checkIfAccountHasAccessToRemoveDocument(databasePath, accountId, input.id);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
        [input.id]
    );
    return postResult.changes > 0;
};
