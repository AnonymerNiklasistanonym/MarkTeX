import * as database from "../../database";

export interface CreateInput {
    name: string
    public?: boolean
}

/**
 * Create group.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the group.
 * @param input Group info.
 * @returns Unique id of group.
 */
export const create = async (databasePath: string, accountId: number, input: CreateInput): Promise<number> => {
    const columns = [ "name", "owner" ];
    const values = [ input.name, accountId ];
    columns.push("public");
    values.push(input.public === true ? 1 : 0);
    const postResult = await database.requests.post(
        databasePath,
        database.queries.insert("document_group", columns),
        values
    );
    return postResult.lastID;
};

/**
 * Update group.
 *
 * @param databasePath Path to database.
 */
export const update = (databasePath: string): void => {
    // TODO
};

/**
 * Remove group.
 *
 * @param databasePath Path to database.
 */
export const remove = (databasePath: string): void => {
    // TODO
};

export interface GetInput {
    id: number
}
export interface GetOutput {
    id: number
    name: string
    owner: number
    public: boolean
}
export interface GetDbOut {
    name: string
    owner: number
    public: number
}
export interface GetAllFromOwnerDbOut {
    id: number
    name: string
    public: number
}

/**
 * Get group.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the group.
 * @param input Group get info.
 */
export const get = async (databasePath: string, accountId: number, input: GetInput): Promise<(GetOutput|void)> => {
    const runResult = await database.requests.getEach(
        databasePath,
        database.queries.select("document_group", [ "name", "owner", "public" ], {
            whereColumn: "id"
        }),
        [input.id]
    ) as GetDbOut;
    if (runResult) {
        return {
            id: input.id,
            name: runResult.name,
            owner: runResult.owner,
            public: runResult.public === 1
        };
    }
};

/**
 * Get all documents from one author.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of account that created the group.
 * @param input Document get info.
 */
export const getAllFromOwner = async (
    databasePath: string, accountId: number, input: GetInput
): Promise<(GetOutput[]|void)> => {
    const runResults = await database.requests.getAll(
        databasePath,
        database.queries.select("document_group", [ "id", "name" ], {
            whereColumn: "owner"
        }),
        [input.id]
    ) as GetAllFromOwnerDbOut[];
    if (runResults) {
        return runResults.map(runResult => ({
            id: runResult.id,
            name: runResult.name,
            owner: input.id,
            public: runResult.public === 1
        }));
    }
};

export interface ExistsInput {
    id: number
}
export interface ExistsDbOut {
    // eslint-disable-next-line camelcase
    exists_value: number
}

/**
 * Check if group exists.
 *
 * @param databasePath Path to database.
 * @param accountId Unique id of group.
 * @param input Account exists info.
 * @returns True if group exists.
 */
export const exists = async (
    databasePath: string, accountId: number, input: ExistsInput
): Promise<boolean> => {
    const runResult = await database.requests.getEach(
        databasePath,
        database.queries.exists("document_group", "id"),
        [input.id]
    ) as ExistsDbOut;
    return runResult.exists_value === 1;
};
