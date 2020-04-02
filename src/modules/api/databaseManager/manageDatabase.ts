/* eslint-disable @typescript-eslint/require-await */
import * as database from "../../database";
import * as manageDatabaseSetup from "./setupDatabase";
import { promises as fs } from "fs";


/**
 * Check if database already exists.
 *
 * @param databasePath Path to database.
 */
export const exists = async (databasePath: string): Promise<boolean> => database.exists(databasePath);

/**
 * Initialize database if not existing.
 *
 * @param databasePath Path to database.
 */
export const create = async (databasePath: string): Promise<void> => {
    if (!await exists(databasePath)) {
        await database.create(databasePath);
        await manageDatabaseSetup.setupTables(databasePath);
        await manageDatabaseSetup.setupInitialData(databasePath);
    }
};

/**
 * Delete database (remove all existing data).
 *
 * @param databasePath Path to database.
 */
export const remove = async (databasePath: string): Promise<void> => {
    if (await exists(databasePath)) {
        await fs.unlink(databasePath);
    }
};

/**
 * Reset database (remove all existing data and repeat a setup).
 *
 * @param databasePath Path to database.
 */
export const reset = async (databasePath: string): Promise<void> => {
    if (await exists(databasePath)) {
        await remove(databasePath);
    }
    await create(databasePath);
};

/**
 * Export database data.
 *
 * @param databasePath Path to database.
 */
export const exportData = async (databasePath: string): Promise<void> => {
    // TODO
    throw Error("Not implemented");
};

/**
 * Import database data.
 *
 * @param databasePath Path to database.
 */
export const importData = async (databasePath: string): Promise<void> => {
    // TODO
    throw Error("Not implemented");
};
