import * as chai from "chai";
import { describe } from "mocha";
import * as inkscape from "../src/modules/inkscape";

describe("inkscape api", () => {
    it("version", async () => {
        const version = await inkscape.getVersion();
        chai.expect(version.fullText).to.be.a("string");
        chai.assert(version.fullText.length > 0);
        chai.expect(version.commit).to.be.a("string");
        chai.assert(version.commit.length > 0);
        chai.expect(version.date).to.be.a("Date");
        chai.expect(version.major).to.be.a("number");
        chai.expect(version.major % 1).to.equal(0);
        chai.expect(version.minor).to.be.a("number");
        chai.expect(version.minor % 1).to.equal(0);
    });
});
