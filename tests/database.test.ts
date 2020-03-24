import * as chai from "chai";
import { describe } from "mocha";
import * as database from "../src/modules/database";

const databaseName = "./test.db";

describe("database api", () => {
    it("delete database throws no error", async () => {
        try {
            await database.deleteDatabase(databaseName);
            // Remove a second time to be sure that a not existing database is removed without an error
            await database.deleteDatabase(databaseName);
        } catch (error) {
            chai.assert(false, "Database deletion threw an error");
        }
    });
    it("open not existing database readonly throws correct error", async () => {
        try {
            await database.openDatabase(databaseName, { readOnly: true });
            chai.assert(false, "Database could be opened");
        } catch (error) {
            chai.expect(error.code).to.deep.equal(database.OpenDatabaseErrorCode.SQLITE_CANTOPEN);
        }
    });
    it("open not existing database readwrite throws correct error", async () => {
        try {
            await database.openDatabase(databaseName, { readOnly: false });
            chai.assert(false, "Database could be opened");
        } catch (error) {
            chai.expect(error.code).to.deep.equal(database.OpenDatabaseErrorCode.SQLITE_CANTOPEN);
        }
    });
    it("create and open database readonly", async () => {
        try {
            const db = await database.createDatabase(databaseName);
            chai.assert(db !== undefined, "Database not undefined");
        } catch (error) {
            chai.expect(error.code).to.not.deep.equal(database.CreateDatabaseErrorCode.SQLITE_MISUSE);
        }
        try {
            const db = await database.openDatabase(databaseName, { readOnly: true });
            chai.assert(db !== undefined, "Database not undefined");
        } catch (error) {
            chai.expect(error.code).to.not.deep.equal(database.OpenDatabaseErrorCode.SQLITE_CANTOPEN);
        }
        await database.deleteDatabase(databaseName);
    });
    it("create and open database readwrite", async () => {
        try {
            const db = await database.createDatabase(databaseName);
            chai.assert(db !== undefined, "Database not undefined");
        } catch (error) {
            chai.expect(error.code).to.not.deep.equal(database.CreateDatabaseErrorCode.SQLITE_MISUSE);
        }
        try {
            const db = await database.openDatabase(databaseName, { readOnly: false });
            chai.assert(db !== undefined, "Database not undefined");
        } catch (error) {
            chai.expect(error.code).to.not.deep.equal(database.OpenDatabaseErrorCode.SQLITE_CANTOPEN);
        }
        await database.deleteDatabase(databaseName);
    });
});

describe("database query api", () => {
    it("methods do not throw errors", () => {
        const columns: database.queries.CreateTableColumn[] = [ {
            name: "blob",
            type: database.queries.CreateTableColumnType.BLOB
        }, {
            name: "integer",
            type: database.queries.CreateTableColumnType.INTEGER
        }, {
            name: "numeric",
            type: database.queries.CreateTableColumnType.NUMERIC
        }, {
            name: "real",
            type: database.queries.CreateTableColumnType.REAL
        }, {
            name: "text",
            type: database.queries.CreateTableColumnType.TEXT
        } ];
        const queryCreateTable1 = database.queries.createTable("test", columns);
        chai.expect(queryCreateTable1).to.be.a("string");
        chai.assert(queryCreateTable1.length > 0, "Query not empty");
        chai.expect(queryCreateTable1).to.deep.equal("CREATE TABLE test "
        + "(blob BLOB,integer INTEGER,numeric NUMERIC,real REAL,text TEXT);");

        const queryCreateTable2 = database.queries.createTable("test", columns, true);
        chai.expect(queryCreateTable2).to.be.a("string");
        chai.assert(queryCreateTable2.length > 0, "Query not empty");
        chai.expect(queryCreateTable2).to.deep.equal("CREATE TABLE IF NOT EXISTS test "
        + "(blob BLOB,integer INTEGER,numeric NUMERIC,real REAL,text TEXT);");

        const queryCreateTable3 = database.queries.createTable("contact_groups", [
            {
                foreign: {
                    column: "contact_id",
                    options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                    tableName: "contacts"
                },
                name: "contact_id",
                type: database.queries.CreateTableColumnType.INTEGER
            },
            {
                foreign: {
                    column: "group_id",
                    options: ["ON DELETE CASCADE ON UPDATE NO ACTION"],
                    tableName: "groups"
                },
                name: "group_id",
                type: database.queries.CreateTableColumnType.INTEGER
            }
        ], true);
        chai.expect(queryCreateTable3).to.be.a("string");
        chai.assert(queryCreateTable3.length > 0, "Query not empty");
        chai.expect(queryCreateTable3).to.deep.equal("CREATE TABLE IF NOT EXISTS contact_groups "
        + "(contact_id INTEGER,group_id INTEGER,"
        + "FOREIGN KEY (contact_id) REFERENCES contacts (contact_id) ON DELETE CASCADE ON UPDATE NO ACTION,"
        + "FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE ON UPDATE NO ACTION);");

        const queryDropTable1 = database.queries.dropTable("test");
        chai.expect(queryDropTable1).to.be.a("string");
        chai.assert(queryDropTable1.length > 0, "Query not empty");
        chai.expect(queryDropTable1).to.deep.equal("DROP TABLE test;");

        // TODO Check foreign keys implementation

        const queryDropTable2 = database.queries.dropTable("test", true);
        chai.expect(queryDropTable2).to.be.a("string");
        chai.assert(queryDropTable2.length > 0, "Query not empty");
        chai.expect(queryDropTable2).to.deep.equal("DROP TABLE IF EXISTS test;");

        const queryExists1 = database.queries.exists("test");
        chai.expect(queryExists1).to.be.a("string");
        chai.assert(queryExists1.length > 0, "Query not empty");
        chai.expect(queryExists1).to.deep.equal("SELECT EXISTS(SELECT 1 FROM test WHERE id=?) AS exists_value;");

        const queryExists2 = database.queries.exists("test", "column");
        chai.expect(queryExists2).to.be.a("string");
        chai.assert(queryExists2.length > 0, "Query not empty");
        chai.expect(queryExists2).to.deep.equal("SELECT EXISTS(SELECT 1 FROM test WHERE column=?) AS exists_value;");

        const queryInsert = database.queries.insert("test", [ "column1", "column2" ]);
        chai.expect(queryInsert).to.be.a("string");
        chai.assert(queryInsert.length > 0, "Query not empty");
        chai.expect(queryInsert).to.deep.equal("INSERT INTO test(column1,column2) VALUES(?,?);");

        const queryRemove1 = database.queries.remove("test");
        chai.expect(queryRemove1).to.be.a("string");
        chai.assert(queryRemove1.length > 0, "Query not empty");
        chai.expect(queryRemove1).to.deep.equal("DELETE FROM test WHERE id=?;");

        const queryRemove2 = database.queries.remove("test", "columnWhere");
        chai.expect(queryRemove2).to.be.a("string");
        chai.assert(queryRemove2.length > 0, "Query not empty");
        chai.expect(queryRemove2).to.deep.equal("DELETE FROM test WHERE columnWhere=?;");

        const querySelect = database.queries.select("test", [ "a", "b", "c" ]);
        chai.expect(querySelect).to.be.a("string");
        chai.assert(querySelect.length > 0, "Query not empty");
        chai.expect(querySelect).to.deep.equal("SELECT a,b,c FROM test;");

        // TODO Check all select query options

        const queryUpdate1 = database.queries.update("test", [ "a", "b", "c" ]);
        chai.expect(queryUpdate1).to.be.a("string");
        chai.assert(queryUpdate1.length > 0, "Query not empty");
        chai.expect(queryUpdate1).to.deep.equal("UPDATE test SET a=?,b=?,c=? WHERE id=?;");

        const queryUpdate2 = database.queries.update("test", [ "a", "b", "c" ], "whereColumn");
        chai.expect(queryUpdate2).to.be.a("string");
        chai.assert(queryUpdate2.length > 0, "Query not empty");
        chai.expect(queryUpdate2).to.deep.equal("UPDATE test SET a=?,b=?,c=? WHERE whereColumn=?;");
    });
});
