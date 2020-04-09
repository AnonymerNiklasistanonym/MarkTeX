import databaseManagement from "./database/management";
import databaseQueries from "./database/queries";
import databaseRequests from "./database/requests";
import { describe } from "mocha";
import os from "os";
import path from "path";


describe("database", () => {
    const databasePath = path.join(os.tmpdir(), "test.db");

    databaseManagement(databasePath);
    databaseQueries();
    databaseRequests(databasePath);
});
