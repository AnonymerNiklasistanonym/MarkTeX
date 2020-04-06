import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";


chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("group", () => {
        it("/api/group/get (get)", async () => {
            await api.database.reset(databasePath);
            const testAccountName = "TestUser";
            const testAccountPassword = "TestUserPassword";
            const testAccountId = await api.database.account.create(databasePath, {
                name: testAccountName, password: testAccountPassword
            });
            const testGroupName = "TestGroup";
            const testGroupId = await api.database.group.create(databasePath, testAccountId, {
                name: testGroupName, owner: testAccountId
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
                .post("/api/group/get")
                .send({
                    apiVersion: 1,
                    id: testGroupId
                })
                .then(res => {
                    res.should.have.status(200);
                    res.type.should.be.equal("application/json");
                    res.body.should.be.deep.equal({
                        id: testGroupId,
                        name: testGroupName,
                        owner: testAccountId,
                        public: false
                    });
                });
        });
    });
};
