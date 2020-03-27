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
        await api.database.createDatabase(databasePath);
        const exists = await api.database.exists(databasePath);
        chai.expect(exists).to.equal(true);
        await api.database.createDatabase(databasePath);
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
    it("create account", async () => {
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
    it("exists account", async () => {
        await api.database.reset(databasePath);
        const accountName = "TestUser";
        await api.database.account.create(databasePath, {
            name: accountName,
            password: "password"
        });
        const accountExists = await api.database.account.exists(databasePath, {
            name: accountName
        });
        chai.expect(accountExists).to.equal(true);
        const accountExistsBad = await api.database.account.exists(databasePath, {
            name: "does not exist"
        });
        chai.expect(accountExistsBad).to.equal(false);
    });
    it("login account", async () => {
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
    it("delete account", async () => {
        await api.database.reset(databasePath);
        const accountName = "TestUser";
        await api.database.account.create(databasePath, {
            name: accountName,
            password: "password"
        });
        await api.database.account.remove(databasePath, {
            name: accountName
        });
        const accountExists = await api.database.account.exists(databasePath, {
            name: accountName
        });
        chai.expect(accountExists).to.equal(false);
    });
});
