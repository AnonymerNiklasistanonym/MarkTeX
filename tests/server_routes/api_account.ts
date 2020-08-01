import type * as apiRequests from "../../src/routes/api";
import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";

chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("account", () => {
        const testAccountCredentials = {
            name: "TestUser",
            password: "TestUserPassword"
        };
        const loginRequest: apiRequests.account.LoginRequestApi = {
            apiVersion: 1,
            ... testAccountCredentials
        };
        const createRequest: apiRequests.account.CreateRequestApi = {
            apiVersion: 1,
            ... testAccountCredentials
        };

        it("/api/account/login  (login)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            await chai.request(APP).post("/api/account/login").send(loginRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const loginResponse = res.body as apiRequests.account.LoginResponse;
                loginResponse.should.be.deep.equal({
                    id: testAccountId
                });
            });
        });
        it("/api/account/create (create)", async () => {
            await api.database.reset(databasePath);

            await chai.request(APP).post("/api/account/create").send(createRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const createResponse = res.body as apiRequests.account.CreateResponse;
                createResponse.id.should.be.a("number");
                createResponse.should.be.deep.equal({ id: createResponse.id });
            });
        });
        it("/api/account/get    (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const getRequest: apiRequests.account.GetRequestApi = {
                apiVersion: 1,
                id: testAccountId
            };
            await chaiAgent.post("/api/account/get").send(getRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse = res.body as apiRequests.account.GetResponse;
                getResponse.should.be.deep.equal({
                    admin: false,
                    id: testAccountId,
                    name: testAccountCredentials.name,
                    public: false
                });
            });
        });
        it("/api/account/remove  (remove)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const removeRequest: apiRequests.account.RemoveRequestApi = {
                apiVersion: 1,
                id: testAccountId
            };
            await chaiAgent.post("/api/account/remove").send(removeRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse = res.body as apiRequests.account.RemoveResponse;
                getResponse.should.be.deep.equal({
                    id: testAccountId
                });
            });
        });
        it("/api/account/update  (update)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const newName = "NewName";
            const newPublic = true;
            const updateRequest: apiRequests.account.UpdateRequestApi = {
                apiVersion: 1,
                currentPassword: testAccountCredentials.password,
                id: testAccountId,
                name: newName,
                public: newPublic
            };
            await chaiAgent.post("/api/account/update").send(updateRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const updateResponse = res.body as apiRequests.account.UpdateRequestApi;
                updateResponse.should.be.deep.equal({
                    admin: false,
                    id: testAccountId,
                    name: newName,
                    public: newPublic
                });
            });

            // Test if current password is correctly checked
            const updateRequestBad: apiRequests.account.UpdateRequestApi = {
                apiVersion: 1,
                currentPassword: testAccountCredentials.password + "bad",
                id: testAccountId,
                name: newName
            };
            await chaiAgent.post("/api/account/update").send(updateRequestBad).then(res => {
                res.should.have.status(500);
                res.type.should.be.equal("application/json");
            });

            // Test if password can be changed
            const newPassword = "NewPassword";
            const updateRequestNewPassword: apiRequests.account.UpdateRequestApi = {
                apiVersion: 1,
                currentPassword: testAccountCredentials.password,
                id: testAccountId,
                password: newPassword
            };
            await chaiAgent.post("/api/account/update").send(updateRequestNewPassword).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
            });
            const passwordCorrect = await api.database.account.checkLoginId(databasePath, {
                id: testAccountId, password: newPassword
            });
            chai.expect(passwordCorrect).to.be.equal(true);
        });
    });
};
