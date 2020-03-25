/* eslint-disable @typescript-eslint/require-await */
import { promises as fs } from "fs";
import * as database from "../../database";
import * as manageDatabaseSetup from "./setupDatabase";

/**
 * Check if database already exists.
 *
 * @param databasePath Path to database.
 */
export const checkIfDatabaseExists = async (databasePath: string): Promise<boolean> => {
    try {
        await fs.access(databasePath);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Initialize database if not existing.
 *
 * @param databasePath Path to database.
 */
export const createDatabase = async (databasePath: string): Promise<void> => {
    if (!await checkIfDatabaseExists(databasePath)) {
        await database.createDatabase(databasePath);
        await manageDatabaseSetup.setupTables(databasePath);
        await manageDatabaseSetup.setupInitialData(databasePath);
    }
};

/**
 * Reset database (remove all existing data and repeat a setup).
 *
 * @param databasePath Path to database.
 */
export const resetDatabase = async (databasePath: string): Promise<void> => {
    if (await checkIfDatabaseExists(databasePath)) {
        await fs.unlink(databasePath);
    }
    await createDatabase(databasePath);
};

/**
 * Delete database (remove all existing data).
 *
 * @param databasePath Path to database.
 */
export const deleteDatabase = async (databasePath: string): Promise<void> => {
    if (await checkIfDatabaseExists(databasePath)) {
        await fs.unlink(databasePath);
    }
};

/**
 * Export database data.
 *
 * @param databasePath Path to database.
 */
export const exportDatabaseData = async (databasePath: string): Promise<void> => {
    // TODO
    throw Error("Not implemented");
};

/**
 * Import database data.
 *
 * @param databasePath Path to database.
 */
export const importDatabaseData = async (databasePath: string): Promise<void> => {
    // TODO
    throw Error("Not implemented");
};
