import * as crypto from "crypto";


/**
 * Generates salt (a random string of characters of the given length).
 *
 * @param length Length of the salt
 * @returns Salt
 */
export const generateSalt = (length = 4096): string => {
    return crypto
        .randomBytes(Math.ceil(length / 2)) // Generate random bytes
        .toString("hex") // Convert string into the hexadecimal format
        .slice(0, length); // Slice the string to the wanted length of characters
};

/**
 * Generates a password hash.
 *
 * Get supported algorithms: `openssl list -digest-algorithms`
 *
 * @param password The password
 * @param salt Salt to make password hash more unique
 * @returns Password hash given the password and a salt
 */
export const generateHash = (password: string, salt: string): string => {
    return crypto
        .createHmac("sha512", salt)
        .update(password)
        .digest("hex");
};

/** Container for the hash and salt of a password. */
export interface HashAndSalt {
    /** Salt used to create password hash. */
    salt: string
    /** Hash of the password given a certain algorithm and salt. */
    hash: string
}

/**
 * Generates a password hash.
 *
 * @param password The password
 * @param saltLength Length of the salt used to create the password hash
 * @returns The password hash and the salt that was used to create it
 */
export const generateHashAndSalt = (password: string, saltLength = 4096): HashAndSalt => {
    const salt = generateSalt(saltLength);
    return { hash: generateHash(password, salt), salt };
};

/**
 * Checks if a password is correct compared to the original created password hash.
 *
 * @param password The password
 * @param hashAndSalt The hash and salt of the original password
 * @returns True if password correct, else False
 */
export const checkPassword = (password: string, hashAndSalt: HashAndSalt): boolean => {
    return generateHash(password, hashAndSalt.salt) === hashAndSalt.hash;
};

export default {
    checkPassword,
    generateHash,
    generateHashAndSalt,
    generateSalt
};
