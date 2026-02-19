import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Supabase connection pooler uses port 6543 (Transaction mode)
// which requires prepare: false
const isPooler = connectionString.includes(":6543");

const client = postgres(connectionString, {
  prepare: isPooler ? false : true,
});
export const db = drizzle(client, { schema });

export type Database = typeof db;
