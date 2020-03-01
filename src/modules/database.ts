export * from "./database/openDatabase";
export * from "./database/createDatabase";
// TODO Enable later when implemented: export * as queries from "./database/databaseQueries";
// For now use the following two lines
import * as queries from "./database/databaseQueries";
export { queries };
