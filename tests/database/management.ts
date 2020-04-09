import * as database from "../../src/modules/database";
import chai from "chai";
import { describe } from "mocha";


export default (databasePath: string): Mocha.Suite => {
    return describe("management", () => {
        it("remove", async () => {
            await database.remove(databasePath);
            const exists = await database.exists(databasePath);
            chai.expect(exists).to.equal(false, "Database does not exist");
        });
        it("create", async () => {
            await database.remove(databasePath);
            const db = await database.create(databasePath);
            chai.expect(db).to.not.equal(undefined, "Database not undefined");
            const exists = await database.exists(databasePath);
            chai.expect(exists).to.equal(true, "Database exists");
            const db2 = await database.create(databasePath);
            chai.expect(db2).to.not.equal(undefined, "Database not undefined");
        });
        it("open", async () => {
            await database.remove(databasePath);
            await database.create(databasePath);
            const dbReadWrite = await database.open(databasePath);
            chai.expect(dbReadWrite).to.not.equal(undefined, "Database not undefined");

            await database.remove(databasePath);
            await database.create(databasePath);
            const dbReadOnly = await database.open(databasePath, { readOnly: true });
            chai.expect(dbReadOnly).to.not.equal(undefined, "Database not undefined");

            await database.remove(databasePath);
            let throwsException1 = false;
            try {
                await database.open(databasePath);
            } catch (error) {
                throwsException1 = true;
                chai.expect(error.code).to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
            }
            chai.expect(throwsException1).to.equal(true);

            await database.remove(databasePath);
            let throwsException2 = false;
            try {
                await database.open(databasePath, { readOnly: true });
            } catch (error) {
                throwsException2 = true;
                chai.expect(error.code).to.deep.equal(database.ErrorCodeOpen.SQLITE_CANTOPEN);
            }
            chai.expect(throwsException2).to.equal(true);
        });
    });
};
