import api from "../src/modules/api";
import chai from "chai";
import { describe } from "mocha";
import os from "os";
import path from "path";


const databasePath = path.join(os.tmpdir(), "test.db");

describe("api database: management", () => {
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
});

describe("api database: account", () => {
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

describe("api database: account friend", () => {
    it("create", async () => {
        await api.database.reset(databasePath);
        const accountId1 = await api.database.account.create(databasePath, {
            name: "TestUser",
            password: "password"
        });
        const accountIdFriend1 = await api.database.account.create(databasePath, {
            name: "TestUserFriend1",
            password: "passwordFriend1"
        });
        const accountIdFriend2 = await api.database.account.create(databasePath, {
            name: "TestUserFriend2",
            password: "passwordFriend2"
        });

        const accountFriendId1 = await api.database.accountFriend.create(databasePath, accountId1, {
            accountId: accountId1,
            friendId: accountIdFriend1
        });
        chai.expect(accountFriendId1).to.be.an("number");
        const accountFriendId2 = await api.database.accountFriend.create(databasePath, accountId1, {
            accountId: accountId1,
            friendId: accountIdFriend2
        });
        chai.expect(accountFriendId2).to.be.an("number");

        let throwsException = false;
        try {
            await api.database.accountFriend.create(databasePath, accountId1, {
                accountId: accountId1,
                friendId: accountIdFriend2
            });
        } catch (error) {
            throwsException = true;
            chai.expect((error as Error).message).to.equal(api.database.accountFriend.CreateError.ALREADY_EXISTS);
        }
        chai.expect(throwsException).to.equal(true);
    });
    it("get all from account", async () => {
        await api.database.reset(databasePath);
        const accountId1 = await api.database.account.create(databasePath, {
            name: "TestUser",
            password: "password"
        });
        const accountIdFriend1 = await api.database.account.create(databasePath, {
            name: "TestUserFriend1",
            password: "passwordFriend1"
        });
        const accountIdFriend2 = await api.database.account.create(databasePath, {
            name: "TestUserFriend2",
            password: "passwordFriend2"
        });

        const accountFriendId1 = await api.database.accountFriend.create(databasePath, accountId1, {
            accountId: accountId1,
            friendId: accountIdFriend1
        });
        const accountFriendId2 = await api.database.accountFriend.create(databasePath, accountId1, {
            accountId: accountId1,
            friendId: accountIdFriend2
        });

        const friendsAccountId1 = await api.database.accountFriend.getAllFromAccount(databasePath, accountId1, {
            id: accountId1
        });
        chai.expect(friendsAccountId1.length).to.equal(2);
        chai.expect(friendsAccountId1[0].friendAccountId).to.be.a("number");
        chai.expect(friendsAccountId1[1].friendAccountId).to.be.a("number");
        chai.expect(friendsAccountId1.find(a => a.id === accountFriendId1)).to.not.equal(undefined);
        chai.expect(friendsAccountId1.find(a => a.id === accountFriendId2)).to.not.equal(undefined);
        chai.expect(friendsAccountId1[0].friendAccountName).to.equal(undefined);
        chai.expect(friendsAccountId1[1].friendAccountName).to.equal(undefined);

        const friendsAccountId1Names = await api.database.accountFriend.getAllFromAccount(databasePath, accountId1, {
            getNames: true, id: accountId1
        });
        chai.expect(friendsAccountId1Names.length).to.equal(2);
        chai.expect(friendsAccountId1Names[0].friendAccountId).to.be.a("number");
        chai.expect(friendsAccountId1Names[1].friendAccountId).to.be.a("number");
        chai.expect(friendsAccountId1.find(a => a.id === accountFriendId1)).to.not.equal(undefined);
        chai.expect(friendsAccountId1.find(a => a.id === accountFriendId2)).to.not.equal(undefined);
        chai.expect(friendsAccountId1Names[0].friendAccountName).to.be.a("string");
        chai.expect(friendsAccountId1Names[1].friendAccountName).to.be.a("string");
    });
});

describe("api database: document", () => {
    it("create", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const documentId = await api.database.document.create(databasePath, accountId, {
            content: "content", owner: accountId, title: "title"
        });
        chai.expect(documentId).to.be.an("number");
        const documentId2 = await api.database.document.create(databasePath, accountId, {
            authors: "authors", content: "content", date: "date", owner: accountId, public: true, title: "title"
        });
        chai.expect(documentId2).to.be.an("number");
    });
    it("exists", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const documentId = await api.database.document.create(databasePath, accountId, {
            content: "content", owner: accountId, title: "title"
        });
        const documentExists = await api.database.document.exists(databasePath, {
            id: documentId
        });
        chai.expect(documentExists).to.equal(true);
        const documentExistsBad = await api.database.document.exists(databasePath, {
            id: 983474358
        });
        chai.expect(documentExistsBad).to.equal(false);
    });
    it("delete", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const documentId = await api.database.document.create(databasePath, accountId, {
            content: "content", owner: accountId, title: "title"
        });
        const documentRemoved = await api.database.document.remove(databasePath, accountId, {
            id: documentId
        });
        chai.expect(documentRemoved).to.equal(true);
        const documentExists = await api.database.document.exists(databasePath, {
            id: documentId
        });
        chai.expect(documentExists).to.equal(false);
        let throwsException = false;
        try {
            await api.database.document.remove(databasePath, accountId, {
                id: documentId
            });
        } catch (error) {
            throwsException = true;
            chai.expect((error as Error).message).to.equal(api.database.document.GeneralError.NOT_EXISTING);
        }
        chai.expect(throwsException).to.equal(true);
    });
});

describe("api database: group", () => {
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
