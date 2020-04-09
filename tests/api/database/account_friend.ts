import api from "../../../src/modules/api";
import chai from "chai";


export default (databasePath: string): Mocha.Suite => {
    return describe("account friend", () => {
        it("create", async () => {
            await api.database.reset(databasePath);
            const accountId1 = await api.database.account.create(databasePath, {
                name: "TestUser",
                password: "password"
            });
            const accountIdFriend1 = await api.database.account.create(databasePath, {
                name: "TestUserFriend1",
                password: "passwordFriend1"
            });
            const accountIdFriend2 = await api.database.account.create(databasePath, {
                name: "TestUserFriend2",
                password: "passwordFriend2"
            });

            const accountFriendId1 = await api.database.accountFriend.create(databasePath, accountId1, {
                accountId: accountId1,
                friendAccountId: accountIdFriend1
            });
            chai.expect(accountFriendId1).to.be.an("number");
            const accountFriendId2 = await api.database.accountFriend.create(databasePath, accountId1, {
                accountId: accountId1,
                friendAccountId: accountIdFriend2
            });
            chai.expect(accountFriendId2).to.be.an("number");

            let throwsException = false;
            try {
                await api.database.accountFriend.create(databasePath, accountId1, {
                    accountId: accountId1,
                    friendAccountId: accountIdFriend2
                });
            } catch (error) {
                throwsException = true;
                chai.expect((error as Error).message).to.equal(api.database.accountFriend.CreateError.ALREADY_EXISTS);
            }
            chai.expect(throwsException).to.equal(true);
        });
        it("get all from account", async () => {
            await api.database.reset(databasePath);
            const accountId1 = await api.database.account.create(databasePath, {
                name: "TestUser",
                password: "password"
            });
            const accountIdFriend1 = await api.database.account.create(databasePath, {
                name: "TestUserFriend1",
                password: "passwordFriend1"
            });
            const accountIdFriend2 = await api.database.account.create(databasePath, {
                name: "TestUserFriend2",
                password: "passwordFriend2"
            });

            const accountFriendId1 = await api.database.accountFriend.create(databasePath, accountId1, {
                accountId: accountId1,
                friendAccountId: accountIdFriend1
            });
            const accountFriendId2 = await api.database.accountFriend.create(databasePath, accountId1, {
                accountId: accountId1,
                friendAccountId: accountIdFriend2
            });

            const friendsAccountId1 = await api.database.accountFriend.getAllFromAccount(databasePath, accountId1, {
                id: accountId1
            });
            chai.expect(friendsAccountId1.length).to.equal(2);
            chai.expect(friendsAccountId1[0].friendAccountId).to.be.a("number");
            chai.expect(friendsAccountId1[1].friendAccountId).to.be.a("number");
            chai.expect(friendsAccountId1.find(a => a.id === accountFriendId1)).to.not.equal(undefined);
            chai.expect(friendsAccountId1.find(a => a.id === accountFriendId2)).to.not.equal(undefined);
            chai.expect(friendsAccountId1[0].friendAccountName).to.equal(undefined);
            chai.expect(friendsAccountId1[1].friendAccountName).to.equal(undefined);

            const friendsAccountId1Names = await api.database.accountFriend.getAllFromAccount(
                databasePath, accountId1, { getNames: true, id: accountId1 }
            );
            chai.expect(friendsAccountId1Names.length).to.equal(2);
            chai.expect(friendsAccountId1Names[0].friendAccountId).to.be.a("number");
            chai.expect(friendsAccountId1Names[1].friendAccountId).to.be.a("number");
            chai.expect(friendsAccountId1.find(a => a.id === accountFriendId1)).to.not.equal(undefined);
            chai.expect(friendsAccountId1.find(a => a.id === accountFriendId2)).to.not.equal(undefined);
            chai.expect(friendsAccountId1Names[0].friendAccountName).to.be.a("string");
            chai.expect(friendsAccountId1Names[1].friendAccountName).to.be.a("string");
        });
    });
};
