import * as account from "./account";
import * as accountFriend from "./accountFriend";
import * as database from "../../database";
import * as document from "./document";
import * as documentAccess from "./documentAccess";
import * as documentResource from "./documentResource";
import * as group from "./group";
import * as groupAccess from "./groupAccess";

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupTables = async (databasePath: string): Promise<void> => {
    // Account table
    await database.requests.post(
        databasePath,
        database.queries.createTable(account.table.name, [ {
            name: account.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: account.table.column.name,
            options: { notNull: true, unique: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: account.table.column.passwordHash,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: account.table.column.passwordSalt,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: account.table.column.admin,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: account.table.column.public,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Account friend
    await database.requests.post(
        databasePath,
        database.queries.createTable(accountFriend.table.name, [ {
            name: accountFriend.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: account.table.column.id,
                tableName: account.table.name
            },
            name: accountFriend.table.column.accountId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: account.table.column.id,
                tableName: account.table.name
            },
            name: accountFriend.table.column.friendAccountId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Group table
    await database.requests.post(
        databasePath,
        database.queries.createTable(group.table.name, [ {
            name: group.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: group.table.column.name,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            foreign: {
                column: account.table.column.id,
                tableName: account.table.name
            },
            name: group.table.column.owner,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: group.table.column.public,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Group access table
    await database.requests.post(
        databasePath,
        database.queries.createTable(groupAccess.table.name, [ {
            name: groupAccess.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: account.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: account.table.name
            },
            name: groupAccess.table.column.accountId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: group.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: group.table.name
            },
            name: groupAccess.table.column.groupId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: groupAccess.table.column.writeAccess,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }  ], true));
    // Document table
    await database.requests.post(
        databasePath,
        database.queries.createTable(document.table.name, [ {
            name: document.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: document.table.column.title,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: document.table.column.authors,
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: document.table.column.date,
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: document.table.column.content,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            name: document.table.column.pdfOptions,
            type: database.queries.CreateTableColumnType.TEXT
        }, {
            foreign: {
                column: account.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: account.table.name
            },
            name: document.table.column.owner,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: group.table.column.id,
                tableName: group.table.name
            },
            name: document.table.column.groupId,
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: document.table.column.public,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        } ], true));
    // Document access table
    await database.requests.post(
        databasePath,
        database.queries.createTable(documentAccess.table.name, [ {
            name: documentAccess.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: account.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: account.table.name
            },
            name: documentAccess.table.column.accountId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: document.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: document.table.name
            },
            name: documentAccess.table.column.documentId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: documentAccess.table.column.writeAccess,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }   ], true));
    // Document resource table
    await database.requests.post(
        databasePath,
        database.queries.createTable(documentResource.table.name, [ {
            name: documentResource.table.column.id,
            options: { notNull: true, primaryKey: true, unique: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            foreign: {
                column: document.table.column.id,
                options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                tableName: document.table.name
            },
            name: documentResource.table.column.documentId,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: documentResource.table.column.data,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.BLOB
        }, {
            name: documentResource.table.column.binary,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: documentResource.table.column.name,
            options: { notNull: true },
            type: database.queries.CreateTableColumnType.TEXT
        } ], true));
};

/**
 * Create tables if not existing.
 *
 * @param databasePath Path to database.
 */
export const setupInitialData = async (databasePath: string): Promise<void> => {
    // Add initial account
    const accountIdAdmin = await account.create(databasePath, {
        admin: true,
        name: "Admin",
        password: "12345678"
    });
    // Add test account
    const accountIdTestUser = await account.create(databasePath, {
        name: "Test",
        password: "12345678"
    });
    // Add documents to test account
    await document.create(databasePath, accountIdTestUser, {
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
    await document.create(databasePath, accountIdTestUser, {
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
    await group.create(databasePath, accountIdTestUser, {
        name: "Example Group",
        owner: accountIdTestUser
    });
};
