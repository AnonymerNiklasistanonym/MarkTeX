import * as account from "./account";
import * as database from "../../database";
import * as document from "./document";


export enum GeneralError {
    NO_ACCESS = "DOCUMENT_ACCESS_NO_ACCESS",
    NOT_EXISTING = "DOCUMENT_ACCESS_NOT_EXISTING"
}


export interface CreateInput {
    accountId: number
    documentId: number
}

export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await document.checkIfDocumentExists(databasePath, input.documentId);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.accountId);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert("document_access", [ "account_id", "document_id" ]),
        [ input.accountId, input.documentId ]
    );
    return postResult.lastID;
};


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsAccountAndDocumentInput {
    accountId: number
    documentId: number
    writeAccess?: boolean
}
export interface ExistsAccountAndDocumentDbOutput {
    // eslint-disable-next-line camelcase
    account_id: number
    // eslint-disable-next-line camelcase
    document_id: number
    // eslint-disable-next-line camelcase
    write_access: number
}

export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
        databasePath,
        database.queries.exists("document_access", "id"),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};

export const existsAccountAndDocument = async (
    databasePath: string, input: ExistsAccountAndDocumentInput
): Promise<boolean> => {
    try {
        const runResults = await database.requests.getAll<ExistsAccountAndDocumentDbOutput>(
            databasePath,
            database.queries.select("document_access", [ "id", "account_id", "document_id", "write_access" ], {
                whereColumn: "account_id"
            }),
            [input.accountId]
        );
        for (const documentAccessEntry of runResults) {
            if (
                documentAccessEntry.account_id === input.accountId
                && documentAccessEntry.document_id === input.documentId
                && (input.writeAccess === undefined || (documentAccessEntry.write_access === 1) === input.writeAccess)
            ) {
                return true;
            }
        }
    } catch (error) {
        return false;
    }
    return false;
};


// Checker (internal)
// -----------------------------------------------------------------------------

export const checkIfDocumentAccessExists = async (databasePath: string, documentAccessId: number): Promise<void> => {
    if (!await exists(databasePath, { id: documentAccessId })) {
        throw Error(GeneralError.NOT_EXISTING);
    }
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
    // eslint-disable-next-line camelcase
    account_Id: number
    // eslint-disable-next-line camelcase
    document_Id: number
    id: number
    // eslint-disable-next-line camelcase
    write_access: number
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfDocumentAccessExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select("document_access", [ "account_id", "document_id", "write_access" ], {
            whereColumn: "id"
        }),
        [input.id]
    );
    if (runResult) {

        await account.checkIfAccountHasAccessToAccountOrIsFriend(
            databasePath, accountId, runResult.account_Id
        );

        return {
            accountId: runResult.account_Id,
            documentId: runResult.document_Id,
            id: runResult.id,
            writeAccess: runResult.write_access === 1
        };
    }
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
        await account.checkIfAccountHasAccessToAccount(databasePath, accountId, documentAccessInfo.accountId);
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
