import { openDatabase } from "./openDatabase";
import * as sqlite3 from "sqlite3";
import { debuglog } from "util";

const debug = debuglog("app-database-request");

export const getEachRequest = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<any> => {

    const db = await openDatabase(dbNamePath);
    db.on("trace", debug);
    debug(`Run query: "${query}"`);
    let requestedElement: any;
    return new Promise((resolve, reject) => db.each(query, parameters,
        (err, row) => {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
                reject(err);
            } else {
                requestedElement = row;
            }
        },
        err => {
            let previousError = false;
            if (err) {
                previousError = true;
                debug(`Database error: ${JSON.stringify(err)}`);
                reject(err);
            }
            db.close(errClose => {
                if (!previousError && errClose) {
                    debug(`Database close error: ${JSON.stringify(errClose)}`);
                    reject(errClose);
                } else {
                    debug(`Run result: "${JSON.stringify(requestedElement)}"`);
                    resolve(requestedElement);
                }
            });
        })
    );
};

export const getAllRequest = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<any> => {

    const db = await openDatabase(dbNamePath);
    db.on("trace", debug);
    debug(`Run query: "${query}"`);
    return new Promise((resolve, reject) => db.all(query, parameters,
        (err, rows) => {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
                reject(err);
            } else {
                resolve(rows);
            }
        })
    );
};

/**
 * Edit something in database.
 *
 * @param dbNamePath Database path.
 * @param query Query for the database.
 * @param parameters Query data.
 * @returns Post result
 */
export const postRequest = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<sqlite3.RunResult> => {

    const db = await openDatabase(dbNamePath);
    db.on("trace", debug);
    debug(`Run query: "${query}"`);
    return new Promise((resolve, reject) => db.run(query, parameters,
        function (err) {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
                reject(err);
            } else {
                debug(`Database post result: ${JSON.stringify(this)}`);
                resolve(this);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database close error: ${JSON.stringify(errClose)}`);
                }
            });
        })
    );
};


//  /**
//   * Get something from the database
//   * @param {string} query Query for the database
//   * @param {*[]} parameters Parameter for safe query
//   * @returns {Promise<*[]>} Request list
//   */
//  static getAllRequest (query, parameters = []) {
//    return new Promise((resolve, reject) => this.databaseWrapper(true)
//      .then(database => {
//        // Debug database trace
//        database.on('trace', debugSqlite)
//        database.all(query, parameters,
//          (err, rows) => {
//            err ? reject(err) : resolve(rows)
//            database.close()
//            debug('getAllRequest resolved')
//          })
//      }).catch(reject))
//  }
//  /**
//   * Get if some column value exists in some table [Convenience method]
//   * @param {string} tableName Table name
//   * @param {string} column Column
//   * @param {(number|string)} value Column value
//   * @returns {Promise<boolean>} Exists
//   */
//  static getExists (tableName, column, value) {
//    return new Promise((resolve, reject) => this.getEachRequest(
//      DatabaseQueryCreator.exists(tableName, column),
//      [value]).then(result => { resolve(result.exists_value === 1) })
//      .catch(reject))
//  }
// }
//
// module.exports = DatabaseQueryRunner
