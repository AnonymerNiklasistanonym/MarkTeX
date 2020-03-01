
import { UserOptions } from "./types/user";

/** REMOVE LATER WHEN IMPLEMENTATION FINISHED */
const timeout = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/** @returns Login was successful */
export const login = async (accountId: number, password: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`login with accountId='${accountId}' and password '${password}'`);
    await timeout(10);
    return false;
};

/** @returns Logout was successful */
export const logout = async (accountId: number): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`logout with accountId='${accountId}'`);
    await timeout(10);
    return false;
};

/** @returns Password change was successful */
export const changePassword = async (accountId: number, oldPassword: string, newPassword: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password old='${oldPassword}'|new='${newPassword}'`);
    await timeout(10);
    return false;
};

/** @returns Account deletion was successful */
export const deleteAccount = async (accountId: number, password: string): Promise<boolean> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password='${password}'`);
    await timeout(10);
    return false;
};

/** @returns Account id if creation was successful */
export const createAccount = async (accountId: number, password: string,
    options: UserOptions): Promise<number> => {
    // eslint-disable-next-line no-console
    console.log(`changePassword with accountId='${accountId}' and password='${password}' and options='${options}'`);
    await timeout(10);
    return 222;
};
