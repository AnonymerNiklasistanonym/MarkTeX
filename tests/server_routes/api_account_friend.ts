import type * as apiRequests from "../../src/routes/api";
import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";

chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("account friend", () => {
        const testAccountCredentials = {
            name: "TestUser",
            password: "TestUserPassword"
        };
        const testFriendAccountCredentials = {
            name: "TestUserFriend",
            password: "TestUserFriendPassword"
        };
        const loginRequest: apiRequests.account.LoginRequestApi = {
            apiVersion: 1,
            ... testAccountCredentials
        };

        it("/api/account_friend/add    (add)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testFriendAccountId = await api.database.account.create(databasePath, testFriendAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const addRequest: apiRequests.accountFriend.AddRequestApi = {
                accountId: testAccountId,
                apiVersion: 1,
                friendAccountId: testFriendAccountId
            };
            await chaiAgent.post("/api/account_friend/add").send(addRequest).then(res => {
                console.warn(res.text);
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const addResponse = res.body as apiRequests.accountFriend.AddResponse;
                addResponse.id.should.be.a("number");
                addResponse.should.be.deep.equal({
                    accountId: testAccountId,
                    accountName: testAccountCredentials.name,
                    friendAccountId: testFriendAccountId,
                    friendAccountName: testFriendAccountCredentials.name,
                    id: addResponse.id
                });
            });
        });
        it("/api/account_friend/get    (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testFriendAccountId = await api.database.account.create(databasePath, testFriendAccountCredentials);
            const testAccountFriendEntryId = await api.database.accountFriend.create(databasePath, testAccountId, {
                accountId: testAccountId, friendAccountId: testFriendAccountId
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const getRequest: apiRequests.accountFriend.GetRequestApi = {
                apiVersion: 1,
                id: testAccountFriendEntryId
            };
            await chaiAgent.post("/api/account_friend/get").send(getRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse = res.body as apiRequests.accountFriend.GetResponse;
                getResponse.should.be.deep.equal({
                    accountId: testAccountId,
                    friendId: testFriendAccountId,
                    id: testAccountFriendEntryId
                });
            });
        });
        it("/api/account_friend/remove (remove)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testFriendAccountId = await api.database.account.create(databasePath, testFriendAccountCredentials);
            const testAccountFriendEntryId = await api.database.accountFriend.create(databasePath, testAccountId, {
                accountId: testAccountId, friendAccountId: testFriendAccountId
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const removeRequest: apiRequests.accountFriend.RemoveRequestApi = {
                apiVersion: 1,
                id: testAccountFriendEntryId
            };
            await chaiAgent.post("/api/account_friend/remove").send(removeRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const removeResponse = res.body as apiRequests.accountFriend.RemoveResponse;
                removeResponse.should.be.deep.equal({
                    id: testAccountFriendEntryId
                });
            });
        });
    });
};
