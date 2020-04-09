import * as database from "../../src/modules/database";
import chai from "chai";
import { describe } from "mocha";


export default (): Mocha.Suite => {
    return describe("queries", () => {
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
            chai.expect(queryExists2).to.deep.equal(
                "SELECT EXISTS(SELECT 1 FROM test WHERE column=?) AS exists_value;"
            );
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
            const querySelect1 = database.queries.select("test", [ "a", "b", "c" ]);
            chai.expect(querySelect1).to.be.a("string");
            chai.expect(querySelect1.length).to.be.above(0, "Query not empty");
            chai.expect(querySelect1).to.deep.equal("SELECT a,b,c FROM test;");

            const querySelect2 = database.queries.select("test", [ "a", "b", "c" ], { whereColumn: "id" });
            chai.expect(querySelect2).to.be.a("string");
            chai.expect(querySelect2.length).to.be.above(0, "Query not empty");
            chai.expect(querySelect2).to.deep.equal("SELECT a,b,c FROM test WHERE id=?;");

            const querySelect3 = database.queries.select("test", [ "a", "b", "c" ], {
                whereColumn: { columnName: "id", tableName: "test" }
            });
            chai.expect(querySelect3).to.be.a("string");
            chai.expect(querySelect3.length).to.be.above(0, "Query not empty");
            chai.expect(querySelect3).to.deep.equal("SELECT a,b,c FROM test WHERE test.id=?;");

            const querySelect4 = database.queries.select("test", [ "a", "b", "c" ], {
                innerJoins: [
                    { otherColumn: "other_id", otherTableName: "other_test", thisColumn: "id" }
                ],
                whereColumn: { columnName: "id", tableName: "test" }
            });
            chai.expect(querySelect4).to.be.a("string");
            chai.expect(querySelect4.length).to.be.above(0, "Query not empty");
            chai.expect(querySelect4).to.deep.equal(
                "SELECT a,b,c FROM test INNER JOIN other_test ON other_test.other_id=id WHERE test.id=?;"
            );

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
};
