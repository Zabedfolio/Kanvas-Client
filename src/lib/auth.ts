import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const getDatabaseInstance = () => {
    const targetPath = path.resolve(process.cwd(), "../Kanvas-Server/db.sqlite3");
    const targetDir = path.dirname(targetPath);
    
    if (fs.existsSync(targetDir)) {
        return new Database(targetPath);
    }
    
    // Fallback: Create a local directory inside the client workspace so build/CI does not crash
    const fallbackDir = path.resolve(process.cwd(), ".database");
    if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return new Database(path.join(fallbackDir, "db.sqlite3"));
};

export const auth = betterAuth({
    database: getDatabaseInstance(),
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
