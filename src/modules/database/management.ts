import * as sqlite3 from "sqlite3";
import { promises as fs } from "fs";


// TODO Think about database error codes


export enum ErrorCodeOpen {
    SQLITE_CANTOPEN = "SQLITE_CANTOPEN"
}

export interface OpenDatabaseOptions {
    readOnly?: boolean
}

export const open = async (dbNamePath: string, options?: OpenDatabaseOptions): Promise<sqlite3.Database> => {
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

export enum CreateDatabaseErrorCode {
    SQLITE_MISUSE = "SQLITE_MISUSE"
}

export const create = async (dbNamePath: string): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-bitwise
        const db = new sqlite3.Database(dbNamePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
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

export const remove = async (dbNamePath: string): Promise<void> => {
    try {
        await fs.access(dbNamePath);
        await fs.unlink(dbNamePath);
    } catch (error) {
        // File does not exist
    }
};

export const exists = async (dbNamePath: string): Promise<boolean> => {
    try {
        await fs.access(dbNamePath);
        return true;
    } catch (error) {
        // File does not exist
        return false;
    }
};
