import * as crypto from "crypto";

/**
 * Generates salt (a random string of characters of the given length)
 * @returns Salt
 */
export const generateSalt = (length = 4096): string => {
    return crypto
        .randomBytes(Math.ceil(length / 2)) // Generate random bytes
        .toString("hex") // Convert string into the hexadecimal format
        .slice(0, length); // Slice the string to the wanted length of characters
};

/**
 * Generates a password hash
 * Future hint: update hash algorithm >> get supported algorithms:
 * `openssl list -digest-algorithms`
 * @returns Hash
 */
export const generateHash = (password: string, salt: string): string => {
    return crypto
        .createHmac("sha512", salt)
        .update(password)
        .digest("hex");
};

export interface HashAndSalt {
    salt: string
    hash: string
}

/**
 * Generates a new password hash
 * @returns Salt and calculated hash
 */
export const generateHashAndSalt = (password: string, saltLength = 4096): HashAndSalt => {
    const salt = generateSalt(saltLength);
    return { salt, hash: generateHash(password, salt) };
};

/**
 * Checks if a password is correct
 * @returns Is password correct
 */
export const checkPassword = (password: string, hashAndSalt: HashAndSalt): boolean => {
    return generateHash(password, hashAndSalt.salt) === hashAndSalt.hash;
};
