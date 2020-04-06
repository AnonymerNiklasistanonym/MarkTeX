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

describe("server routes", () => {
    describe("GET", () => {
        api.database.reset(databasePath);
        it("home", (done) => {
            chai.request(APP)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.be.equal("text/html");
                    res.text.should.be.a("string");
                    done();
                });
        });
        it("login/register", (done) => {
            chai.request(APP)
                .get("/login")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.be.equal("text/html");
                    res.text.should.be.a("string");
                    done();
                });
        });
        it("invalid", (done) => {
            chai.request(APP)
                .get("/account45")
                .end((err, res) => {
                    res.should.have.status(404);
                    res.type.should.be.equal("text/html");
                    res.text.should.be.a("string");
                    done();
                });
        });
    });
    describe("POST", () => {
        api.database.reset(databasePath);
        it("login (no form)", (done) => {
            // Test if error is thrown
            chai.request(APP)
                .post("/account_login")
                .end((err, res) => {
                    res.should.have.status(422);
                    res.type.should.be.equal("application/json");
                    done();
                });
        });
        it("login", (done) => {
            chai.request(APP)
                .post("/account_login")
                .type("form")
                .send({
                    _method: "post",
                    name: "Test",
                    password: "12345678"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.be.equal("text/html");
                    done();
                });
        });
        it("register (no form)", (done) => {
            // Test if error is thrown
            chai.request(APP)
                .post("/account_register")
                .end((err, res) => {
                    res.should.have.status(422);
                    res.type.should.be.equal("application/json");
                    done();
                });
        });
        it("register", (done) => {
            chai.request(APP)
                .post("/account_register")
                .type("form")
                .send({
                    _method: "post",
                    name: "TestNew",
                    password: "12345678"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.be.equal("text/html");
                    done();
                });
        });
    });
});
