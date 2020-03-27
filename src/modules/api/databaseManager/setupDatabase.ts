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
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "name",
            options: { notNull: true, unique: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "password_hash",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "password_salt",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "admin",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Group table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document_group", [ {
            name: "id",
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "name",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            foreign: {
                column: "id",
                tableName: "account"
            },
            name: "owner",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Document table
    await database.requests.postRequest(
        databasePath,
        database.queries.createTable("document", [ {
            name: "id",
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "title",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "authors",
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "date",
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: "content",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            foreign: {
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: "account"
            },
            name: "owner",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                tableName: "document_group"
            },
            name: "document_group",
            type: database.queries.CreateTableColumnType.INTEGER
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
        admin: true,
        name: "Admin",
        password: "12345678"
    });
    // Add test account
    const accountIdTestUser = await databaseManagerAccount.create(databasePath, {
        name: "Test",
        password: "12345678"
    });
    // Add documents to test account
    await databaseManagerDocument.create(databasePath, accountIdTestUser, {
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
        title: "Example Document"
    });
    await databaseManagerDocument.create(databasePath, accountIdTestUser, {
        authors: "John Doe",
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
        date: "16.02.2020",
        title: "Example Document 2"
    });
    // Add groups to test account
    await databaseManagerGroup.create(databasePath, accountIdTestUser, {
        name: "Example Group"
    });
};
