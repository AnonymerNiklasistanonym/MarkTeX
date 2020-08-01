import type * as apiRequests from "../../src/routes/api";
import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";


chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("group", () => {
        const testAccountCredentials = {
            name: "TestUser",
            password: "TestUserPassword"
        };
        const loginRequest: apiRequests.account.LoginRequestApi = {
            apiVersion: 1,
            ... testAccountCredentials
        };
        const testGroupName = "TestGroup";

        it("/api/group/get    (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testGroupId = await api.database.group.create(databasePath, testAccountId, {
                name: testGroupName, owner: testAccountId
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const getRequest: apiRequests.group.GetRequestApi = {
                apiVersion: 1,
                id: testGroupId
            };
            await chaiAgent.post("/api/group/get").send(getRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse = res.body as apiRequests.group.GetResponse;
                getResponse.should.be.deep.equal({
                    id: testGroupId,
                    name: testGroupName,
                    owner: testAccountId,
                    public: false
                });
            });
        });
        it("/api/group/create (create)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const createRequest: apiRequests.group.CreateRequestApi = {
                apiVersion: 1,
                name: testGroupName,
                owner: testAccountId
            };
            await chaiAgent.post("/api/group/create").send(createRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const createResponse = res.body as apiRequests.group.CreateResponse;
                createResponse.id.should.be.a("number");
                createResponse.should.be.deep.equal({
                    id: createResponse.id,
                    name: testGroupName,
                    owner: testAccountId,
                    public: false
                });
            });
        });
        it("/api/group/remove (remove)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testGroupId = await api.database.group.create(databasePath, testAccountId, {
                name: testGroupName, owner: testAccountId
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const removeRequest: apiRequests.group.RemoveRequestApi = {
                apiVersion: 1,
                id: testGroupId
            };
            await chaiAgent.post("/api/group/remove").send(removeRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const removeResponse = res.body as apiRequests.group.RemoveResponse;
                removeResponse.id.should.be.a("number");
                removeResponse.should.be.deep.equal({
                    id: removeResponse.id
                });
            });
        });
        it("/api/group/update (update)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testGroupId = await api.database.group.create(databasePath, testAccountId, {
                name: testGroupName, owner: testAccountId
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const newName = "NewName";
            const newPublicValue = false;
            const updateRequest: apiRequests.group.UpdateRequestApi = {
                apiVersion: 1,
                id: testGroupId,
                name: newName,
                public: newPublicValue
            };
            await chaiAgent.post("/api/group/update").send(updateRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const updateResponse = res.body as apiRequests.group.UpdateResponse;
                updateResponse.should.be.deep.equal({
                    id: testGroupId,
                    name: newName,
                    owner: testAccountId,
                    public: newPublicValue
                });
            });
        });
    });
};
