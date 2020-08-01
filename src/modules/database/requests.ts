import { debuglog } from "util";
import { open } from "../database";
import sqlite3 from "sqlite3";
import { SqliteInternalError } from "./management";


const debug = debuglog("app-database-request");
const debugInternal = debuglog("app-database-request-internal");



/**
 * List of errors that can happen during a post request
 */
export enum ErrorCodePostRequest {
    /** Some column specification/constraint was violated */
    SQLITE_CONSTRAINT = "SQLITE_CONSTRAINT",
    /** Hard query error like a duplicated column or non existing column */
    SQLITE_ERROR = "SQLITE_ERROR"
}

/**
 * Check if an error is a database error.
 *
 * @param error A possible database error
 * @returns True if database error
 */
export const isDatabaseError = (error: any): boolean => {
    if (error !== undefined && (error as SqliteInternalError).code !== undefined) {
        if ((error as SqliteInternalError).code === ErrorCodePostRequest.SQLITE_CONSTRAINT) {
            return true;
        }
        if ((error as SqliteInternalError).code === ErrorCodePostRequest.SQLITE_ERROR) {
            return true;
        }
    }
    return false;
};

/**
 * Get one result from the database.
 *
 * @param databasePath Path to database
 * @param query The database query that should be run
 * @param parameters Optional values that are inserted for query `?` symbols
 * @returns Either undefined when no result or the found result
 */
export const getEach = async <DB_OUT extends { [key: string]: any }>(
    databasePath: string, query: string, parameters: (string|number)[] = []
): Promise<(DB_OUT|undefined)> => {
    debug(`Run query get each: "${query}"`);
    const db = await open(databasePath, { readOnly: true });
    db.on("trace", debugInternal);
    let requestedElement: DB_OUT;
    return new Promise((resolve, reject) => db.each(query, parameters,
        (err, row) => {
            if (err) {
                debug(`Database error each row: ${JSON.stringify(err)}`);
                reject(err);
            } else {
                requestedElement = row as DB_OUT;
            }
        },
        err => {
            if (err) {
                debug(`Database error each: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database error each close: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Run result each: "${JSON.stringify(requestedElement)}"`);
                resolve(requestedElement);
            });
        })
    );
};

/**
 * Get a list of results from the database.
 *
 * @param databasePath Path to database
 * @param query The database query that should be run
 * @param parameters Optional values that are inserted for query `?` symbols
 * @returns Either an empty list when no result or the found results
 */
export const getAll = async <DB_OUT extends { [key: string]: any }>(
    databasePath: string, query: string, parameters: (string|number)[] = []
): Promise<DB_OUT[]> => {
    debug(`Run query get all: "${query}"`);
    const db = await open(databasePath, { readOnly: true });
    db.on("trace", debugInternal);
    return new Promise((resolve, reject) => db.all(query, parameters,
        (err, rows) => {
            if (err) {
                debug(`Database error all: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database error all close: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Run result all: "${JSON.stringify(rows)}"`);
                resolve(rows);
            });
        })
    );
};

/**
 * Update something in database.
 *
 * @param databasePath Path to database
 * @param query The database query that should be run
 * @param parameters Optional values that are inserted for query `?` symbols
 * @returns Database update info
 */
export const post = async (
    databasePath: string, query: string, parameters: (string|number)[] = []
): Promise<sqlite3.RunResult> => {
    debug(`Run query post: "${query}"`);
    const db = await open(databasePath);
    db.on("trace", debugInternal);
    return new Promise((resolve, reject) => db.run(query, parameters,
        function (err) {
            if (err) {
                debug(`Database error post: ${JSON.stringify(err)}`);
            }
            db.close(errClose => {
                if (errClose) {
                    debug(`Database error post close: ${JSON.stringify(errClose)}`);
                }
                if (err || errClose) {
                    return reject(err ? err : errClose);
                }
                debug(`Post result: ${JSON.stringify(this)}`);
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
