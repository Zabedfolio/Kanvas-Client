import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const getDatabaseConfig = () => {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        // Connect to PostgreSQL database in production
        return new Pool({
            connectionString: dbUrl,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    const targetPath = path.resolve(process.cwd(), "../Kanvas-Server/db.sqlite3");
    const targetDir = path.dirname(targetPath);
    
    if (fs.existsSync(targetDir)) {
        return new Database(targetPath);
    }
    
    // Fallback: Use /tmp/db.sqlite3 since /tmp is writeable in Vercel serverless environments
    return new Database("/tmp/db.sqlite3");
};

export const auth = betterAuth({
    database: getDatabaseConfig(),
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
