import api from "../../../src/modules/api";
import chai from "chai";


export default (databasePath: string): Mocha.Suite => {
    return describe("group", () => {
        it("create", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const groupId = await api.database.group.create(databasePath, accountId, {
                name: "name",
                owner: accountId
            });
            chai.expect(groupId).to.be.an("number");
            const groupId2 = await api.database.group.create(databasePath, accountId, {
                name: "name", owner: accountId, public: false
            });
            chai.expect(groupId2).to.be.an("number");
        });
        it("exists", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const groupId = await api.database.group.create(databasePath, accountId, {
                name: "name", owner: accountId
            });
            const groupExists = await api.database.group.exists(databasePath, {
                id: groupId
            });
            chai.expect(groupExists).to.equal(true);
            const groupExistsBad = await api.database.group.exists(databasePath, {
                id: 983474358
            });
            chai.expect(groupExistsBad).to.equal(false);
        });
        it("delete", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const groupId = await api.database.group.create(databasePath, accountId, {
                name: "name", owner: accountId
            });
            const groupRemoved = await api.database.group.remove(databasePath, accountId, {
                id: groupId
            });
            chai.expect(groupRemoved).to.equal(true);
            const groupExists = await api.database.group.exists(databasePath, {
                id: groupId
            });
            chai.expect(groupExists).to.equal(false);
            let throwsException = false;
            try {
                await api.database.group.remove(databasePath, accountId, {
                    id: groupId
                });
            } catch (error) {
                throwsException = true;
                chai.expect((error as Error).message).to.equal(api.database.group.GeneralError.NOT_EXISTING);
            }
            chai.expect(throwsException).to.equal(true);
        });
    });
};
