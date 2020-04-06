import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";


chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("account", () => {
        it("/api/account/login (login)", async () => {
            await api.database.reset(databasePath);
            const testAccountName = "TestUser";
            const testAccountPassword = "TestUserPassword";
            const testAccountId = await api.database.account.create(databasePath, {
                name: testAccountName, password: testAccountPassword
            });

            await chai.request(APP)
                .post("/api/account/login")
                .send({
                    apiVersion: 1,
                    name: testAccountName,
                    password: testAccountPassword
                })
                .then(res => {
                    res.should.have.status(200);
                    res.type.should.be.equal("application/json");
                    res.body.should.be.deep.equal({
                        id: testAccountId
                    });
                });
        });
        it("/api/account/register (register)", async () => {
            await api.database.reset(databasePath);
            const testAccountName = "TestUser";
            const testAccountPassword = "TestUserPassword";

            await chai.request(APP)
                .post("/api/account/register")
                .send({
                    apiVersion: 1,
                    name: testAccountName,
                    password: testAccountPassword
                })
                .then(res => {
                    res.should.have.status(200);
                    res.type.should.be.equal("application/json");
                    res.body.id.should.be.a("number");
                });
        });
        it("/api/account/get (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountName = "TestUser";
            const testAccountPassword = "TestUserPassword";
            const testAccountId = await api.database.account.create(databasePath, {
                name: testAccountName, password: testAccountPassword
            });

            const chaiAgent = chai.request.agent(APP);

            await chaiAgent
                .post("/api/account/login")
                .send({
                    apiVersion: 1,
                    name: testAccountName,
                    password: testAccountPassword
                })
                .then();

            await chaiAgent
                .post("/api/account/get")
                .send({
                    apiVersion: 1,
                    id: testAccountId
                })
                .then(res => {
                    res.should.have.status(200);
                    res.type.should.be.equal("application/json");
                    res.body.should.be.deep.equal({
                        admin: false,
                        id: testAccountId,
                        name: testAccountName,
                        public: false
                    });
                });
        });
    });
};
