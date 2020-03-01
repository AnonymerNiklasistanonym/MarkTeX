import { openDatabase } from "./openDatabase";
import * as sqlite3 from "sqlite3";

export const getEachRequest = async (dbNamePath: string, query: string,
    parameters = []): Promise<sqlite3.RunResult> => {

    const db = await openDatabase(dbNamePath);
    // TODO Debug database trace
    // db.on('trace', debugSqlite)
    let requestedElement: sqlite3.RunResult;
    return new Promise((resolve, reject) => db.each(query, parameters,
        (err, row) => {
            if (err) {
                reject(err);
            } else {
                requestedElement = row;
            }
        },
        err => {
            let previousError = false;
            if (err) {
                previousError = true;
                reject(err);
            }
            db.close(errClose => {
                if (!previousError && errClose) {
                    reject(errClose);
                } else {
                    resolve(requestedElement);
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
//   * Edit something in database
//   * @param {string} query Query for the database
//   * @param {*[]} parameters Query data (for better security)
//   * @returns {Promise<import('./index').RunResult>}
//   * Post result
//   */
//  static postRequest (query, parameters = []) {
//    return new Promise((resolve, reject) => this.databaseWrapper(false)
//      .then(database => {
//        // Debug database trace
//        database.on('trace', debugSqlite).serialize(() => database
//          .run('PRAGMA foreign_keys = ON;')
//          .run(query, parameters,
//            function (err) {
//              err ? reject(err) : resolve(this)
//              database.close()
//              debug('postRequest resolved ' + JSON.stringify(this))
//            }))
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
