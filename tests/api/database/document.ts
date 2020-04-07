import api from "../../../src/modules/api";
import chai from "chai";


export default (databasePath: string): Mocha.Suite => {
    return describe("document", () => {
        it("create", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const documentId = await api.database.document.create(databasePath, accountId, {
                content: "content", owner: accountId, title: "title"
            });
            chai.expect(documentId).to.be.an("number");
            const documentId2 = await api.database.document.create(databasePath, accountId, {
                authors: "authors", content: "content", date: "date", owner: accountId, public: true, title: "title"
            });
            chai.expect(documentId2).to.be.an("number");
        });
        it("exists", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const documentId = await api.database.document.create(databasePath, accountId, {
                content: "content", owner: accountId, title: "title"
            });
            const documentExists = await api.database.document.exists(databasePath, {
                id: documentId
            });
            chai.expect(documentExists).to.equal(true);
            const documentExistsBad = await api.database.document.exists(databasePath, {
                id: 983474358
            });
            chai.expect(documentExistsBad).to.equal(false);
        });
        it("delete", async () => {
            await api.database.reset(databasePath);
            const accountId = await api.database.account.create(databasePath, {
                admin: true, name: "TestUserAdmin", password: "passwordAdmin"
            });
            const documentId = await api.database.document.create(databasePath, accountId, {
                content: "content", owner: accountId, title: "title"
            });
            const documentRemoved = await api.database.document.remove(databasePath, accountId, {
                id: documentId
            });
            chai.expect(documentRemoved).to.equal(true);
            const documentExists = await api.database.document.exists(databasePath, {
                id: documentId
            });
            chai.expect(documentExists).to.equal(false);
            let throwsException = false;
            try {
                await api.database.document.remove(databasePath, accountId, {
                    id: documentId
                });
            } catch (error) {
                throwsException = true;
                chai.expect((error as Error).message).to.equal(api.database.document.GeneralError.NOT_EXISTING);
            }
            chai.expect(throwsException).to.equal(true);
        });
    });
};
