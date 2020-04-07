import chai from "chai";
import crypto from "../src/modules/crypto";
import { describe } from "mocha";


describe("crypto", () => {
    it("generate salt", () => {
        const salt = crypto.generateSalt();
        chai.expect(salt).to.be.a("string");
        chai.expect(salt.length).to.equal(4096);

        const salt4096 = crypto.generateSalt(4096);
        chai.expect(salt4096).to.be.a("string");
        chai.expect(salt4096.length).to.equal(4096);

        const salt2048 = crypto.generateSalt(2048);
        chai.expect(salt2048).to.be.a("string");
        chai.expect(salt2048.length).to.equal(2048);
    });
    it("generate salt and hash", () => {
        const hashAndSalt1 = crypto.generateHashAndSalt("superSecurePassword");
        chai.expect(hashAndSalt1.hash).to.be.a("string");
        chai.expect(hashAndSalt1.salt).to.be.a("string");
        chai.expect(hashAndSalt1.hash.length).to.equal(128);
        chai.expect(hashAndSalt1.salt.length).to.equal(4096);

        const hashAndSalt2 = crypto.generateHashAndSalt("anotherSuperSecurePassword");
        chai.expect(hashAndSalt2.hash).to.be.a("string");
        chai.expect(hashAndSalt2.salt).to.be.a("string");
        chai.expect(hashAndSalt2.hash.length).to.equal(128);
        chai.expect(hashAndSalt2.salt.length).to.equal(4096);

        const hashAndSalt3 = crypto.generateHashAndSalt("anotherSuperSecurePassword", 2048);
        chai.expect(hashAndSalt3.hash).to.be.a("string");
        chai.expect(hashAndSalt3.salt).to.be.a("string");
        chai.expect(hashAndSalt3.hash.length).to.equal(128);
        chai.expect(hashAndSalt3.salt.length).to.equal(2048);
    });
    it("password check", () => {
        const password = "superSecurePasswordTest";
        const hashAndSalt = crypto.generateHashAndSalt(password);
        const passwordCorrect = crypto.checkPassword(password, hashAndSalt);
        chai.expect(passwordCorrect).to.be.a("boolean");
        chai.expect(passwordCorrect).to.equal(true);

        const similarPassword = "superSecurePasswordTesT";
        const passwordCorrectButFalse = crypto.checkPassword(similarPassword, hashAndSalt);
        chai.expect(passwordCorrectButFalse).to.be.a("boolean");
        chai.expect(passwordCorrectButFalse).to.equal(false);
    });
});
