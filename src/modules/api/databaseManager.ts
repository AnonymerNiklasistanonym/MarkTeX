// import * as database from "./database";
import { promises as fs } from "fs";

/**
 * Check if database already exists.
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
 * Initialize/Load database.
 */
export const setupDatabase = async (): Promise<void> => {
    // TODO
};

/**
 * Create tables if not existing.
 */
export const setupTables = async (): Promise<void> => {
    // TODO
};


/**
 * Reset database (remove all existing data and repeat a setup).
 */
export const resetDatabase = async (): Promise<void> => {
    // TODO
};

/**
 * Export database data.
 */
export const exportDatabaseData = async (): Promise<void> => {
    // TODO
};

/**
 * Import database data.
 */
export const importDatabaseData = async (): Promise<void> => {
    // TODO
};
