import * as database from "../src/modules/database";
import chai from "chai";
import { describe } from "mocha";
import os from "os";
import path from "path";


const databaseName = path.join(os.tmpdir(), "test.db");

describe("database", () => {
    it("remove", async () => {
        await database.remove(databaseName);
        const exists = await database.exists(databaseName);
        chai.expect(exists).to.equal(false, "Database does not exist");
    });
    it("create", async () => {
        await database.remove(databaseName);
        const db = await database.create(databaseName);
        chai.expect(db).to.not.equal(undefined, "Database not undefined");
        const exists = await database.exists(databaseName);
        chai.expect(exists).to.equal(true, "Database exists");
    });
    it("open", async () => {
        await database.remove(databaseName);
        await database.create(databaseName);
        const dbReadWrite = await database.open(databaseName);
        chai.expect(dbReadWrite).to.not.equal(undefined, "Database not undefined");

        await database.remove(databaseName);
        await database.create(databaseName);
        const dbReadOnly = await database.open(databaseName, { readOnly: true });
        chai.expect(dbReadOnly).to.not.equal(undefined, "Database not undefined");

        await database.remove(databaseName);
        try {
            await database.open(databaseName);
            chai.assert(false, "Database could be opened");
        } catch (error) {
            chai.expect(error.code).to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
        }

        await database.remove(databaseName);
        try {
            await database.open(databaseName, { readOnly: true });
            chai.assert(false, "Database could be opened");
        } catch (error) {
            chai.expect(error.code).to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
        }
    });
});

describe("database: queries", () => {
    it("create table", () => {
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
        chai.expect(queryCreateTable1.length).to.be.above(0, "Query not empty");
        chai.expect(queryCreateTable1).to.deep.equal("CREATE TABLE test "
        + "(blob BLOB,integer INTEGER,numeric NUMERIC,real REAL,text TEXT);");

        const queryCreateTable2 = database.queries.createTable("test", columns, true);
        chai.expect(queryCreateTable2).to.be.a("string");
        chai.expect(queryCreateTable2.length).to.be.above(0, "Query not empty");
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
        chai.expect(queryCreateTable3.length).to.be.above(0, "Query not empty");
        chai.expect(queryCreateTable3).to.deep.equal("CREATE TABLE IF NOT EXISTS contact_groups "
        + "(contact_id INTEGER,group_id INTEGER,"
        + "FOREIGN KEY (contact_id) REFERENCES contacts (contact_id) ON DELETE CASCADE ON UPDATE NO ACTION,"
        + "FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE ON UPDATE NO ACTION);");
    });
    it("drop table", () => {
        const queryDropTable1 = database.queries.dropTable("test");
        chai.expect(queryDropTable1).to.be.a("string");
        chai.expect(queryDropTable1.length).to.be.above(0, "Query not empty");
        chai.expect(queryDropTable1).to.deep.equal("DROP TABLE test;");

        // TODO Check foreign keys implementation

        const queryDropTable2 = database.queries.dropTable("test", true);
        chai.expect(queryDropTable2).to.be.a("string");
        chai.expect(queryDropTable2.length).to.be.above(0, "Query not empty");
        chai.expect(queryDropTable2).to.deep.equal("DROP TABLE IF EXISTS test;");
    });
    it("exists", () => {
        const queryExists1 = database.queries.exists("test");
        chai.expect(queryExists1).to.be.a("string");
        chai.expect(queryExists1.length).to.be.above(0, "Query not empty");
        chai.expect(queryExists1).to.deep.equal("SELECT EXISTS(SELECT 1 FROM test WHERE id=?) AS exists_value;");

        const queryExists2 = database.queries.exists("test", "column");
        chai.expect(queryExists2).to.be.a("string");
        chai.expect(queryExists2.length).to.be.above(0, "Query not empty");
        chai.expect(queryExists2).to.deep.equal("SELECT EXISTS(SELECT 1 FROM test WHERE column=?) AS exists_value;");
    });
    it("insert", () => {
        const queryInsert = database.queries.insert("test", [ "column1", "column2" ]);
        chai.expect(queryInsert).to.be.a("string");
        chai.expect(queryInsert.length).to.be.above(0, "Query not empty");
        chai.expect(queryInsert).to.deep.equal("INSERT INTO test(column1,column2) VALUES(?,?);");
    });
    it("remove", () => {
        const queryRemove1 = database.queries.remove("test");
        chai.expect(queryRemove1).to.be.a("string");
        chai.expect(queryRemove1.length).to.be.above(0, "Query not empty");
        chai.expect(queryRemove1).to.deep.equal("DELETE FROM test WHERE id=?;");

        const queryRemove2 = database.queries.remove("test", "columnWhere");
        chai.expect(queryRemove2).to.be.a("string");
        chai.expect(queryRemove2.length).to.be.above(0, "Query not empty");
        chai.expect(queryRemove2).to.deep.equal("DELETE FROM test WHERE columnWhere=?;");
    });
    it("select", () => {
        const querySelect = database.queries.select("test", [ "a", "b", "c" ]);
        chai.expect(querySelect).to.be.a("string");
        chai.expect(querySelect.length).to.be.above(0, "Query not empty");
        chai.expect(querySelect).to.deep.equal("SELECT a,b,c FROM test;");

        // TODO Check all select query options
    });
    it("update", () => {
        const queryUpdate1 = database.queries.update("test", [ "a", "b", "c" ]);
        chai.expect(queryUpdate1).to.be.a("string");
        chai.expect(queryUpdate1.length).to.be.above(0, "Query not empty");
        chai.expect(queryUpdate1).to.deep.equal("UPDATE test SET a=?,b=?,c=? WHERE id=?;");

        const queryUpdate2 = database.queries.update("test", [ "a", "b", "c" ], "whereColumn");
        chai.expect(queryUpdate2).to.be.a("string");
        chai.expect(queryUpdate2.length).to.be.above(0, "Query not empty");
        chai.expect(queryUpdate2).to.deep.equal("UPDATE test SET a=?,b=?,c=? WHERE whereColumn=?;");
    });
});

describe("database: requests", () => {
    const tableName = "test";
    const tableColumns: database.queries.CreateTableColumn[] = [ {
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
    }, {
        name: "unique_text_and_not_null",
        options: { notNull: true, unique: true },
        type: database.queries.CreateTableColumnType.TEXT
    } ];
    it("post", async () => {
        await database.remove(databaseName);
        await database.create(databaseName);

        const queryCreateTable = database.queries.createTable(tableName, tableColumns);
        const postResultCreateTable = await database.requests.post(databaseName, queryCreateTable);
        chai.expect(postResultCreateTable.changes).to.be.a("number");
        chai.expect(postResultCreateTable.lastID).to.be.a("number");

        const queryInsert = database.queries.insert(tableName, tableColumns.map(a => a.name));
        const postResultInsert1 = await database.requests.post(
            databaseName, queryInsert, [ "blobData", 1234, 12, 22.3456, "textData", "unique1" ]
        );
        chai.expect(postResultInsert1.changes).to.equal(1);
        chai.expect(postResultInsert1.lastID).to.be.a("number");
        const postResultInsert2 = await database.requests.post(
            databaseName, queryInsert, [ "blobData", 1234, 12, 22.3456, "textData", "unique2"  ]
        );
        chai.expect(postResultInsert2.changes).to.equal(1);
        chai.expect(postResultInsert2.lastID).to.be.a("number");
        chai.expect(postResultInsert2.lastID).to.not.equal(postResultInsert1.lastID, "Inserted row ids are different");

        try {
            await database.requests.post(
                databaseName, queryInsert, [ "blobData", 1234, 12, 22.3456, "textData", "unique1" ]
            );
            chai.assert(false, "No error was thrown even though sql unique option was violated");
        } catch (error) {
            chai.expect(database.requests.isDatabaseError(error)).to.equal(true, JSON.stringify(error));
            chai.expect(error.code).to.equal(database.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT);
        }

        try {
            await database.requests.post(
                databaseName, queryInsert, [ "blobData", 1234, 12, 22.3456, "textData" ]
            );
            chai.assert(false, "No error was thrown even though sql not null option was violated");
        } catch (error) {
            chai.expect(database.requests.isDatabaseError(error)).to.equal(true, JSON.stringify(error));
            chai.expect(error.code).to.equal(database.requests.ErrorCodePostRequest.SQLITE_CONSTRAINT);
        }
    });
    it("get each", async () => {
        await database.remove(databaseName);
        await database.create(databaseName);

        await database.requests.post(databaseName, database.queries.createTable(tableName, tableColumns));

        const querySelectAllColumns = database.queries.select(
            tableName, tableColumns.map(a => a.name), { whereColumn: "integer" }
        );
        const querySelectLastColumn = database.queries.select(
            tableName, [tableColumns.map(a => a.name).slice(-1)[0]], { whereColumn: "integer" }
        );

        const getResultSelectAllColumns1 = await database.requests.getEach(databaseName, querySelectAllColumns, [42]);
        chai.expect(getResultSelectAllColumns1).to.equal(undefined, "No table entry to select");
        const getResultSelectLastColumn1 = await database.requests.getEach(databaseName, querySelectLastColumn, [42]);
        chai.expect(getResultSelectLastColumn1).to.equal(undefined, "No table entry to select");

        const queryInsert = database.queries.insert(tableName, tableColumns.map(a => a.name));
        await database.requests.post(databaseName, queryInsert, [
            "blobData", 1234, 12, 22.3456, "textData", "unique1"
        ]);

        const getResultSelectAllColumns2 = await database.requests.getEach(databaseName, querySelectAllColumns, [42]);
        chai.expect(getResultSelectAllColumns2).to.equal(undefined, "No matching table entry to select");
        const getResultSelectLastColumn2 = await database.requests.getEach(databaseName, querySelectLastColumn, [42]);
        chai.expect(getResultSelectLastColumn2).to.equal(undefined, "No matching table entry to select");

        const getResultSelectAllColumns3 = await database.requests.getEach(databaseName, querySelectAllColumns, [1234]);
        chai.expect(getResultSelectAllColumns3.blob).to.equal("blobData");
        chai.expect(getResultSelectAllColumns3.integer).to.equal(1234);
        chai.expect(getResultSelectAllColumns3.numeric).to.equal(12);
        chai.expect(getResultSelectAllColumns3.real).to.equal(22.3456);
        chai.expect(getResultSelectAllColumns3.text).to.equal("textData");
        chai.expect(getResultSelectAllColumns3.unique_text_and_not_null).to.equal("unique1");
        const getResultSelectLastColumn3 = await database.requests.getEach(databaseName, querySelectLastColumn, [1234]);
        chai.expect(getResultSelectLastColumn3.unique_text_and_not_null).to.equal("unique1");
    });
    it("get all", async () => {
        await database.remove(databaseName);
        await database.create(databaseName);

        await database.requests.post(databaseName, database.queries.createTable(tableName, tableColumns));

        const querySelectAllColumns = database.queries.select(
            tableName, tableColumns.map(a => a.name), { whereColumn: "integer" }
        );
        const querySelectLastColumn = database.queries.select(
            tableName, [tableColumns.map(a => a.name).slice(-1)[0]], { whereColumn: "integer" }
        );

        const getResultSelectAllColumns1 = await database.requests.getAll(databaseName, querySelectAllColumns, [42]);
        chai.expect(getResultSelectAllColumns1).to.deep.equal([], "No table entries to select");
        const getResultSelectLastColumn1 = await database.requests.getAll(databaseName, querySelectLastColumn, [42]);
        chai.expect(getResultSelectLastColumn1).to.deep.equal([], "No table entries to select");

        const queryInsert = database.queries.insert(tableName, tableColumns.map(a => a.name));
        await database.requests.post(databaseName, queryInsert, [
            "blobData", 1234, 12, 22.3456, "textData", "unique1"
        ]);

        const getResultSelectAllColumns2 = await database.requests.getAll(databaseName, querySelectAllColumns, [42]);
        chai.expect(getResultSelectAllColumns2).to.deep.equal([], "No matching table entries to select");
        const getResultSelectLastColumn2 = await database.requests.getAll(databaseName, querySelectLastColumn, [42]);
        chai.expect(getResultSelectLastColumn2).to.deep.equal([], "No matching table entries to select");

        const getResultSelectAllColumns3 = await database.requests.getAll(databaseName, querySelectAllColumns, [1234]);
        chai.expect(getResultSelectAllColumns3.length).to.equal(1);
        chai.expect(getResultSelectAllColumns3[0].blob).to.equal("blobData");
        chai.expect(getResultSelectAllColumns3[0].integer).to.equal(1234);
        chai.expect(getResultSelectAllColumns3[0].numeric).to.equal(12);
        chai.expect(getResultSelectAllColumns3[0].real).to.equal(22.3456);
        chai.expect(getResultSelectAllColumns3[0].text).to.equal("textData");
        chai.expect(getResultSelectAllColumns3[0].unique_text_and_not_null).to.equal("unique1");
        const getResultSelectLastColumn3 = await database.requests.getAll(databaseName, querySelectLastColumn, [1234]);
        chai.expect(getResultSelectLastColumn3.length).to.equal(1);
        chai.expect(getResultSelectLastColumn3[0].unique_text_and_not_null).to.equal("unique1");
    });
});
