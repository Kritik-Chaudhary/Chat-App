import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./db";

export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Failed to run database migrations:", error);
    throw error;
  }
}