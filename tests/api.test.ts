import api from "../src/modules/api";
import chai from "chai";
import { describe } from "mocha";
import os from "os";
import path from "path";


const databasePath = path.join(os.tmpdir(), "test.db");

describe("api database management", () => {
    it("delete database", async () => {
        await api.database.remove(databasePath);
        const exists = await api.database.exists(databasePath);
        chai.expect(exists).to.equal(false);
        await api.database.remove(databasePath);
        const exists2 = await api.database.exists(databasePath);
        chai.expect(exists2).to.equal(false);
    });
    it("create database", async () => {
        await api.database.remove(databasePath);
        const existsBad = await api.database.exists(databasePath);
        chai.expect(existsBad).to.equal(false);
        await api.database.create(databasePath);
        const exists = await api.database.exists(databasePath);
        chai.expect(exists).to.equal(true);
        await api.database.create(databasePath);
        chai.expect(exists).to.equal(true);
    });
    it("reset database", async () => {
        await api.database.reset(databasePath);
        const exists1 = await api.database.exists(databasePath);
        chai.expect(exists1).to.equal(true);
        await api.database.reset(databasePath);
        const exists2 = await api.database.exists(databasePath);
        chai.expect(exists2).to.equal(true);
    });
});

describe("api account", () => {
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
        const accountExists = await api.database.account.exists(databasePath, accountId, {
            id: accountId
        });
        chai.expect(accountExists).to.equal(true);
        const accountExistsBad = await api.database.account.exists(databasePath, accountId, {
            id: 99999
        });
        chai.expect(accountExistsBad).to.equal(false);
    });
    it("exists (name)", async () => {
        await api.database.reset(databasePath);
        const accountName = "TestUser";
        const accountId = await api.database.account.create(databasePath, {
            name: accountName,
            password: "password"
        });
        const accountExists = await api.database.account.existsName(databasePath, accountId, {
            name: accountName
        });
        chai.expect(accountExists).to.equal(true);
        const accountExistsBad = await api.database.account.existsName(databasePath, accountId, {
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
        const loginCheckBadName = await api.database.account.checkLogin(databasePath, {
            name: accountName + "bad",
            password: accountPassword
        });
        chai.expect(loginCheckBadName).to.equal(undefined);
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
        const accountExists = await api.database.account.exists(databasePath, accountId, {
            id: accountId
        });
        chai.expect(accountExists).to.equal(false);
        const accountRemovedButDoesNotExist = await api.database.account.remove(databasePath, accountId, {
            id: accountId
        });
        chai.expect(accountRemovedButDoesNotExist).to.equal(false);
    });
});

describe("api document", () => {
    it("create", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const documentId = await api.database.document.create(databasePath, accountId, {
            content: "content", title: "title"
        });
        chai.expect(documentId).to.be.an("number");
        const documentId2 = await api.database.document.create(databasePath, accountId, {
            authors: "authors", content: "content", date: "date", public: true, title: "title"
        });
        chai.expect(documentId2).to.be.an("number");
    });
    it("exists", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const documentId = await api.database.document.create(databasePath, accountId, {
            content: "content", title: "title"
        });
        const documentExists = await api.database.document.exists(databasePath, accountId, {
            id: documentId
        });
        chai.expect(documentExists).to.equal(true);
        const documentExistsBad = await api.database.document.exists(databasePath, accountId, {
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
            content: "content", title: "title"
        });
        const documentRemoved = await api.database.document.remove(databasePath, accountId, {
            id: documentId
        });
        chai.expect(documentRemoved).to.equal(true);
        const documentExists = await api.database.document.exists(databasePath, accountId, {
            id: documentId
        });
        chai.expect(documentExists).to.equal(false);
        const documentRemovedButNotExists = await api.database.document.remove(databasePath, accountId, {
            id: documentId
        });
        chai.expect(documentRemovedButNotExists).to.equal(false);
    });
});

describe("api group", () => {
    it("create", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const groupId = await api.database.group.create(databasePath, accountId, {
            name: "name"
        });
        chai.expect(groupId).to.be.an("number");
        const groupId2 = await api.database.group.create(databasePath, accountId, {
            name: "name", public: false
        });
        chai.expect(groupId2).to.be.an("number");
    });
    it("exists", async () => {
        await api.database.reset(databasePath);
        const accountId = await api.database.account.create(databasePath, {
            admin: true, name: "TestUserAdmin", password: "passwordAdmin"
        });
        const groupId = await api.database.group.create(databasePath, accountId, {
            name: "name"
        });
        const groupExists = await api.database.group.exists(databasePath, accountId, {
            id: groupId
        });
        chai.expect(groupExists).to.equal(true);
        const groupExistsBad = await api.database.group.exists(databasePath, accountId, {
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
            name: "name"
        });
        const groupRemoved = await api.database.group.remove(databasePath, accountId, {
            id: groupId
        });
        chai.expect(groupRemoved).to.equal(true);
        const groupExists = await api.database.group.exists(databasePath, accountId, {
            id: groupId
        });
        chai.expect(groupExists).to.equal(false);
        const groupRemovedButNotExists = await api.database.group.remove(databasePath, accountId, {
            id: groupId
        });
        chai.expect(groupRemovedButNotExists).to.equal(false);
    });
});
