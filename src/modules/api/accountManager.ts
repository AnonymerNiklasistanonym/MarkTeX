
import * as user from "./types/user";

/**
 * REMOVE LATER WHEN IMPLEMENTATION FINISHED
 *
 * @param ms Time in ms
 */
const timeout = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * @returns Login was successful
 * @param accountId
 * @param password
 */
export const login = async (accountId: number, password: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`login with accountId='${accountId}' and password '${password}'`);
    await timeout(10);
    return false;
};

/**
 * @returns Logout was successful
 * @param accountId
 */
export const logout = async (accountId: number): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`logout with accountId='${accountId}'`);
    await timeout(10);
    return false;
};

/**
 * @returns Password change was successful
 * @param accountId
 * @param oldPassword
 * @param newPassword
 */
export const changePassword = async (accountId: number, oldPassword: string, newPassword: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password old='${oldPassword}'|new='${newPassword}'`);
    await timeout(10);
    return false;
};

/**
 * @returns Account deletion was successful
 * @param accountId
 * @param password
 */
export const deleteAccount = async (accountId: number, password: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password='${password}'`);
    await timeout(10);
    return false;
};

/**
 * @returns Account id if creation was successful
 * @param accountId
 * @param password
 * @param options
 */
export const createAccount = async (accountId: number, password: string,
    options: user.UserOptions): Promise<number> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password='${password}' and options='${options}'`);
    await timeout(10);
    return 222;
};
