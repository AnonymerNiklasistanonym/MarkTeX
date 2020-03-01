import * as sqlite3 from "sqlite3";

// TODO Think about database error codes
export enum DatabaseErrorCodes {
    SQLITE_ERROR = 1,
    SQLITE_CONSTRAINT = 2
}

export enum OpenDatabaseErrorCode {
    SQLITE_CANTOPEN = "SQLITE_CANTOPEN"
}

export interface OpenDatabaseOptions {
    readOnly?: boolean
}

export const openDatabase = async (dbNamePath: string, options?: OpenDatabaseOptions): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
        const sqliteOpenMode = (options !== undefined && options.readOnly)
            ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;
        const db = new sqlite3.Database(dbNamePath, sqliteOpenMode, err => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
                // TODO Enable WAL-MODE (Write-Ahead Logging) for concurrent access:
                // https://sqlite.org/wal.html
                // TODO Also enable foreign keys?
                // db.run('PRAGMA journal_mode = WAL;PRAGMA foreign_keys = ON;',
                //     err2 => { err2 ? reject(err2) : resolve(db) })
                // }

            }
        });
    });
};
