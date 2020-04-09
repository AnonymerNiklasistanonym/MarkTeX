import * as account from "./account";
import * as database from "../../database";
import * as document from "./document";


/** Errors that can happen during a document access entry creation */
export enum CreateError {
    ALREADY_EXISTS = "DOCUMENT_ACCESS_ALREADY_EXISTS"
}

/** Errors that can happen during document access entry requests */
export enum GeneralError {
    NO_ACCESS = "DOCUMENT_ACCESS_NO_ACCESS",
    NOT_EXISTING = "DOCUMENT_ACCESS_NOT_EXISTING"
}

/** Information about the SQlite table for document access entries */
export const table = {
    /** SQlite column names for document access entries table */
    column: {
        /** Account id */
        accountId: "account_id",
        /** Document id */
        documentId: "document_id",
        /** The unique document access entry id */
        id: "id",
        /** Is the access read only or read-write */
        writeAccess: "write_access"
    },
    /** SQlite table name for document access entries */
    name: "document_access"
} as const;


// Exists
// -----------------------------------------------------------------------------

export interface ExistsAccountDocumentIdsDbOutput {
    accountId: number
    writeAccess: 1|0
}

export const exists = async (databasePath: string, documentAccessId: number): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
        databasePath,
        database.queries.exists(table.name, table.column.id),
        [documentAccessId]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};

export const existsAccountDocumentIds = async (
    databasePath: string, accountId: number|undefined, documentId: number, writeAccess = false
): Promise<boolean> => {
    if (accountId) {
        try {
            const runResults = await database.requests.getAll<ExistsAccountDocumentIdsDbOutput>(
                databasePath,
                database.queries.select(
                    table.name,
                    [{ alias: "accountId", columnName: table.column.accountId }],
                    { whereColumn: table.column.documentId }
                ),
                [documentId]
            );
            for (const documentAccessEntry of runResults) {
                if (documentAccessEntry.accountId === accountId) {
                    if (writeAccess && documentAccessEntry.writeAccess !== 1) {
                        return false;
                    }
                    return true;
                }
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};

// Is XYZ (silent errors)
// -----------------------------------------------------------------------------

export interface IsWriteAccessDbOut {
    writeAccess: 1|0
}

/**
 * Get if a given account is a public account.
 *
 * @param databasePath Path to database
 * @param documentId Document id to be checked
 */
export const isWriteAccess = async (databasePath: string, documentId: number|undefined): Promise<boolean> => {
    if (documentId) {
        try {
            const runResult = await database.requests.getEach<IsWriteAccessDbOut>(
                databasePath,
                database.queries.select(table.name,
                    [table.column.writeAccess],
                    { whereColumn: table.column.id }
                ),
                [documentId]
            );
            if (runResult) {
                return runResult.writeAccess === 1;
            }
        } catch (error) {
            return false;
        }
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfDocumentAccessExists = async (databasePath: string, documentAccessId: number): Promise<void> => {
    if (!await exists(databasePath, documentAccessId)) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};

export const checkIfDocumentAccessExistsAccountDocumentIds = async (
    databasePath: string, accountId: number, documentId: number
): Promise<void> => {
    if (!await existsAccountDocumentIds(databasePath, accountId, documentId)) {
        throw Error(GeneralError.NOT_EXISTING);
    }
};


// Add
// -----------------------------------------------------------------------------

export interface AddInput {
    accountId: number
    documentId: number
    writeAccess?: boolean
}

export const add = async (databasePath: string, accountId: number, input: AddInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await document.checkIfDocumentExists(databasePath, input.documentId);
    await document.checkIfAccountHasAccessToUpdateDocument(databasePath, accountId, input.documentId);

    if (await existsAccountDocumentIds(databasePath, input.accountId, input.documentId)) {
        throw Error(CreateError.ALREADY_EXISTS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(
            table.name,
            [ table.column.accountId, table.column.documentId, table.column.writeAccess ]
        ),
        [ input.accountId, input.documentId, input.writeAccess ? 1 : 0 ]
    );
    return postResult.lastID;
};

export interface AddNameInput {
    accountName: string
    documentId: number
    writeAccess?: boolean
}

export const addName = async (databasePath: string, accountId: number, input: AddNameInput): Promise<number> => {
    await account.checkIfAccountExistsName(databasePath, input.accountName);
    await document.checkIfDocumentExists(databasePath, input.documentId);

    const accountInfo = await account.getName(databasePath, accountId, { name: input.accountName });
    if (!(accountInfo)) {
        throw Error(account.GeneralError.NOT_EXISTING);
    }
    await document.checkIfAccountHasAccessToUpdateDocument(databasePath, accountId, input.documentId);

    if (await existsAccountDocumentIds(databasePath, accountInfo.id, input.documentId)) {
        throw Error(CreateError.ALREADY_EXISTS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(
            table.name,
            [ table.column.accountId, table.column.documentId, table.column.writeAccess ]
        ),
        [ accountInfo.id, input.documentId, input.writeAccess ? 1 : 0 ]
    );
    return postResult.lastID;
};


// Get
// -----------------------------------------------------------------------------

export interface GetInput {
    id: number
}
export interface GetOutput {
    accountId: number
    documentId: number
    writeAccess: boolean
    id: number
}
export interface GetDbOut {
    accountId: number
    documentId: number
    writeAccess: 1|0
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfDocumentAccessExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(
            table.name,
            [
                { alias: "accountId", columnName: table.column.accountId },
                { alias: "documentId", columnName: table.column.documentId },
                { alias: "writeAccess", columnName: table.column.writeAccess }
            ],
            { whereColumn: table.column.id }
        ),
        [input.id]
    );
    if (runResult) {
        await document.checkIfAccountHasAccessToGetDocumentInfo(databasePath, accountId, runResult.documentId);

        return {
            accountId: runResult.accountId,
            documentId: runResult.documentId,
            id: input.id,
            writeAccess: runResult.writeAccess === 1
        };
    }
};


// Update
// -----------------------------------------------------------------------------

export interface UpdateInput {
    id: number
    writeAccess?: boolean
}

export const update = async (databasePath: string, accountId: number, input: UpdateInput): Promise<boolean> => {
    await checkIfDocumentAccessExists(databasePath, input.id);
    const documentAccessInfo = await get(databasePath, accountId, { id: input.id });
    if (documentAccessInfo) {
        await document.checkIfAccountHasAccessToUpdateDocument(databasePath, accountId, documentAccessInfo.documentId);
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const columns = [];
    const values = [];
    if (input.writeAccess !== undefined) {
        columns.push(table.column.writeAccess);
        values.push(input.writeAccess ? 1 : 0);
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

export const remove = async (databasePath: string, accountId: number, input: RemoveInput): Promise<boolean> => {
    await checkIfDocumentAccessExists(databasePath, input.id);
    const documentAccessInfo = await get(databasePath, accountId, { id: input.id });
    if (documentAccessInfo) {
        await document.checkIfAccountHasAccessToUpdateDocument(databasePath, accountId, documentAccessInfo.documentId);
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(table.name, table.column.id),
        [input.id]
    );
    return postResult.changes > 0;
};
