import api from "../../src/modules/api";
import chai from "chai";
import databaseAccount from "./database/account";
import databaseAccountFriend from "./database/account_friend";
import databaseDocument from "./database/document";
import databaseGroup from "./database/group";
import { describe } from "mocha";
import os from "os";
import path from "path";


export default (): Mocha.Suite => {
    const databasePath = path.join(os.tmpdir(), "test.db");

    return describe("database", () => {
        it("remove", async () => {
            await api.database.remove(databasePath);
            await api.database.remove(databasePath);
        });
        it("create", async () => {
            await api.database.remove(databasePath);
            await api.database.create(databasePath);
            await api.database.create(databasePath);
        });
        it("exists", async () => {
            await api.database.remove(databasePath);
            chai.expect(await api.database.exists(databasePath)).to.equal(false);

            await api.database.remove(databasePath);
            chai.expect(await api.database.exists(databasePath)).to.equal(false);
            await api.database.create(databasePath);
            chai.expect(await api.database.exists(databasePath)).to.equal(true);
            await api.database.create(databasePath);
            chai.expect(await api.database.exists(databasePath)).to.equal(true);
            await api.database.remove(databasePath);
            chai.expect(await api.database.exists(databasePath)).to.equal(false);
        });
        it("reset", async () => {
            await api.database.reset(databasePath);
            const exists1 = await api.database.exists(databasePath);
            chai.expect(exists1).to.equal(true);
            await api.database.reset(databasePath);
            const exists2 = await api.database.exists(databasePath);
            chai.expect(exists2).to.equal(true);
        });

        databaseAccount(databasePath);
        databaseAccountFriend(databasePath);
        databaseDocument(databasePath);
        databaseGroup(databasePath);
    });
};
