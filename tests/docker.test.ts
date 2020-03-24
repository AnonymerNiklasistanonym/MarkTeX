import * as chai from "chai";
import { describe } from "mocha";
import * as docker from "../src/modules/docker";

describe("docker api", () => {
    it("create docker file", () => {
        const dockerfileString = docker.createDockerfile({
            image: "pandoc/latex:2.9.2",
            workdir: "/usr/src",
            commands: [
                "RUN apk add --update make",
                "COPY ./ ./"
            ],
            entrypoint: ["make"],
            cmd: ["pdf"]
        });
        chai.expect(dockerfileString).to.be.a("string");
        chai.assert(dockerfileString.length > 0);
        chai.expect(dockerfileString).deep.equal(
            `# Auto generated Dockerfile v${docker.createDockerfileVersion}\n`
            + "\n"
            + "FROM pandoc/latex:2.9.2\n"
            + "WORKDIR /usr/src\n"
            + "\n"
            + "RUN apk add --update make\n"
            + "COPY ./ ./\n"
            + "\n"
            + "ENTRYPOINT [ \"make\" ]\n"
            + "CMD [ \"pdf\" ]\n"
        );
    });
});
