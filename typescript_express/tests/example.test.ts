import * as chai from "chai";
import { describe } from "mocha";

describe("a test case", () => {
    it("add", () => {
        if (22 > 10) {
            chai.expect(4 + 3).equal(7);
            chai.expect("this is fine").equal("this is fine");
        }
    });
});

interface TestReturnVal {
    ok: boolean
    message: RegExp
}

const doSomethingAsync = async (): Promise<TestReturnVal> => {
    return new Promise(resolve => {
        setTimeout(() => resolve({ ok: true, message: /dogs/ }), 100);
    });
};


describe("dogs should be ok", () => {
    it("add", async () => {
        const result = await doSomethingAsync();
        chai.expect(result).to.deep.equal({ ok: true, message: /dogs/ });
    });
});
