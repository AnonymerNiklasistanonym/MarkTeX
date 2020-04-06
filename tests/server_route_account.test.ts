import * as expressApp from "../src/config/express";
import api from "../src/modules/api";
import chai from "chai";
import chaiHttp from "chai-http";
import expressSession from "express-session";
import os from "os";
import path from "path";


const databasePath = path.join(os.tmpdir(), "test.db");

const sessionMiddleware = expressSession({
    resave: false,
    saveUninitialized: true,
    secret: "secret"
});

const APP = expressApp.getExpressServer({ databasePath, production: true }, { sessionMiddleware });

chai.use(chaiHttp);
chai.should();

describe("server", () => {
    describe("browser routes", () => {
        describe("GET (not logged in)", () => {
            api.database.reset(databasePath);
            it("home", async () => {
                await chai.request(APP)
                    .get("/")
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
            it("login/register", async () => {
                await chai.request(APP)
                    .get("/login")
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
            it("invalid", async () => {
                await chai.request(APP)
                    .get("/account45")
                    .then(res => {
                        res.should.have.status(404);
                        res.type.should.be.equal("text/html");
                        res.text.should.be.a("string");
                    });
            });
        });
        describe("POST (not logged in)", () => {
            it("login (no form)", async () => {
                // Test if error is thrown
                await chai.request(APP)
                    .post("/account_login")
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("application/json");
                    });
            });
            it("login", async () => {
                await chai.request(APP)
                    .post("/account_login")
                    .type("form")
                    .send({
                        name: "Test",
                        password: "12345678"
                    })
                    .then(res => {
                        res.should.have.status(200);
                        res.type.should.be.equal("text/html");
                    });
            });
            it("register (no form)", async () => {
                // Test if error is thrown
                await chai.request(APP)
                    .post("/account_register")
                    .then(res => {
                        res.should.have.status(422);
                        res.type.should.be.equal("application/json");
                    });
            });
            it("register", async () => {
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

    describe("api", () => {
        describe("account", () => {
            it("login", async () => {
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
            it("register", async () => {
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
            it("get", async () => {
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
    });
});
