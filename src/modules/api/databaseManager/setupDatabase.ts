import * as database from "../../database";
import * as databaseManagerAccount from "./account";
import * as databaseManagerDocument from "./document";
import * as databaseManagerGroup from "./group";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupTables = async (databasePath: string): Promise<void> => {
    // Account table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("account", [ {
            name: "id",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { unique: true, primaryKey: true, notNull: true }
        }, {
            name: "name",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { unique: true, notNull: true }
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
        } ], true));
    // Group table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document_group", [ {
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
        } ], true));
    // Document table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document", [ {
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
            name: "content",
            type: database.queries.CreateTableColumnType.TEXT,
            options: { notNull: true }
        }, {
            name: "owner",
            type: database.queries.CreateTableColumnType.INTEGER,
            options: { notNull: true },
            foreign: {
                tableName: "account",
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"]
            }
        }, {
            name: "document_group",
            type: database.queries.CreateTableColumnType.INTEGER,
            foreign: {
                tableName: "document_group",
                column: "id"
            }
        } ], true));
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupInitialData = async (databasePath: string): Promise<void> => {
    // Add initial account
    const accountIdAdmin = await databaseManagerAccount.create(databasePath, {
        name: "Admin",
        password: "12345678",
        admin: true
    });
    // Add test account
    const accountIdTestUser = await databaseManagerAccount.create(databasePath, {
        name: "Test",
        password: "12345678"
    });
    // Add documents to test account
    await databaseManagerDocument.create(databasePath, accountIdTestUser, {
        title: "Example Document",
        content: "**hey you** *you are looking amazing* :D\n" +
        "\n" +
        "=abcdefg=\n" +
        "abc\n\ndefg\n" +
        "=abc\n\ndefg=\n" +
        "=a ==b =c= ==d==\n" +
        "\n" +
        "Inline code `std::cout << \"cool\"` and big code thing:\n" +
        "```cpp\nstd::cout << \"cool\" << std::endl;\n```" +
        "\n" +
        "Inline math $c = \\pm\\sqrt{a^2 + b^2}$ and big math block:\n" +
        "$$\nc = \\pm\\sqrt{a^2 + b^2}\n$$" +
        "and inline big math:\n" +
        "$$c = \\pm\\sqrt{a^2 + b^2}$$\n" +
        "\n" +
        "\\begin{center}\n" +
        "This is a \\LaTeX block where you can do complicated \\LaTeX commands.\n" +
        "\\end{center}\n"
    });
    await databaseManagerDocument.create(databasePath, accountIdTestUser, {
        title: "Example Document 2",
        content: "**hey you** *you are looking amazing* :D\n" +
        "\n" +
        "=abcdefg=\n" +
        "abc\n\ndefg\n" +
        "=abc\n\ndefg=\n" +
        "=a ==b =c= ==d==\n" +
        "\n" +
        "Inline code `std::cout << \"cool\"` and big code thing:\n" +
        "```cpp\nstd::cout << \"cool\" << std::endl;\n```" +
        "\n" +
        "Inline math $c = \\pm\\sqrt{a^2 + b^2}$ and big math block:\n" +
        "$$\nc = \\pm\\sqrt{a^2 + b^2}\n$$" +
        "and inline big math:\n" +
        "$$c = \\pm\\sqrt{a^2 + b^2}$$\n" +
        "\n" +
        "\\begin{center}\n" +
        "This is a \\LaTeX block where you can do complicated \\LaTeX commands.\n" +
        "\\end{center}\n",
        authors: "John Doe",
        date: "16.02.2020"
    });
    // Add groups to test account
    await databaseManagerGroup.create(databasePath, accountIdTestUser, {
        name: "Example Group"
    });
};
