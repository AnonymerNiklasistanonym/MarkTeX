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
    await database.requests.post(
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
        }, {
            name: "public",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Account friend
    await database.requests.post(
        databasePath,
        database.queries.createTable("account_friend", [ {
            name: "id",
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                tableName: "account"
            },
            name: "account_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                tableName: "account"
            },
            name: "friend_account_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Group table
    await database.requests.post(
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
        }, {
            name: "public",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Group access table
    await database.requests.post(
        databasePath,
        database.queries.createTable("document_group_access", [ {
            name: "id",
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: "account"
            },
            name: "account_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: "document_group"
            },
            name: "document_group_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "write_access",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }  ], true));
    // Document table
    await database.requests.post(
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
            name: "pdf_options",
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
        }, {
            name: "public",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Document access table
    await database.requests.post(
        databasePath,
        database.queries.createTable("document_access", [ {
            name: "id",
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: "account"
            },
            name: "account_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: "id",
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: "document"
            },
            name: "document_id",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "write_access",
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }   ], true));
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
        "\\end{center}\n" +
        "\n" +
        "\\begin{tikzpicture}[->, >=stealth', auto, semithick, node distance=3cm]\n" +
        "% header-includes: \\usepackage{tikz} \\usetikzlibrary{automata,arrows,positioning,calc}\n" +
        "\\tikzstyle{every state}=[fill=white,draw=black,thick,text=black,scale=1]\n" +
        "\\node[state]    (L)               {$L$};\n" +
        "\\node[state]    (B)[right of=L]   {$B$};\n" +
        "\\node[state]    (K)[right of=B]   {$K$};\n" +
        "\\path\n" +
        "(L) edge[loop left]     node{$0.1$} (L)\n" +
        "    edge[bend left=10]  node{$0.3$} (B)\n" +
        "    edge[bend left=50]  node{$0.6$} (K)\n" +
        "(B) edge[loop above]    node{$0.1$} (B)\n" +
        "    edge[bend left=10] node{$0.3$} (L)\n" +
        "    edge[bend left=10]  node{$0.6$} (K)\n" +
        "(K) edge[loop right]    node{$0.8$} (K)\n" +
        "    edge[bend left=50] node{$0.1$} (L)\n" +
        "    edge[bend left=10] node{$0.1$} (B)\n" +
        ";\n" +
        "\\end{tikzpicture}\n" +
        "\n" +
        "\\begin{tikzpicture}[->, >=stealth', auto, semithick, node distance=3cm]\n" +
        "% header-includes: \\usepackage{tikz} \\usetikzlibrary{automata,arrows,positioning,calc}\n" +
        "\\tikzstyle{every state}=[fill=white,draw=black,thick,text=black,scale=1]\n" +
        "\\node[state] (X1)                   {$X_1$};\n" +
        "\\node[state] (X2) [right of=X1] {$X_2$};\n" +
        "\\node[state] (X3) [right of=X2] {$X_3$};\n" +
        "\\node[state] (Y1) [below of=X1] {$Y_1$};\n" +
        "\\node[state] (Y2) [below of=X2] {$Y_2$};\n" +
        "\\node[state] (Y3) [below of=X3] {$Y_3$};\n" +
        "\\path\n" +
        "(X1) edge     node{$T$}         (X2)\n" +
        "     edge     node{}            (Y1)\n" +
        "(X2) edge     node{$T$}         (X3)\n" +
        "     edge     node{}            (Y2)\n" +
        "(X3) edge     node{}            (Y3)\n" +
        ";\n" +
        "\\end{tikzpicture}\n",
        owner: accountIdTestUser,
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
        owner: accountIdTestUser,
        title: "Example Document 2"
    });
    // Add groups to test account
    await databaseManagerGroup.create(databasePath, accountIdTestUser, {
        name: "Example Group"
    });
};
