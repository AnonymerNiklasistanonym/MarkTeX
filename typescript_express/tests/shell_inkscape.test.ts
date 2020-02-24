import * as chai from "chai";
import { describe } from "mocha";
import * as inkscape from "../src/shell/inkscape";

describe("inkscape api", () => {
    it("version", async () => {
        const version = await inkscape.getVersion();
        chai.expect(version.output).to.be.a("string");
        chai.assert(version.output.length > 0);
        chai.expect(version.versionCommit).to.be.a("string");
        chai.assert(version.versionCommit.length > 0);
        chai.expect(version.versionDate).to.be.a("Date");
        chai.expect(version.versionMajor).to.be.a("number");
        chai.expect(version.versionMajor % 1).to.equal(0);
        chai.expect(version.versionMinor).to.be.a("number");
        chai.expect(version.versionMinor % 1).to.equal(0);
    });
});
