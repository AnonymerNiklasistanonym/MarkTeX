import * as make from "../src/modules/make";
import chai from "chai";
import { describe } from "mocha";


describe("make", () => {
    it("create Makefile", () => {
        const makeFileStringEmpty = make.createMakefile({
            definitions: [],
            jobs: []
        });
        chai.expect(makeFileStringEmpty).to.be.a("string");
        chai.assert(makeFileStringEmpty.length > 0);
        chai.expect(makeFileStringEmpty).deep.equal(
            `# Auto generated Makefile v${make.createMakefileVersion}\n`
            + "\n"
            + "all:\n"
        );

        const makeFileString = make.createMakefile({
            definitions: [ {
                name: "SOURCE_FILES",
                value: "a.txt b.md c.troll"
            }, {
                name: "ARGS",
                value: "--a --b --c"
            } ],
            jobs: [ {
                commands: ["command"],
                default: true,
                dependencies: [ "dependency", "another dependency" ],
                name: "defaultJob"
            },{
                commands: [ "command","anotherCommand" ],
                name: "jobWithNoDependencies"
            } ]
        });
        chai.expect(makeFileString).to.be.a("string");
        chai.assert(makeFileString.length > 0);
        chai.expect(makeFileString).deep.equal(
            `# Auto generated Makefile v${make.createMakefileVersion}\n`
            + "SOURCE_FILES = a.txt b.md c.troll\n"
            + "ARGS = --a --b --c\n"
            + "\n"
            + "all: defaultJob\n"
            + "\n"
            + "defaultJob: dependency another dependency\n"
            + "\tcommand\n"
            + "\n"
            + "jobWithNoDependencies:\n"
            + "\tcommand\n"
            + "\tanotherCommand\n"
        );
    });
});
