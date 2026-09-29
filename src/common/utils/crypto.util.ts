import { createHash, randomBytes } from "crypto";

export default class HashClass {

    private static readonly PEPPER = process.env.APP_KEY;

    public static makeHash(password: string, salt: string) {
        return createHash('sha256')
            .update(password + salt + HashClass.PEPPER)
            .digest('hex');
    };

    public static register(password: string, hashedPassword: string, salt: string): boolean {
        const hashPassword = createHash('sha256')
            .update(password + salt + HashClass.PEPPER)
            .digest('hex');

        return hashPassword === hashedPassword;
    };

    public static generateRandomSalt() {
        return randomBytes(16).toString('hex');
    };
};