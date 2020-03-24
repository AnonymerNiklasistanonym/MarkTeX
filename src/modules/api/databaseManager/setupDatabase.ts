import * as database from "../../database";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupTables = async (databasePath: string): Promise<void> => {
    // Account table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("account", [{
            name: "id",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { unique: true, primaryKey: true, notNull: true }
        }, {
            name: "name",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "password_hash",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "password_salt",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "admin",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { notNull: true }
        }], true));
    // Group table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document_group", [{
            name: "id",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { unique: true, primaryKey: true, notNull: true }
        }, {
            name: "name",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "owner",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { notNull: true },
            foreign: {
                tableName: "account",
                column: "id"
            }
        }], true));
    // Document table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document", [{
            name: "id",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { unique: true, primaryKey: true, notNull: true }
        }, {
            name: "title",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "authors",
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "date",
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "owner",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { notNull: true },
            foreign: {
                tableName: "account",
                column: "id",
                options: [ "ON DELETE CASCADE ON UPDATE NO ACTION" ]
            }
        }, {
            name: "document_group",
            type: database.queries.CreateTableColumnType.INTEGER,
            foreign: {
                tableName: "document_group",
                column: "id"
            }
        }], true));
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupInitialData = async (databasePath: string): Promise<void> => {
    // Add initial account
    await database.requests.postRequest(
        databasePath,
        database.queries.insert("account", ["name", "password_hash", "password_salt", "admin"]),
        [ "Admin", "123", "1234", "1" ]);
    // Add test account
    await database.requests.postRequest(
        databasePath,
        database.queries.insert("account", ["name", "password_hash", "password_salt", "admin"]),
        [ "Test", "456", "789", "0" ]);
};
