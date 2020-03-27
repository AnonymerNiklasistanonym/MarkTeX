import * as inkscape from "../src/modules/inkscape";
import chai from "chai";
import { describe } from "mocha";


describe("inkscape api [shell]", () => {
    it("version", async () => {
        const version = await inkscape.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.expect(version.fullText.length).to.be.greaterThan(0);
        chai.expect(version.commit).to.be.a("string");
        chai.expect(version.commit.length).to.be.greaterThan(0);
        chai.expect(version.date).to.be.a("Date");
        chai.expect(version.major).to.be.a("number");
        chai.expect(version.major).to.satisfy(Number.isInteger);
        chai.expect(version.minor).to.be.a("number");
        chai.expect(version.minor).to.satisfy(Number.isInteger);
        chai.expect(version.patch).to.be.a("string");
        chai.expect(version.patch.length).to.be.greaterThan(0);
    });
});
