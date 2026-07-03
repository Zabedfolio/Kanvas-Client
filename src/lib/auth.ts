import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
    database: new Database("../Kanvas-Server/db.sqlite3"),
    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ password, hash }: { password: string; hash: string }) => {
                return await bcrypt.compare(password, hash);
            }
        }
    },
});
