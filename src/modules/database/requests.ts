import { debuglog } from "util";
import { open } from "../database";
import sqlite3 from "sqlite3";


const debug = debuglog("app-database-request");


export enum ErrorCodePostRequest {
    SQLITE_ERROR = 1,
    SQLITE_CONSTRAINT = "SQLITE_CONSTRAINT"
}


export const isDatabaseError = (error: any): boolean => {
    if (error && error.code) {
        if (error.code === ErrorCodePostRequest.SQLITE_CONSTRAINT) {
            return true;
        }
    }
    return false;
};


export const getEach = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<any> => {

    const db = await open(dbNamePath);
    db.on("trace", debug);
    debug(`Run query get each: "${query}"`);
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
            if (err) {
                debug(`Database error: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database close error: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Run result: "${JSON.stringify(requestedElement)}"`);
                resolve(requestedElement);
            });
        })
    );
};

export const getAll = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<any[]> => {

    const db = await open(dbNamePath);
    db.on("trace", debug);
    debug(`Run query get all: "${query}"`);
    return new Promise((resolve, reject) => db.all(query, parameters,
        (err, rows) => {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database close error: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Run result: "${JSON.stringify(rows)}"`);
                resolve(rows);
            });
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
export const post = async (dbNamePath: string, query: string,
    parameters: (string|number)[] = []): Promise<sqlite3.RunResult> => {

    const db = await open(dbNamePath);
    db.on("trace", debug);
    debug(`Run query post: "${query}"`);
    return new Promise((resolve, reject) => db.run(query, parameters,
        function (err) {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database close error: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Database post result: ${JSON.stringify(this)}`);
                resolve(this);
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
