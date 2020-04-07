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
        const loginRequest: apiRequests.account.types.LoginRequestApi = {
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
            const getRequest: apiRequests.group.types.GetRequestApi = {
                apiVersion: 1,
                id: testGroupId
            };
            await chaiAgent.post("/api/group/get").send(getRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse: apiRequests.group.types.GetResponse = res.body;
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
            const createRequest: apiRequests.group.types.CreateRequestApi = {
                apiVersion: 1,
                name: testGroupName,
                owner: testAccountId
            };
            await chaiAgent.post("/api/group/create").send(createRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const createResponse: apiRequests.group.types.CreateResponse = res.body;
                createResponse.id.should.be.a("number");
                delete createResponse.id;
                createResponse.should.be.deep.equal({
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
            const removeRequest: apiRequests.group.types.RemoveRequestApi = {
                apiVersion: 1,
                id: testGroupId
            };
            await chaiAgent.post("/api/group/remove").send(removeRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const removeResponse: apiRequests.group.types.RemoveResponse = res.body;
                removeResponse.id.should.be.a("number");
                delete removeResponse.id;
                removeResponse.should.be.deep.equal({});
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
            const updateRequest: apiRequests.group.types.UpdateRequestApi = {
                apiVersion: 1,
                id: testGroupId,
                name: newName,
                public: newPublicValue
            };
            await chaiAgent.post("/api/group/update").send(updateRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const updateResponse: apiRequests.group.types.UpdateResponse = res.body;
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
