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
const groupAccessColumnWriteAccess = "write_access";


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
export interface ExistsAccountAndGroupDbOutput {
    // eslint-disable-next-line camelcase
    document_group_id: number
    // eslint-disable-next-line camelcase
    write_access: number
}

export const exists = async (databasePath: string, input: ExistsInput): Promise<boolean> => {
    const runResult = await database.requests.getEach<database.queries.ExistsDbOut>(
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
                [ "id", groupAccessColumnGroupId, groupAccessColumnWriteAccess ],
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
    write_access: 1|0
}

export const get = async (
    databasePath: string, accountId: number|undefined, input: GetInput
): Promise<void|GetOutput> => {
    await checkIfGroupAccessExists(databasePath, input.id);

    const runResult = await database.requests.getEach<GetDbOut>(
        databasePath,
        database.queries.select(groupAccessTableName,
            [ groupAccessColumnAccountId, groupAccessColumnGroupId, groupAccessColumnWriteAccess ],
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

export interface GetAllGroupMembersInput {
    id: number
    getNames?: boolean
}
export interface GetAllGroupMembersOutput {
    accountId: number
    accountName?: string
    groupId: number
    id: number
    writeAccess: boolean
}
export interface GetAllGroupMembersDbOut {
    accountId: number
    accountName?: string
    groupId: number
    id: number
    writeAccess: 1|0
}

export const getAllGroupMembers = async (
    databasePath: string, accountId: number|undefined, input: GetAllGroupMembersInput
): Promise<GetAllGroupMembersOutput[]> => {
    await group.checkIfGroupExists(databasePath, input.id);

    const columns: (database.queries.SelectColumn|string)[] = [
        groupAccessColumnId,
        { alias: "accountId", columnName: groupAccessColumnAccountId, tableName: groupAccessTableName },
        { alias: "groupId", columnName: groupAccessColumnGroupId, tableName: groupAccessTableName },
        { alias: "writeAccess", columnName: groupAccessColumnWriteAccess, tableName: groupAccessTableName }
    ];
    if (input.getNames) {
        columns.push({
            alias: "accountName",
            columnName: account.accountColumnName,
            tableName: account.accountTableName
        });
    }

    const innerJoins: database.queries.SelectQueryInnerJoin[] = [];
    if (input.getNames) {
        innerJoins.push({
            otherColumn: account.accountColumnId,
            otherTableName: account.accountTableName,
            thisColumn: groupAccessColumnAccountId
        });
    }

    const groupMembers = await database.requests.getAll<GetAllGroupMembersDbOut>(
        databasePath,
        database.queries.select(groupAccessTableName,
            columns,
            { innerJoins, whereColumn: groupAccessColumnId }
        ),
        [input.id]
    );
    const finalMembers: GetAllGroupMembersOutput[] = [];
    for (const groupMember of groupMembers) {
        // TODO Check each member for access
        finalMembers.push({
            accountId: groupMember.accountId,
            accountName: groupMember.accountName,
            groupId: groupMember.groupId,
            id: groupMember.id,
            writeAccess: groupMember.writeAccess === 1
        });
    }
    return finalMembers;
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
