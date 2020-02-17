import tap from "tap";

tap.pass("this is fine");

const doSomethingAsync = async () => {
    return new Promise(resolve => {
        setTimeout(() => resolve({ ok: true, message: /dogs/ }), 100);
    });
};


tap.test("dogs should be ok", async t => {
    const result = await doSomethingAsync();
    t.match(result, { ok: true, message: /dogs/ }, "dogs are ok");
    // Or you can use any assertion lib you like.  as long as this
    // code doesn't throw an error, it's a pass!
});
