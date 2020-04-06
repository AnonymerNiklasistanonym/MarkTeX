import api from "../../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";

import type { Express } from "express";


chai.use(chaiHttp);
chai.should();


export default (databasePath: string, APP: Express): Mocha.Suite => {
    return describe("browser", () => {
        describe("GET (not logged in)", () => {
            api.database.reset(databasePath);
            it("/ (home)", async () => {
                await chai.request(APP)
                    .get("/")
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
            it("/login (login/register)", async () => {
                await chai.request(APP)
                    .get("/login")
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
            it("invalid routes", async () => {
                await chai.request(APP)
                    .get("/account45")
                    .then(res => {
                        res.should.have.status(404);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
                await chai.request(APP)
                    .get("/abc")
                    .then(res => {
                        res.should.have.status(404);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
        });
        describe("POST (not logged in)", () => {
            it("/account_login (login)", async () => {
                await api.database.reset(databasePath);
                const testAccountName = "TestUser";
                const testAccountPassword = "TestUserPassword";
                await api.database.account.create(databasePath, {
                    name: testAccountName, password: testAccountPassword
                });

                // Test if error is thrown
                await chai.request(APP)
                    .post("/account_login")
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("text/html");
                    });
                await chai.request(APP)
                    .post("/account_login")
                    .send({
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("text/html");
                    });
                // Redirect to login page with message
                await chai.request(APP)
                    .post("/account_login")
                    .send({
                        name: "ab",
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                    });

                await chai.request(APP)
                    .post("/account_login")
                    .type("form")
                    .send({
                        name: testAccountName,
                        password: testAccountPassword
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                    });
            });
            it("/account_register (register)", async () => {
                // Test if error is thrown
                await chai.request(APP)
                    .post("/account_register")
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("text/html");
                    });
                await chai.request(APP)
                    .post("/account_register")
                    .send({
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("text/html");
                    });
                // Redirect to login page with message
                await chai.request(APP)
                    .post("/account_register")
                    .send({
                        name: "ab",
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                    });

                await chai.request(APP)
                    .post("/account_register")
                    .type("form")
                    .send({
                        name: "TestNew",
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                    });
            });
        });
    });
};
