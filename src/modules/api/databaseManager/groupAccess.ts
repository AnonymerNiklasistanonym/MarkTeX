import * as account from "./account";
import * as database from "../../database";
import * as group from "./group";


export enum GeneralError {
    NO_ACCESS = "GROUP_ACCESS_NO_ACCESS",
    NOT_EXISTING = "GROUP_ACCESS_NOT_EXISTING"
}

const groupAccessTableName = "document_group_access";
const groupAccessColumnId = "id";
const groupAccessColumnAccountId = "account_id";
const groupAccessColumnGroupId = "group_id";
const groupAccessWriteAccess = "write_access";


export interface CreateInput {
    accountId: number
    groupId: number
}

export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    await account.checkIfAccountExists(databasePath, input.accountId);
    await group.checkIfGroupExists(databasePath, input.groupId);
    await account.checkIfAccountHasAccessToAccount(databasePath, accountId, input.accountId);

    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert(groupAccessTableName, [ groupAccessColumnAccountId, groupAccessColumnGroupId ]),
        [ input.accountId, input.groupId ]
    );
    return postResult.lastID;
};


// Exists
// -----------------------------------------------------------------------------

export interface ExistsInput {
    id: number
}
export interface ExistsAccountAndGroupInput {
    accountId: number
    groupId: number
    writeAccess?: boolean
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}
export interface ExistsAccountAndGroupDbOutput {
    // eslint-disable-next-line camelcase
    document_group_id: number
    // eslint-disable-next-line camelcase
    write_access: number
}

export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<ExistsDbOut>(
        databasePath,
        database.queries.exists(groupAccessTableName, groupAccessColumnId),
        [input.id]
    );
    if (runResult) {
        return runResult.exists_value === 1;
    }
    return false;
};

export const existsAccountAndGroup = async (
    databasePath: string, input: ExistsAccountAndGroupInput
): Promise<boolean> => {
    try {
        const runResults = await database.requests.getAll<ExistsAccountAndGroupDbOutput>(
            databasePath,
            database.queries.select(
                groupAccessTableName,
                [ "id", groupAccessColumnGroupId, groupAccessWriteAccess ],
                { whereColumn: groupAccessColumnAccountId }
            ),
            [input.accountId]
        );
        for (const groupAccessEntry of runResults) {
            if (
                groupAccessEntry.document_group_id === input.groupId
                && (input.writeAccess === undefined || (groupAccessEntry.write_access === 1) === input.writeAccess)
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

export const checkIfGroupAccessExists = async (databasePath: string, documentAccessId: number): Promise<void> => {
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
    groupId: number
    id: number
    writeAccess: boolean
}
export interface GetDbOut {
    // eslint-disable-next-line camelcase
    account_Id: number
    // eslint-disable-next-line camelcase
    document_group_Id: number
    id: number
    // eslint-disable-next-line camelcase
    write_access: number
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfGroupAccessExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(groupAccessTableName,
            [ groupAccessColumnAccountId, groupAccessColumnGroupId, groupAccessWriteAccess ],
            { whereColumn: groupAccessColumnId }
        ),
        [input.id]
    );
    if (runResult) {

        await account.checkIfAccountHasAccessToAccountOrIsFriend(
            databasePath, accountId, runResult.account_Id
        );

        return {
            accountId: runResult.account_Id,
            groupId: runResult.document_group_Id,
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
    await checkIfGroupAccessExists(databasePath, input.id);
    const documentAccessInfo = await get(databasePath, accountId, { id: input.id });
    if (documentAccessInfo) {
        await account.checkIfAccountHasAccessToAccount(databasePath, accountId, documentAccessInfo.accountId);
    } else {
        throw Error(GeneralError.NO_ACCESS);
    }

    const postResult = await database.requests.post(
        databasePath,
        database.queries.remove(groupAccessTableName, groupAccessColumnId),
        [input.id]
    );
    return postResult.changes > 0;
};
