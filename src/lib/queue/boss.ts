import { PgBoss } from "pg-boss";

// ─── pg-boss Singleton (worker only) ──────────────────
// This file should only be imported by the worker process
// and scripts — never by the Next.js web app on Vercel.
// The web app uses sendJob() from cascade.ts instead.

let boss: PgBoss | null = null;
let startPromise: Promise<PgBoss> | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;

  // Prevent multiple concurrent start() calls
  if (!startPromise) {
    startPromise = (async () => {
      const instance = new PgBoss({
        connectionString: process.env.DATABASE_URL!,
      });
      instance.on("error", (err: Error) => console.error("[pg-boss] Error:", err));
      await instance.start();
      boss = instance;
      return instance;
    })();
  }

  return startPromise;
}
