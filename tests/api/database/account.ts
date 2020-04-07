import api from "../../../src/modules/api";
import chai from "chai";


export default (databasePath: string): Mocha.Suite => {
    return describe("account", () => {
        it("create", async () => {
            await api.database.reset(databasePath);
            const accountId1 = await api.database.account.create(databasePath, {
                admin: true,
                name: "TestUserAdmin",
                password: "passwordAdmin"
            });
            chai.expect(accountId1).to.be.an("number");
            const accountId2 = await api.database.account.create(databasePath, {
                name: "TestUser",
                password: "password"
            });
            chai.expect(accountId2).to.be.an("number");
            let throwException = false;
            try {
                await api.database.account.create(databasePath, {
                    name: "TestUser",
                    password: "password"
                });
            } catch (e) {
                throwException = true;
                chai.expect(e.message).equal(api.database.account.CreateError.USER_NAME_ALREADY_EXISTS);
            }
            chai.expect(throwException).to.equal(true);
        });
        it("exists (id)", async () => {
            await api.database.reset(databasePath);
            const accountName = "TestUser";
            const accountId = await api.database.account.create(databasePath, {
                name: accountName,
                password: "password"
            });
            const accountExists = await api.database.account.exists(databasePath, {
                id: accountId
            });
            chai.expect(accountExists).to.equal(true);
            const accountExistsBad = await api.database.account.exists(databasePath, {
                id: 99999
            });
            chai.expect(accountExistsBad).to.equal(false);
        });
        it("exists (name)", async () => {
            await api.database.reset(databasePath);
            const accountName = "TestUser";
            await api.database.account.create(databasePath, {
                name: accountName,
                password: "password"
            });
            const accountExists = await api.database.account.existsName(databasePath, {
                name: accountName
            });
            chai.expect(accountExists).to.equal(true);
            const accountExistsBad = await api.database.account.existsName(databasePath, {
                name: "does not exist"
            });
            chai.expect(accountExistsBad).to.equal(false);
        });
        it("login", async () => {
            await api.database.reset(databasePath);
            const accountName = "TestUser";
            const accountPassword = "password";

            const accountId = await api.database.account.create(databasePath, {
                name: accountName,
                password: accountPassword
            });
            const loginCheck = await api.database.account.checkLogin(databasePath, {
                name: accountName,
                password: accountPassword
            });
            chai.expect(loginCheck).to.equal(accountId);
            let throwException = false;
            try {
                await api.database.account.checkLogin(databasePath, {
                    name: accountName + "bad",
                    password: accountPassword
                });
            } catch (error) {
                throwException = true;
                chai.expect((error as Error).message).to.equal(api.database.account.GeneralError.NOT_EXISTING);
            }
            chai.expect(throwException).to.equal(true);
            const loginCheckBadPassword = await api.database.account.checkLogin(databasePath, {
                name: accountName,
                password: accountPassword + "bad"
            });
            chai.expect(loginCheckBadPassword).to.equal(undefined);
        });
        it("delete", async () => {
            await api.database.reset(databasePath);
            const accountName = "TestUser";
            const accountId = await api.database.account.create(databasePath, {
                name: accountName,
                password: "password"
            });

            const accountRemoved = await api.database.account.remove(databasePath, accountId, {
                id: accountId
            });
            chai.expect(accountRemoved).to.equal(true);
            const accountExists = await api.database.account.exists(databasePath, {
                id: accountId
            });
            chai.expect(accountExists).to.equal(false);
            let throwException = false;
            try {
                await api.database.account.remove(databasePath, accountId, {
                    id: accountId
                });
            } catch (error) {
                throwException = true;
                chai.expect((error as Error).message).to.equal(api.database.account.GeneralError.NOT_EXISTING);
            }
            chai.expect(throwException).to.equal(true);
        });
    });
};
