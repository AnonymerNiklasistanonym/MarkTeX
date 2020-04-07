import type * as apiRequests from "../../src/routes/api";
import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";


chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("document", () => {
        const testAccountCredentials = {
            name: "TestUser",
            password: "TestUserPassword"
        };
        const loginRequest: apiRequests.account.types.LoginRequestApi = {
            apiVersion: 1,
            ... testAccountCredentials
        };
        const testDocumentName = "TestDocument";
        const testDocumentContent = "TestDocumentContent";

        it("/api/document/get    (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testDocumentId = await api.database.document.create(databasePath, testAccountId, {
                content: testDocumentContent, owner: testAccountId, title: testDocumentName
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const getRequest: apiRequests.document.types.GetRequestApi = {
                apiVersion: 1,
                id: testDocumentId
            };
            await chaiAgent.post("/api/document/get").send(getRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const getResponse: apiRequests.document.types.GetResponse = res.body;
                getResponse.should.be.deep.equal({
                    id: testDocumentId,
                    owner: testAccountId,
                    public: false,
                    title: testDocumentName
                });
            });
        });
        it("/api/document/create (create)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const createRequest: apiRequests.document.types.CreateRequestApi = {
                apiVersion: 1,
                content: testDocumentContent,
                owner: testAccountId,
                title: testDocumentName
            };
            await chaiAgent.post("/api/document/create").send(createRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const createResponse: apiRequests.document.types.CreateResponse = res.body;
                createResponse.id.should.be.a("number");
                delete createResponse.id;
                createResponse.should.be.deep.equal({
                    owner: testAccountId,
                    public: false,
                    title: testDocumentName
                });
            });
        });
        it("/api/document/remove (remove)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testDocumentId = await api.database.document.create(databasePath, testAccountId, {
                content: testDocumentContent, owner: testAccountId, title: testDocumentName
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const removeRequest: apiRequests.document.types.RemoveRequestApi = {
                apiVersion: 1,
                id: testDocumentId
            };
            await chaiAgent.post("/api/document/remove").send(removeRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const removeResponse: apiRequests.document.types.RemoveResponse = res.body;
                removeResponse.id.should.be.a("number");
                delete removeResponse.id;
                removeResponse.should.be.deep.equal({});
            });
        });
        it("/api/document/update (update)", async () => {
            await api.database.reset(databasePath);
            const testAccountId = await api.database.account.create(databasePath, testAccountCredentials);
            const testDocumentId = await api.database.document.create(databasePath, testAccountId, {
                content: testDocumentContent, owner: testAccountId, title: testDocumentName
            });

            const chaiAgent = chai.request.agent(APP);
            await chaiAgent.post("/api/account/login").send(loginRequest).then();
            const newTitle = "NewTitle";
            const newDate = "NewDate";
            const newAuthors = "NewAuthors";
            const newContent = "NewContent";
            const newPublicValue = true;
            const updateRequest: apiRequests.document.types.UpdateRequestApi = {
                apiVersion: 1,
                authors: newAuthors,
                content: newContent,
                date: newDate,
                id: testDocumentId,
                public: newPublicValue,
                title: newTitle
            };
            await chaiAgent.post("/api/document/update").send(updateRequest).then(res => {
                res.should.have.status(200);
                res.type.should.be.equal("application/json");
                const updateResponse: apiRequests.document.types.UpdateResponse = res.body;
                updateResponse.should.be.deep.equal({
                    authors: newAuthors,
                    date: newDate,
                    id: testDocumentId,
                    owner: testAccountId,
                    public: newPublicValue,
                    title: newTitle
                });
            });
        });
    });
};
